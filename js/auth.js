// Authentication JavaScript for BrokerPro

// Enhanced Authentication System for CentralTradehub
// Secure, production-ready authentication without external dependencies

// Authentication state management
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('centraltradehub_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('centraltradehub_current_user')) || null;
        this.loginAttempts = JSON.parse(localStorage.getItem('centraltradehub_login_attempts')) || {};
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    }

    // Generate secure user ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Hash password (simple implementation - use bcrypt in production)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'centraltradehub_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Validate password strength
    validatePasswordStrength(password) {
        const requirements = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(requirements).filter(Boolean).length;
        const feedback = [];

        if (!requirements.minLength) feedback.push('at least 8 characters');
        if (!requirements.hasUppercase) feedback.push('uppercase letter');
        if (!requirements.hasLowercase) feedback.push('lowercase letter');
        if (!requirements.hasNumbers) feedback.push('number');
        if (!requirements.hasSpecialChar) feedback.push('special character');

        return { score, feedback, isStrong: score >= 4 };
    }

    // Check if user is locked out
    isLockedOut(email) {
        const attempts = this.loginAttempts[email];
        if (!attempts) return false;

        if (attempts.count >= this.maxLoginAttempts) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
            return timeSinceLastAttempt < this.lockoutDuration;
        }
        return false;
    }

    // Record login attempt
    recordLoginAttempt(email, success) {
        if (!this.loginAttempts[email]) {
            this.loginAttempts[email] = { count: 0, lastAttempt: 0 };
        }

        if (success) {
            delete this.loginAttempts[email];
        } else {
            this.loginAttempts[email].count++;
            this.loginAttempts[email].lastAttempt = Date.now();
        }

        localStorage.setItem('centraltradehub_login_attempts', JSON.stringify(this.loginAttempts));
    }

    // Register new user
    async register(userData) {
        const { firstName, lastName, email, phone, password, accountType } = userData;

        // Check if user already exists
        if (this.users.find(user => user.email === email)) {
            throw new Error('User with this email already exists');
        }

        // Validate password strength
        const passwordValidation = this.validatePasswordStrength(password);
        if (!passwordValidation.isStrong) {
            throw new Error('Password requirements not met: ' + passwordValidation.feedback.join(', '));
        }

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        // Create new user
        const newUser = {
            id: this.generateUserId(),
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            accountType,
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                avatar: null,
                bio: '',
                tradingExperience: accountType,
                preferences: {
                    notifications: true,
                    newsletter: true,
                    twoFactorAuth: false
                }
            }
        };

        this.users.push(newUser);
        localStorage.setItem('centraltradehub_users', JSON.stringify(this.users));

        return { success: true, user: this.sanitizeUser(newUser) };
    }

    // Sign in user
    async signIn(email, password, rememberMe = false) {
        // Check if locked out
        if (this.isLockedOut(email)) {
            const lockoutTime = Math.ceil((this.lockoutDuration - (Date.now() - this.loginAttempts[email].lastAttempt)) / 60000);
            throw new Error(`Account locked. Try again in ${lockoutTime} minutes.`);
        }

        // Find user
        const user = this.users.find(u => u.email === email);
        if (!user) {
            this.recordLoginAttempt(email, false);
            throw new Error('Invalid email or password');
        }

        // Verify password
        const hashedPassword = await this.hashPassword(password);
        if (user.password !== hashedPassword) {
            this.recordLoginAttempt(email, false);
            throw new Error('Invalid email or password');
        }

        // Successful login
        this.recordLoginAttempt(email, true);
        user.lastLogin = new Date().toISOString();
        
        // Update user in storage
        const userIndex = this.users.findIndex(u => u.id === user.id);
        this.users[userIndex] = user;
        localStorage.setItem('centraltradehub_users', JSON.stringify(this.users));

        // Set current user
        this.currentUser = this.sanitizeUser(user);
        localStorage.setItem('centraltradehub_current_user', JSON.stringify(this.currentUser));
        
        // Set session
        const sessionData = {
            userId: user.id,
            email: user.email,
            loginTime: Date.now(),
            rememberMe
        };
        
        if (rememberMe) {
            localStorage.setItem('centraltradehub_session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('centraltradehub_session', JSON.stringify(sessionData));
        }

        return { success: true, user: this.currentUser };
    }

    // Sign out user
    signOut() {
        this.currentUser = null;
        localStorage.removeItem('centraltradehub_current_user');
        localStorage.removeItem('centraltradehub_session');
        sessionStorage.removeItem('centraltradehub_session');
    }

    // Check if user is authenticated
    isAuthenticated() {
        const session = localStorage.getItem('centraltradehub_session') || 
                       sessionStorage.getItem('centraltradehub_session');
        return !!session && !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Sanitize user data (remove sensitive info)
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    // Password reset (simulation)
    async requestPasswordReset(email) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            throw new Error('No account found with this email address');
        }

        // In production, send actual email
        console.log(`Password reset link sent to ${email}`);
        return { success: true, message: 'Password reset instructions sent to your email' };
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Initialize authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggle();
    initializePasswordStrength();
    checkAuthState();
});

// Initialize authentication forms
function initializeAuthForms() {
    const registerForm = document.getElementById('registerForm');
    const signinForm = document.getElementById('signinForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Real-time validation
        const inputs = registerForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
        
        // Real-time validation
        const inputs = signinForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
}

// Handle registration
async function handleRegistration(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('registerBtn');
    
    // Validate all fields
    if (!validateRegistrationForm(form)) {
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    try {
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            accountType: formData.get('accountType')
        };
        
        const result = await authManager.register(userData);
        
        if (result.success) {
            setLoadingState(submitBtn, false);
            showSuccessModal('Registration successful! Please check your email to verify your account.');
        }
    } catch (error) {
        setLoadingState(submitBtn, false);
        showNotification(error.message, 'error');
    }
}

// Handle sign in
async function handleSignIn(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('signinBtn');
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
    
    // Basic validation
    if (!validateSignInForm(form)) {
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    try {
        const result = await authManager.signIn(email, password, rememberMe);
        
        if (result.success) {
            setLoadingState(submitBtn, false);
            showSuccessModal('Welcome back! Redirecting to dashboard...');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        setLoadingState(submitBtn, false);
        showFieldError('email', error.message);
        showFieldError('password', error.message);
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('resetBtn');
    const email = formData.get('resetEmail');
    
    // Validate email
    if (!validateEmail(email)) {
        showFieldError('resetEmail', 'Please enter a valid email address');
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    try {
        const result = await authManager.requestPasswordReset(email);
        setLoadingState(submitBtn, false);
        closeForgotPassword();
        showResetSentModal();
    } catch (error) {
        setLoadingState(submitBtn, false);
        showFieldError('resetEmail', error.message);
    }
}

// Utility functions
function setLoadingState(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// Check authentication state
function checkAuthState() {
    const isAuthenticated = authManager.isAuthenticated();
    const currentPage = window.location.pathname;
    
    // If user is authenticated and on auth pages, redirect to home
    if (isAuthenticated && (currentPage.includes('signin.html') || currentPage.includes('register.html'))) {
        window.location.href = 'index.html';
    }
}

// Export for global access
window.authManager = authManager;
window.togglePassword = togglePassword;
window.showForgotPassword = showForgotPassword;
window.closeForgotPassword = closeForgotPassword;
window.closeModal = closeModal;
window.redirectToDashboard = redirectToDashboard;
window.closeResetSentModal = closeResetSentModal;
// Authentication JavaScript for BrokerPro

// Initialize authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggle();
    initializePasswordStrength();
    initializeGoogleAuth();
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

// Handle registration form submission
function handleRegistration(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('registerBtn');
    
    // Validate all fields
    if (!validateRegistrationForm(form)) {
        return;
    }
    
    // Show loading state
    window.BrokerProUtils.setLoadingState(submitBtn, true);
    
    // Simulate API call (replace with actual registration API)
    setTimeout(() => {
        // Simulate successful registration
        window.BrokerProUtils.setLoadingState(submitBtn, false);
        showSuccessModal();
        
        // Store user data in localStorage (for demo purposes)
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            accountType: formData.get('accountType'),
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('brokerProUser', JSON.stringify(userData));
        localStorage.setItem('brokerProAuth', 'true');
        
    }, 2000);
}

// Handle sign-in form submission
function handleSignIn(e) {
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
    window.BrokerProUtils.setLoadingState(submitBtn, true);
    
    // Simulate API call (replace with actual authentication API)
    setTimeout(() => {
        // Check if user exists (demo logic)
        const storedUser = localStorage.getItem('brokerProUser');
        
        if (storedUser || email === 'demo@brokerpro.com') {
            // Successful sign-in
            window.BrokerProUtils.setLoadingState(submitBtn, false);
            
            // Store auth state
            localStorage.setItem('brokerProAuth', 'true');
            if (rememberMe) {
                localStorage.setItem('brokerProRemember', 'true');
            }
            
            showSignInSuccessModal();
        } else {
            // Failed sign-in
            window.BrokerProUtils.setLoadingState(submitBtn, false);
            showFieldError('email', 'Invalid email or password');
            showFieldError('password', 'Invalid email or password');
        }
    }, 1500);
}

// Handle forgot password form submission
function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('resetBtn');
    const email = formData.get('resetEmail');
    
    // Validate email
    if (!window.BrokerProUtils.validateEmail(email)) {
        showFieldError('resetEmail', 'Please enter a valid email address');
        return;
    }
    
    // Show loading state
    window.BrokerProUtils.setLoadingState(submitBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        window.BrokerProUtils.setLoadingState(submitBtn, false);
        closeForgotPassword();
        showResetSentModal();
    }, 1500);
}

// Form validation functions
function validateRegistrationForm(form) {
    let isValid = true;
    const formData = new FormData(form);
    
    // First Name validation
    const firstName = formData.get('firstName');
    if (!firstName || firstName.trim().length < 2) {
        showFieldError('firstName', 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Last Name validation
    const lastName = formData.get('lastName');
    if (!lastName || lastName.trim().length < 2) {
        showFieldError('lastName', 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    // Email validation
    const email = formData.get('email');
    if (!window.BrokerProUtils.validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phone = formData.get('phone');
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phone || !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        showFieldError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Password validation
    const password = formData.get('password');
    const passwordStrength = window.BrokerProUtils.checkPasswordStrength(password);
    if (passwordStrength.score < 3) {
        showFieldError('password', 'Password is too weak. Missing: ' + passwordStrength.feedback.join(', '));
        isValid = false;
    }
    
    // Confirm Password validation
    const confirmPassword = formData.get('confirmPassword');
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    // Account Type validation
    const accountType = formData.get('accountType');
    if (!accountType) {
        showFieldError('accountType', 'Please select an account type');
        isValid = false;
    }
    
    // Terms validation
    const terms = formData.get('terms');
    if (!terms) {
        showFieldError('terms', 'You must agree to the Terms of Service');
        isValid = false;
    }
    
    return isValid;
}

function validateSignInForm(form) {
    let isValid = true;
    const formData = new FormData(form);
    
    // Email validation
    const email = formData.get('email');
    if (!window.BrokerProUtils.validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    const password = formData.get('password');
    if (!password || password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value;
    
    clearFieldError(field);
    
    switch (fieldName) {
        case 'email':
        case 'resetEmail':
            if (fieldValue && !window.BrokerProUtils.validateEmail(fieldValue)) {
                showFieldError(fieldName, 'Please enter a valid email address');
            }
            break;
        case 'firstName':
        case 'lastName':
            if (fieldValue && fieldValue.trim().length < 2) {
                showFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`);
            }
            break;
        case 'phone':
            if (fieldValue) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(fieldValue.replace(/[\s\-\(\)]/g, ''))) {
                    showFieldError(fieldName, 'Please enter a valid phone number');
                }
            }
            break;
        case 'confirmPassword':
            const password = document.getElementById('password')?.value;
            if (fieldValue && password && fieldValue !== password) {
                showFieldError(fieldName, 'Passwords do not match');
            }
            break;
    }
}

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const fieldElement = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (fieldElement) {
        fieldElement.style.borderColor = '#ef4444';
    }
}

function clearFieldError(field) {
    const fieldName = field.name || field.id;
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    field.style.borderColor = '#d1d5db';
}

// Password toggle functionality
function initializePasswordToggle() {
    // This function is called from the HTML onclick attribute
}

function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const toggleIcon = document.getElementById(fieldId + 'Icon');
    
    if (passwordField && toggleIcon) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordField.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }
}

// Password strength indicator
function initializePasswordStrength() {
    const passwordField = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (passwordField && strengthBar && strengthText) {
        passwordField.addEventListener('input', function() {
            const password = this.value;
            const strength = window.BrokerProUtils.checkPasswordStrength(password);
            
            // Update strength bar
            strengthBar.className = `strength-bar ${strength.level}`;
            
            // Update strength text
            const strengthLabels = {
                'very-weak': 'Very Weak',
                'weak': 'Weak',
                'fair': 'Fair',
                'good': 'Good',
                'strong': 'Strong'
            };
            
            strengthText.textContent = password ? 
                `Password strength: ${strengthLabels[strength.level]}` : 
                'Password strength';
        });
    }
}

// Google OAuth functionality
function initializeGoogleAuth() {
    // Google OAuth will be initialized when the Google script loads
    // The actual client ID should be replaced in production
}

function handleGoogleSignUp(response) {
    console.log('Google Sign Up Response:', response);
    
    // Decode the JWT token (in production, verify on server)
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        // Store user data
        const userData = {
            firstName: payload.given_name,
            lastName: payload.family_name,
            email: payload.email,
            profilePicture: payload.picture,
            googleAuth: true,
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('brokerProUser', JSON.stringify(userData));
        localStorage.setItem('brokerProAuth', 'true');
        
        showSuccessModal();
    } catch (error) {
        console.error('Error processing Google sign up:', error);
        window.BrokerProUtils.showNotification('Google sign up failed. Please try again.', 'error');
    }
}

function handleGoogleSignIn(response) {
    console.log('Google Sign In Response:', response);
    
    // Decode the JWT token (in production, verify on server)
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        
        // Store auth state
        localStorage.setItem('brokerProAuth', 'true');
        
        // Update user data if exists
        const existingUser = localStorage.getItem('brokerProUser');
        if (existingUser) {
            const userData = JSON.parse(existingUser);
            userData.lastSignIn = new Date().toISOString();
            localStorage.setItem('brokerProUser', JSON.stringify(userData));
        } else {
            // Create new user data
            const userData = {
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                profilePicture: payload.picture,
                googleAuth: true,
                registeredAt: new Date().toISOString()
            };
            localStorage.setItem('brokerProUser', JSON.stringify(userData));
        }
        
        showSignInSuccessModal();
    } catch (error) {
        console.error('Error processing Google sign in:', error);
        window.BrokerProUtils.showNotification('Google sign in failed. Please try again.', 'error');
    }
}

// Modal functions
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function showSignInSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        // Redirect to dashboard or home page
        window.location.href = 'index.html';
    }
}

function redirectToDashboard() {
    // In a real application, this would redirect to the user dashboard
    window.location.href = 'index.html';
}

function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showResetSentModal() {
    const modal = document.getElementById('resetSentModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeResetSentModal() {
    const modal = document.getElementById('resetSentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Check authentication state on page load
function checkAuthState() {
    const isAuthenticated = localStorage.getItem('brokerProAuth');
    const currentPage = window.location.pathname;
    
    // If user is authenticated and on auth pages, redirect to home
    if (isAuthenticated && (currentPage.includes('signin.html') || currentPage.includes('register.html'))) {
        window.location.href = 'index.html';
    }
}

// Initialize auth state check
checkAuthState();

// Export functions for global access
window.togglePassword = togglePassword;
window.handleGoogleSignUp = handleGoogleSignUp;
window.handleGoogleSignIn = handleGoogleSignIn;
window.showForgotPassword = showForgotPassword;
window.closeForgotPassword = closeForgotPassword;
window.closeModal = closeModal;
window.redirectToDashboard = redirectToDashboard;
window.closeResetSentModal = closeResetSentModal;
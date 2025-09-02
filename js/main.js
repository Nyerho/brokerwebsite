// Main JavaScript for BrokerPro Website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeContactForm();
    initializeTradingData(); // Add trading data initialization here
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(0, 0, 0, 0.98)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
        }
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize animations and scroll effects
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .stat-item, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                showNotification('Message sent successfully!', 'success');
                this.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }, 2000);
        });
    }
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            font-size: 14px;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Utility functions for other scripts
window.BrokerProUtils = {
    showNotification,
    
    // Form validation helper
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Password strength checker
    checkPasswordStrength: function(password) {
        let strength = 0;
        let feedback = [];
        
        if (password.length >= 8) strength += 1;
        else feedback.push('At least 8 characters');
        
        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('Lowercase letter');
        
        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('Uppercase letter');
        
        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('Number');
        
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else feedback.push('Special character');
        
        const levels = ['very-weak', 'weak', 'fair', 'good', 'strong'];
        return {
            score: strength,
            level: levels[strength] || 'very-weak',
            feedback: feedback
        };
    },
    
    // Loading state helper
    setLoadingState: function(button, loading = true) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-block';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.BrokerProUtils;
}


// Real-time price updates (demo data - replace with actual API)
function updatePrices() {
    console.log('Updating prices...'); // Debug log
    const pairs = [
        { id: 'eurusd', base: 1.08213, symbol: 'EUR/USD' },
        { id: 'gbpusd', base: 1.26701, symbol: 'GBP/USD' },
        { id: 'usdchf', base: 0.88138, symbol: 'USD/CHF' },
        { id: 'btcusd', base: 43250, symbol: 'BTC/USD' }
    ];
    
    pairs.forEach(pair => {
        const variation = (Math.random() - 0.5) * 0.01;
        const newPrice = pair.id === 'btcusd' ? 
            Math.round(pair.base + (variation * pair.base)) : 
            (pair.base + variation).toFixed(5);
        const changePercent = (variation / pair.base * 100).toFixed(2);
        
        // Update main dashboard
        const priceElement = document.getElementById(`${pair.id}-price`);
        const changeElement = document.getElementById(`${pair.id}-change`);
        const cardElement = document.getElementById(`${pair.id}-card`);
        
        console.log(`Updating ${pair.id}:`, { priceElement, changeElement, cardElement }); // Debug log
        
        if (priceElement && changeElement && cardElement) {
            priceElement.textContent = newPrice;
            changeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
            
            // Update card styling based on change
            cardElement.className = `price-card ${changePercent > 0 ? 'positive' : 'negative'}`;
            changeElement.className = `change ${changePercent > 0 ? 'positive' : 'negative'}`;
        } else {
            console.log(`Elements not found for ${pair.id}`);
        }
        
        // Update mini dashboard (signin page)
        const miniPriceElement = document.getElementById(`mini-${pair.id}-price`);
        const miniChangeElement = document.getElementById(`mini-${pair.id}-change`);
        const miniCardElement = document.getElementById(`mini-${pair.id}-card`);
        
        if (miniPriceElement && miniChangeElement && miniCardElement) {
            miniPriceElement.textContent = newPrice;
            miniChangeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
            miniChangeElement.className = `mini-change ${changePercent > 0 ? 'positive' : 'negative'}`;
        }
        
        // Update register page mini dashboard
        const regMiniPriceElement = document.getElementById(`reg-mini-${pair.id}-price`);
        const regMiniChangeElement = document.getElementById(`reg-mini-${pair.id}-change`);
        const regMiniCardElement = document.getElementById(`reg-mini-${pair.id}-card`);
        
        if (regMiniPriceElement && regMiniChangeElement && regMiniCardElement) {
            regMiniPriceElement.textContent = newPrice;
            regMiniChangeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
            regMiniChangeElement.className = `mini-change ${changePercent > 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Initialize real-time updates
function initializeTradingData() {
    console.log('Initializing trading data...'); // Debug log
    // Call updatePrices immediately
    setTimeout(updatePrices, 100); // Small delay to ensure DOM is ready
    // Then set interval for regular updates
    setInterval(updatePrices, 5000); // Update every 5 seconds
}
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


// Enhanced real-time trading data with portfolio tracking
function updatePrices() {
    console.log('Updating enhanced trading data...');
    const pairs = [
        { id: 'eurusd', base: 1.08213, symbol: 'EUR/USD', volume: '2.1B' },
        { id: 'gbpusd', base: 1.26701, symbol: 'GBP/USD', volume: '1.8B' },
        { id: 'usdchf', base: 0.88138, symbol: 'USD/CHF', volume: '890M' },
        { id: 'btcusd', base: 43250, symbol: 'BTC/USD', volume: '15.2B' },
        { id: 'ethusd', base: 2650, symbol: 'ETH/USD', volume: '8.7B' },
        { id: 'xauusd', base: 2018.50, symbol: 'XAU/USD', volume: '4.2B' }
    ];
    
    pairs.forEach(pair => {
        const variation = (Math.random() - 0.5) * 0.02; // Increased volatility
        const newPrice = pair.id.includes('usd') && (pair.id === 'btcusd' || pair.id === 'ethusd') ? 
            Math.round(pair.base + (variation * pair.base)) : 
            (pair.base + variation).toFixed(pair.id === 'xauusd' ? 2 : 5);
        const changePercent = (variation / pair.base * 100).toFixed(2);
        
        // Update main dashboard with enhanced data
        updatePriceElements(pair.id, newPrice, changePercent, pair.volume);
        
        // Update portfolio tracking
        updatePortfolioData(pair.id, newPrice, changePercent);
    });
    
    // Update market sentiment
    updateMarketSentiment();
    
    // Update trading statistics
    updateTradingStats();
}

// Enhanced price element updates with volume data
function updatePriceElements(pairId, price, changePercent, volume) {
    const priceElement = document.getElementById(`${pairId}-price`);
    const changeElement = document.getElementById(`${pairId}-change`);
    const cardElement = document.getElementById(`${pairId}-card`);
    const volumeElement = document.getElementById(`${pairId}-volume`);
    
    if (priceElement && changeElement && cardElement) {
        priceElement.textContent = price;
        changeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
        
        // Enhanced styling with animation
        cardElement.className = `price-card ${changePercent > 0 ? 'positive' : 'negative'}`;
        changeElement.className = `change ${changePercent > 0 ? 'positive' : 'negative'}`;
        
        // Add flash effect for price changes
        cardElement.style.animation = 'priceFlash 0.5s ease';
        setTimeout(() => {
            cardElement.style.animation = '';
        }, 500);
        
        // Update volume if element exists
        if (volumeElement) {
            volumeElement.textContent = volume;
        }
    }
}

// Portfolio tracking functionality
function updatePortfolioData(pairId, price, changePercent) {
    const portfolioElement = document.getElementById('portfolio-value');
    const portfolioPnlElement = document.getElementById('portfolio-pnl');
    
    if (portfolioElement && portfolioPnlElement) {
        // Simulate portfolio calculations
        const baseValue = 125000;
        const portfolioChange = (Math.random() - 0.4) * 0.05; // Slight positive bias
        const newValue = baseValue + (portfolioChange * baseValue);
        const pnl = newValue - baseValue;
        
        portfolioElement.textContent = `$${newValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        portfolioPnlElement.textContent = `${pnl > 0 ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        portfolioPnlElement.className = `portfolio-pnl ${pnl > 0 ? 'positive' : 'negative'}`;
    }
}

// Market sentiment indicator
function updateMarketSentiment() {
    const sentimentElement = document.getElementById('market-sentiment');
    const sentimentValueElement = document.getElementById('sentiment-value');
    
    if (sentimentElement && sentimentValueElement) {
        const sentiment = Math.random();
        let sentimentText, sentimentClass;
        
        if (sentiment > 0.6) {
            sentimentText = 'Bullish';
            sentimentClass = 'bullish';
        } else if (sentiment < 0.4) {
            sentimentText = 'Bearish';
            sentimentClass = 'bearish';
        } else {
            sentimentText = 'Neutral';
            sentimentClass = 'neutral';
        }
        
        sentimentValueElement.textContent = sentimentText;
        sentimentElement.className = `sentiment-indicator ${sentimentClass}`;
    }
}

// Trading statistics updates
function updateTradingStats() {
    const statsElements = {
        'active-trades': Math.floor(Math.random() * 50) + 150,
        'daily-volume': `$${(Math.random() * 50 + 200).toFixed(1)}M`,
        'success-rate': `${(Math.random() * 20 + 65).toFixed(1)}%`,
        'avg-spread': `${(Math.random() * 0.5 + 0.8).toFixed(1)} pips`
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Initialize enhanced trading data
function initializeTradingData() {
    console.log('Initializing enhanced trading dashboard...');
    
    // Initialize portfolio tracking
    initializePortfolioTracking();
    
    // Initialize market alerts
    initializeMarketAlerts();
    
    // Start real-time updates
    setTimeout(updatePrices, 100);
    setInterval(updatePrices, 3000); // Update every 3 seconds for more dynamic feel
    
    // Initialize trading notifications
    setTimeout(() => {
        showTradingNotification('Market data connected successfully', 'success');
    }, 1000);
}

// Portfolio tracking initialization
function initializePortfolioTracking() {
    const portfolioData = {
        totalValue: 125000,
        dayChange: 2.45,
        positions: [
            { symbol: 'EUR/USD', size: 50000, pnl: 245.50 },
            { symbol: 'GBP/USD', size: 30000, pnl: -123.25 },
            { symbol: 'BTC/USD', size: 0.5, pnl: 1250.00 }
        ]
    };
    
    // Store portfolio data globally for updates
    window.portfolioData = portfolioData;
}

// Market alerts system
function initializeMarketAlerts() {
    const alerts = [
        { pair: 'EUR/USD', type: 'resistance', level: 1.0850 },
        { pair: 'BTC/USD', type: 'support', level: 42000 },
        { pair: 'XAU/USD', type: 'breakout', level: 2020 }
    ];
    
    // Check alerts periodically
    setInterval(() => {
        checkMarketAlerts(alerts);
    }, 10000);
}

// Check and trigger market alerts
function checkMarketAlerts(alerts) {
    alerts.forEach(alert => {
        if (Math.random() > 0.95) { // 5% chance to trigger alert
            showTradingNotification(
                `${alert.pair} ${alert.type} at ${alert.level}`,
                'warning'
            );
        }
    });
}

// Enhanced trading notifications
function showTradingNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `trading-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}
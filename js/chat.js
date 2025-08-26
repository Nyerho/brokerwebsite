// Live Chat Widget Functionality
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messageCount = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAutomatedResponses();
        this.startTypingSimulation();
    }

    bindEvents() {
        const chatToggle = document.getElementById('chatToggle');
        const chatWidget = document.getElementById('chatWidget');
        const closeBtn = document.getElementById('closeChat');
        const minimizeBtn = document.getElementById('minimizeChat');
        const sendBtn = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        const quickBtns = document.querySelectorAll('.quick-btn');

        // Toggle chat widget
        chatToggle.addEventListener('click', () => this.toggleChat());
        
        // Close chat
        closeBtn.addEventListener('click', () => this.closeChat());
        
        // Minimize chat
        minimizeBtn.addEventListener('click', () => this.minimizeChat());
        
        // Send message
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Quick action buttons
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                this.sendUserMessage(message);
            });
        });
    }

    toggleChat() {
        const chatWidget = document.getElementById('chatWidget');
        const chatToggle = document.getElementById('chatToggle');
        const badge = document.getElementById('chatBadge');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            chatWidget.classList.add('active');
            chatToggle.style.display = 'none';
            badge.style.display = 'none';
            this.isOpen = true;
            
            // Focus on input
            setTimeout(() => {
                document.getElementById('chatInput').focus();
            }, 300);
        }
    }

    closeChat() {
        const chatWidget = document.getElementById('chatWidget');
        const chatToggle = document.getElementById('chatToggle');
        
        chatWidget.classList.remove('active');
        chatToggle.style.display = 'flex';
        this.isOpen = false;
        this.isMinimized = false;
    }

    minimizeChat() {
        const chatWidget = document.getElementById('chatWidget');
        const chatToggle = document.getElementById('chatToggle');
        
        if (this.isMinimized) {
            chatWidget.style.height = '500px';
            this.isMinimized = false;
        } else {
            chatWidget.style.height = '60px';
            this.isMinimized = true;
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.sendUserMessage(message);
            input.value = '';
        }
    }

    sendUserMessage(message) {
        this.addMessage(message, 'user');
        this.showTypingIndicator();
        
        // Simulate response delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateBotResponse(message);
        }, 1500 + Math.random() * 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'flex';
        
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'none';
    }

    generateBotResponse(userMessage) {
        const responses = this.getAutomatedResponse(userMessage.toLowerCase());
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(response, 'bot');
    }

    setupAutomatedResponses() {
        this.responses = {
            greeting: [
                "Hello! Welcome to BrokerPro. I'm here to help you with any questions about our trading platform.",
                "Hi there! Thanks for visiting BrokerPro. How can I assist you today?",
                "Welcome! I'm your virtual assistant. Feel free to ask me anything about our services."
            ],
            account: [
                "To set up your account, click 'Sign Up' in the top menu. You'll need a valid email and phone number for verification.",
                "Account setup is quick and easy! Just provide your basic information and verify your identity. The process typically takes 5-10 minutes.",
                "You can create an account in just a few steps. We'll guide you through identity verification and funding options."
            ],
            trading: [
                "Getting started with trading is simple! Once your account is verified, you can deposit funds and start trading stocks, crypto, or forex.",
                "We offer commission-free stock trading, 50+ cryptocurrencies, and 40+ forex pairs. Our platform includes advanced charting tools and real-time data.",
                "Our trading platform supports multiple asset classes with competitive spreads and fast execution. Would you like to know about any specific market?"
            ],
            fees: [
                "We offer $0 commission on stock trades, competitive crypto spreads starting at 0.1%, and forex spreads as low as 0.1 pips.",
                "Our fee structure is transparent: No commission on stocks, low spreads on crypto and forex, and no hidden fees.",
                "Trading fees vary by asset class. Stocks are commission-free, while crypto and forex have competitive spreads. No account maintenance fees!"
            ],
            support: [
                "Our support team is available 24/7 via live chat, email, or phone. We're here to help with any questions or issues.",
                "You can reach us anytime through this chat, email at support@brokerpro.com, or call +1 (555) 123-4567.",
                "We provide comprehensive support including trading tutorials, market analysis, and technical assistance."
            ],
            default: [
                "I'd be happy to help you with that! Could you please provide more details about what you're looking for?",
                "That's a great question! Let me connect you with a specialist who can provide detailed information.",
                "For specific inquiries like this, I recommend speaking with one of our trading experts. Would you like me to arrange a callback?",
                "I want to make sure I give you accurate information. Could you clarify what aspect you'd like to know more about?"
            ]
        };
    }

    getAutomatedResponse(message) {
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return this.responses.greeting;
        }
        if (message.includes('account') || message.includes('setup') || message.includes('register') || message.includes('sign up')) {
            return this.responses.account;
        }
        if (message.includes('trading') || message.includes('trade') || message.includes('start') || message.includes('how do i')) {
            return this.responses.trading;
        }
        if (message.includes('fee') || message.includes('cost') || message.includes('price') || message.includes('commission')) {
            return this.responses.fees;
        }
        if (message.includes('support') || message.includes('help') || message.includes('contact') || message.includes('phone')) {
            return this.responses.support;
        }
        return this.responses.default;
    }

    startTypingSimulation() {
        // Simulate periodic activity
        setInterval(() => {
            if (!this.isOpen && Math.random() < 0.1) { // 10% chance every interval
                this.showNotification();
            }
        }, 30000); // Check every 30 seconds
    }

    showNotification() {
        const badge = document.getElementById('chatBadge');
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'flex';
        
        // Add a subtle animation to the chat toggle
        const chatToggle = document.getElementById('chatToggle');
        chatToggle.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            chatToggle.style.animation = '';
        }, 500);
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});

// Add some helpful utility functions
function formatTime(date) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatWidget;
}
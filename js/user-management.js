// User Management Service for CentralTradehub
// Handles all user-related operations with proper data validation

class UserManagementService {
    constructor() {
        this.storageKey = 'centraltradehub_users';
        this.currentUserKey = 'centraltradehub_current_user';
        this.adminKey = 'centraltradehub_admins';
        this.init();
    }

    init() {
        // Initialize default admin user if none exists
        const admins = this.getAdmins();
        if (admins.length === 0) {
            this.createDefaultAdmin();
        }
    }

    // User CRUD Operations
    async createUser(userData) {
        try {
            // Validate required fields
            this.validateUserData(userData);

            // Check if user already exists
            if (this.getUserByEmail(userData.email)) {
                throw new Error('User with this email already exists');
            }

            // Generate user ID
            const userId = this.generateId('user');

            // Create user object with full schema
            const user = {
                id: userId,
                email: userData.email.toLowerCase(),
                
                profile: {
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    displayName: `${userData.firstName} ${userData.lastName}`,
                    avatar: null,
                    phone: userData.phone || '',
                    dateOfBirth: null,
                    nationality: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    }
                },

                auth: {
                    password: userData.hashedPassword,
                    isEmailVerified: false,
                    emailVerificationToken: this.generateToken(),
                    passwordResetToken: null,
                    passwordResetExpires: null,
                    twoFactorAuth: {
                        enabled: false,
                        secret: null,
                        backupCodes: []
                    },
                    loginAttempts: 0,
                    lockUntil: null,
                    lastLogin: null,
                    ipHistory: []
                },

                account: {
                    type: userData.accountType || 'basic',
                    status: 'active',
                    tier: 'bronze',
                    kycStatus: 'pending',
                    kycDocuments: [],
                    tradingExperience: userData.tradingExperience || 'beginner',
                    riskTolerance: 'medium',
                    investmentGoals: [],
                    annualIncome: '',
                    netWorth: ''
                },

                portfolio: {
                    totalValue: 0,
                    availableBalance: 0,
                    investedAmount: 0,
                    totalGainLoss: 0,
                    totalGainLossPercentage: 0,
                    currency: 'USD',
                    positions: [],
                    watchlist: [],
                    alerts: []
                },

                preferences: {
                    theme: 'dark',
                    language: 'en',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    currency: 'USD',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true,
                        priceAlerts: true,
                        newsUpdates: true,
                        marketAnalysis: false
                    },
                    privacy: {
                        profileVisibility: 'private',
                        showPortfolio: false,
                        showTradingHistory: false
                    },
                    trading: {
                        defaultOrderType: 'market',
                        confirmOrders: true,
                        autoInvest: false,
                        riskWarnings: true
                    }
                },

                subscription: {
                    plan: 'free',
                    status: 'active',
                    startDate: new Date().toISOString(),
                    endDate: null,
                    autoRenew: false,
                    paymentMethod: null,
                    billingHistory: []
                },

                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastActiveAt: new Date().toISOString(),
                    source: 'web',
                    referralCode: this.generateReferralCode(),
                    referredBy: null,
                    tags: [],
                    notes: ''
                }
            };

            // Save user
            const users = this.getAllUsers();
            users.push(user);
            localStorage.setItem(this.storageKey, JSON.stringify(users));

            return { success: true, user: this.sanitizeUser(user) };
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(user => user.id === userId);
    }

    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email.toLowerCase());
    }

    getAllUsers() {
        const users = localStorage.getItem(this.storageKey);
        return users ? JSON.parse(users) : [];
    }

    updateUser(userId, updateData) {
        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Deep merge update data
            users[userIndex] = this.deepMerge(users[userIndex], updateData);
            users[userIndex].metadata.updatedAt = new Date().toISOString();

            localStorage.setItem(this.storageKey, JSON.stringify(users));
            return { success: true, user: this.sanitizeUser(users[userIndex]) };
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    deleteUser(userId) {
        try {
            const users = this.getAllUsers();
            const filteredUsers = users.filter(user => user.id !== userId);
            
            if (users.length === filteredUsers.length) {
                throw new Error('User not found');
            }

            localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    // Portfolio Management
    updatePortfolio(userId, portfolioData) {
        return this.updateUser(userId, { portfolio: portfolioData });
    }

    addPosition(userId, position) {
        const user = this.getUserById(userId);
        if (!user) throw new Error('User not found');

        position.id = this.generateId('position');
        position.userId = userId;
        position.openDate = new Date().toISOString();
        position.lastUpdated = new Date().toISOString();
        position.status = 'open';

        user.portfolio.positions.push(position);
        return this.updateUser(userId, { portfolio: user.portfolio });
    }

    updatePosition(userId, positionId, updateData) {
        const user = this.getUserById(userId);
        if (!user) throw new Error('User not found');

        const positionIndex = user.portfolio.positions.findIndex(p => p.id === positionId);
        if (positionIndex === -1) throw new Error('Position not found');

        user.portfolio.positions[positionIndex] = {
            ...user.portfolio.positions[positionIndex],
            ...updateData,
            lastUpdated: new Date().toISOString()
        };

        return this.updateUser(userId, { portfolio: user.portfolio });
    }

    // Watchlist Management
    addToWatchlist(userId, symbol) {
        const user = this.getUserById(userId);
        if (!user) throw new Error('User not found');

        const watchlistItem = {
            symbol: symbol.toUpperCase(),
            addedAt: new Date().toISOString(),
            notes: ''
        };

        if (!user.portfolio.watchlist.find(item => item.symbol === symbol.toUpperCase())) {
            user.portfolio.watchlist.push(watchlistItem);
            return this.updateUser(userId, { portfolio: user.portfolio });
        }

        return { success: true, message: 'Symbol already in watchlist' };
    }

    removeFromWatchlist(userId, symbol) {
        const user = this.getUserById(userId);
        if (!user) throw new Error('User not found');

        user.portfolio.watchlist = user.portfolio.watchlist.filter(
            item => item.symbol !== symbol.toUpperCase()
        );

        return this.updateUser(userId, { portfolio: user.portfolio });
    }

    // Admin Management
    createDefaultAdmin() {
        const defaultAdmin = {
            id: this.generateId('admin'),
            email: 'admin@centraltradehub.com',
            profile: {
                firstName: 'System',
                lastName: 'Administrator',
                avatar: null,
                department: 'IT',
                title: 'System Administrator'
            },
            auth: {
                password: 'hashed_admin_password_here', // Should be properly hashed
                role: 'super_admin',
                permissions: ['all'],
                lastLogin: null,
                isActive: true
            },
            metadata: {
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                lastUpdated: new Date().toISOString()
            }
        };

        const admins = [defaultAdmin];
        localStorage.setItem(this.adminKey, JSON.stringify(admins));
        return defaultAdmin;
    }

    getAdmins() {
        const admins = localStorage.getItem(this.adminKey);
        return admins ? JSON.parse(admins) : [];
    }

    // Analytics & Reporting
    getUserAnalytics() {
        const users = this.getAllUsers();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => new Date(u.metadata.lastActiveAt) > thirtyDaysAgo).length,
            newUsersThisMonth: users.filter(u => new Date(u.metadata.createdAt) > thirtyDaysAgo).length,
            verifiedUsers: users.filter(u => u.auth.isEmailVerified).length,
            premiumUsers: users.filter(u => u.subscription.plan !== 'free').length,
            usersByAccountType: this.groupBy(users, 'account.type'),
            usersByTier: this.groupBy(users, 'account.tier'),
            averagePortfolioValue: this.calculateAveragePortfolioValue(users)
        };
    }

    // Utility Methods
    validateUserData(userData) {
        const required = ['firstName', 'lastName', 'email', 'hashedPassword'];
        for (const field of required) {
            if (!userData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }
    }

    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    generateReferralCode() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        if (sanitized.auth) {
            delete sanitized.auth.password;
        }
        return sanitized;
    }

    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    groupBy(array, path) {
        return array.reduce((groups, item) => {
            const value = path.split('.').reduce((obj, key) => obj?.[key], item);
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {});
    }

    calculateAveragePortfolioValue(users) {
        const totalValue = users.reduce((sum, user) => sum + (user.portfolio.totalValue || 0), 0);
        return users.length > 0 ? totalValue / users.length : 0;
    }
}

// Initialize user management service
const userManager = new UserManagementService();

// Export for global access
window.UserManagementService = UserManagementService;
window.userManager = userManager;
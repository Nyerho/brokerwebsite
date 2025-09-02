// CentralTradehub Database Schema
// Comprehensive data structure for trading platform

class DatabaseSchema {
    constructor() {
        this.version = '1.0.0';
        this.lastUpdated = new Date().toISOString();
    }

    // User Collection Schema
    getUserSchema() {
        return {
            // Primary identifiers
            id: 'string', // Unique user ID
            email: 'string', // Primary login credential
            
            // Personal Information
            profile: {
                firstName: 'string',
                lastName: 'string',
                displayName: 'string', // Optional display name
                avatar: 'string', // URL to profile picture
                phone: 'string',
                dateOfBirth: 'date',
                nationality: 'string',
                address: {
                    street: 'string',
                    city: 'string',
                    state: 'string',
                    zipCode: 'string',
                    country: 'string'
                }
            },

            // Authentication & Security
            auth: {
                password: 'string', // Hashed password
                isEmailVerified: 'boolean',
                emailVerificationToken: 'string',
                passwordResetToken: 'string',
                passwordResetExpires: 'date',
                twoFactorAuth: {
                    enabled: 'boolean',
                    secret: 'string',
                    backupCodes: 'array'
                },
                loginAttempts: 'number',
                lockUntil: 'date',
                lastLogin: 'date',
                ipHistory: 'array' // Track login IPs
            },

            // Account Information
            account: {
                type: 'string', // 'basic', 'premium', 'professional', 'institutional'
                status: 'string', // 'active', 'suspended', 'pending', 'closed'
                tier: 'string', // 'bronze', 'silver', 'gold', 'platinum'
                kycStatus: 'string', // 'pending', 'approved', 'rejected'
                kycDocuments: 'array',
                tradingExperience: 'string', // 'beginner', 'intermediate', 'advanced', 'professional'
                riskTolerance: 'string', // 'low', 'medium', 'high'
                investmentGoals: 'array',
                annualIncome: 'string',
                netWorth: 'string'
            },

            // Trading Portfolio
            portfolio: {
                totalValue: 'number',
                availableBalance: 'number',
                investedAmount: 'number',
                totalGainLoss: 'number',
                totalGainLossPercentage: 'number',
                currency: 'string', // Default currency
                positions: 'array', // Reference to positions collection
                watchlist: 'array', // Array of symbol objects
                alerts: 'array' // Price alerts and notifications
            },

            // Preferences & Settings
            preferences: {
                theme: 'string', // 'light', 'dark', 'auto'
                language: 'string',
                timezone: 'string',
                currency: 'string',
                notifications: {
                    email: 'boolean',
                    sms: 'boolean',
                    push: 'boolean',
                    priceAlerts: 'boolean',
                    newsUpdates: 'boolean',
                    marketAnalysis: 'boolean'
                },
                privacy: {
                    profileVisibility: 'string', // 'public', 'private', 'friends'
                    showPortfolio: 'boolean',
                    showTradingHistory: 'boolean'
                },
                trading: {
                    defaultOrderType: 'string',
                    confirmOrders: 'boolean',
                    autoInvest: 'boolean',
                    riskWarnings: 'boolean'
                }
            },

            // Subscription & Billing
            subscription: {
                plan: 'string', // 'free', 'basic', 'premium', 'professional'
                status: 'string', // 'active', 'cancelled', 'expired', 'trial'
                startDate: 'date',
                endDate: 'date',
                autoRenew: 'boolean',
                paymentMethod: 'string',
                billingHistory: 'array'
            },

            // Metadata
            metadata: {
                createdAt: 'date',
                updatedAt: 'date',
                lastActiveAt: 'date',
                source: 'string', // 'web', 'mobile', 'api'
                referralCode: 'string',
                referredBy: 'string',
                tags: 'array', // Admin tags
                notes: 'string' // Admin notes
            }
        };
    }

    // Trading Positions Schema
    getPositionSchema() {
        return {
            id: 'string',
            userId: 'string', // Reference to user
            symbol: 'string', // Stock/crypto symbol
            name: 'string', // Company/asset name
            type: 'string', // 'stock', 'crypto', 'forex', 'commodity'
            side: 'string', // 'long', 'short'
            quantity: 'number',
            averagePrice: 'number',
            currentPrice: 'number',
            marketValue: 'number',
            costBasis: 'number',
            unrealizedGainLoss: 'number',
            unrealizedGainLossPercentage: 'number',
            dayGainLoss: 'number',
            dayGainLossPercentage: 'number',
            openDate: 'date',
            lastUpdated: 'date',
            status: 'string', // 'open', 'closed', 'pending'
            metadata: {
                exchange: 'string',
                sector: 'string',
                industry: 'string',
                currency: 'string'
            }
        };
    }

    // Trading Orders Schema
    getOrderSchema() {
        return {
            id: 'string',
            userId: 'string',
            symbol: 'string',
            type: 'string', // 'market', 'limit', 'stop', 'stop-limit'
            side: 'string', // 'buy', 'sell'
            quantity: 'number',
            price: 'number', // For limit orders
            stopPrice: 'number', // For stop orders
            timeInForce: 'string', // 'day', 'gtc', 'ioc', 'fok'
            status: 'string', // 'pending', 'filled', 'cancelled', 'rejected', 'partial'
            filledQuantity: 'number',
            averageFillPrice: 'number',
            commission: 'number',
            createdAt: 'date',
            updatedAt: 'date',
            filledAt: 'date',
            cancelledAt: 'date',
            metadata: {
                source: 'string', // 'web', 'mobile', 'api'
                notes: 'string'
            }
        };
    }

    // Transaction History Schema
    getTransactionSchema() {
        return {
            id: 'string',
            userId: 'string',
            type: 'string', // 'buy', 'sell', 'deposit', 'withdrawal', 'dividend', 'fee'
            symbol: 'string', // For trades
            quantity: 'number',
            price: 'number',
            amount: 'number', // Total transaction amount
            commission: 'number',
            fees: 'number',
            netAmount: 'number',
            currency: 'string',
            status: 'string', // 'completed', 'pending', 'failed', 'cancelled'
            description: 'string',
            createdAt: 'date',
            settledAt: 'date',
            metadata: {
                orderId: 'string', // Reference to order if applicable
                exchange: 'string',
                reference: 'string' // External reference
            }
        };
    }

    // Watchlist Schema
    getWatchlistSchema() {
        return {
            id: 'string',
            userId: 'string',
            name: 'string', // Watchlist name
            description: 'string',
            isDefault: 'boolean',
            symbols: 'array', // Array of symbol objects
            createdAt: 'date',
            updatedAt: 'date',
            metadata: {
                color: 'string', // UI color theme
                sortOrder: 'number',
                isPublic: 'boolean'
            }
        };
    }

    // Price Alerts Schema
    getAlertSchema() {
        return {
            id: 'string',
            userId: 'string',
            symbol: 'string',
            name: 'string', // Alert name
            condition: 'string', // 'above', 'below', 'change_percent'
            targetPrice: 'number',
            currentPrice: 'number',
            changePercent: 'number', // For percentage-based alerts
            isActive: 'boolean',
            isTriggered: 'boolean',
            triggeredAt: 'date',
            notificationMethods: 'array', // ['email', 'sms', 'push']
            createdAt: 'date',
            expiresAt: 'date',
            metadata: {
                notes: 'string',
                priority: 'string' // 'low', 'medium', 'high'
            }
        };
    }

    // Admin Users Schema
    getAdminSchema() {
        return {
            id: 'string',
            email: 'string',
            profile: {
                firstName: 'string',
                lastName: 'string',
                avatar: 'string',
                department: 'string',
                title: 'string'
            },
            auth: {
                password: 'string',
                role: 'string', // 'super_admin', 'admin', 'moderator', 'support'
                permissions: 'array', // Specific permissions
                lastLogin: 'date',
                isActive: 'boolean'
            },
            metadata: {
                createdAt: 'date',
                createdBy: 'string',
                lastUpdated: 'date'
            }
        };
    }

    // System Settings Schema
    getSystemSettingsSchema() {
        return {
            id: 'string',
            category: 'string', // 'trading', 'security', 'notifications', 'general'
            key: 'string',
            value: 'any',
            description: 'string',
            isPublic: 'boolean', // Can users see this setting
            updatedAt: 'date',
            updatedBy: 'string'
        };
    }

    // Market Data Schema (for caching)
    getMarketDataSchema() {
        return {
            symbol: 'string',
            name: 'string',
            price: 'number',
            change: 'number',
            changePercent: 'number',
            volume: 'number',
            marketCap: 'number',
            high52Week: 'number',
            low52Week: 'number',
            dayHigh: 'number',
            dayLow: 'number',
            openPrice: 'number',
            previousClose: 'number',
            lastUpdated: 'date',
            exchange: 'string',
            currency: 'string',
            type: 'string' // 'stock', 'crypto', 'forex'
        };
    }
}

// Export schema instance
const dbSchema = new DatabaseSchema();
window.DatabaseSchema = DatabaseSchema;
window.dbSchema = dbSchema;
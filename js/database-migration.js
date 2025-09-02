// Database Migration & Seeding for CentralTradehub
// Handles data structure updates and sample data creation

class DatabaseMigration {
    constructor() {
        this.version = '1.0.0';
        this.migrations = [];
        this.seedData = this.createSeedData();
    }

    // Run all pending migrations
    async runMigrations() {
        const currentVersion = localStorage.getItem('centraltradehub_db_version') || '0.0.0';
        console.log(`Current database version: ${currentVersion}`);

        // Run version-specific migrations
        if (this.compareVersions(currentVersion, '1.0.0') < 0) {
            await this.migrateToV1();
        }

        // Update version
        localStorage.setItem('centraltradehub_db_version', this.version);
        console.log(`Database migrated to version: ${this.version}`);
    }

    // Migration to version 1.0.0
    async migrateToV1() {
        console.log('Migrating to version 1.0.0...');
        
        // Migrate existing users to new schema
        const existingUsers = JSON.parse(localStorage.getItem('centraltradehub_users') || '[]');
        const migratedUsers = existingUsers.map(user => this.migrateUserToV1(user));
        
        if (migratedUsers.length > 0) {
            localStorage.setItem('centraltradehub_users', JSON.stringify(migratedUsers));
            console.log(`Migrated ${migratedUsers.length} users to new schema`);
        }

        // Create sample data if no users exist
        if (migratedUsers.length === 0) {
            await this.seedDatabase();
        }
    }

    // Migrate individual user to V1 schema
    migrateUserToV1(oldUser) {
        // If user already has new schema, return as-is
        if (oldUser.metadata && oldUser.portfolio && oldUser.preferences) {
            return oldUser;
        }

        // Create new user structure
        return {
            id: oldUser.id || userManager.generateId('user'),
            email: oldUser.email,
            
            profile: {
                firstName: oldUser.firstName || '',
                lastName: oldUser.lastName || '',
                displayName: `${oldUser.firstName || ''} ${oldUser.lastName || ''}`.trim(),
                avatar: oldUser.profilePicture || null,
                phone: oldUser.phone || '',
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
                password: oldUser.password || '',
                isEmailVerified: oldUser.isEmailVerified || false,
                emailVerificationToken: userManager.generateToken(),
                passwordResetToken: null,
                passwordResetExpires: null,
                twoFactorAuth: {
                    enabled: false,
                    secret: null,
                    backupCodes: []
                },
                loginAttempts: 0,
                lockUntil: null,
                lastLogin: oldUser.lastLogin || null,
                ipHistory: []
            },

            account: {
                type: oldUser.accountType || 'basic',
                status: 'active',
                tier: 'bronze',
                kycStatus: 'pending',
                kycDocuments: [],
                tradingExperience: oldUser.tradingExperience || 'beginner',
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
                startDate: oldUser.registeredAt || new Date().toISOString(),
                endDate: null,
                autoRenew: false,
                paymentMethod: null,
                billingHistory: []
            },

            metadata: {
                createdAt: oldUser.registeredAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
                source: 'web',
                referralCode: userManager.generateReferralCode(),
                referredBy: null,
                tags: [],
                notes: ''
            }
        };
    }

    // Seed database with sample data
    async seedDatabase() {
        console.log('Seeding database with sample data...');
        
        try {
            // Create sample users
            for (const userData of this.seedData.users) {
                await userManager.createUser(userData);
            }

            // Create sample market data
            localStorage.setItem('centraltradehub_market_data', JSON.stringify(this.seedData.marketData));
            
            // Create system settings
            localStorage.setItem('centraltradehub_settings', JSON.stringify(this.seedData.systemSettings));
            
            console.log('Database seeded successfully!');
        } catch (error) {
            console.error('Error seeding database:', error);
        }
    }

    // Create sample data
    createSeedData() {
        return {
            users: [
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1234567890',
                    hashedPassword: 'hashed_password_here',
                    accountType: 'premium',
                    tradingExperience: 'intermediate'
                },
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    phone: '+1234567891',
                    hashedPassword: 'hashed_password_here',
                    accountType: 'professional',
                    tradingExperience: 'advanced'
                },
                {
                    firstName: 'Demo',
                    lastName: 'User',
                    email: 'demo@centraltradehub.com',
                    phone: '+1234567892',
                    hashedPassword: 'hashed_demo_password',
                    accountType: 'basic',
                    tradingExperience: 'beginner'
                }
            ],

            marketData: [
                {
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    price: 175.50,
                    change: 2.30,
                    changePercent: 1.33,
                    volume: 45678900,
                    marketCap: 2800000000000,
                    high52Week: 198.23,
                    low52Week: 124.17,
                    dayHigh: 176.80,
                    dayLow: 173.20,
                    openPrice: 174.00,
                    previousClose: 173.20,
                    lastUpdated: new Date().toISOString(),
                    exchange: 'NASDAQ',
                    currency: 'USD',
                    type: 'stock'
                },
                {
                    symbol: 'TSLA',
                    name: 'Tesla, Inc.',
                    price: 245.67,
                    change: -5.23,
                    changePercent: -2.09,
                    volume: 23456789,
                    marketCap: 780000000000,
                    high52Week: 414.50,
                    low52Week: 101.81,
                    dayHigh: 248.90,
                    dayLow: 242.10,
                    openPrice: 247.30,
                    previousClose: 250.90,
                    lastUpdated: new Date().toISOString(),
                    exchange: 'NASDAQ',
                    currency: 'USD',
                    type: 'stock'
                },
                {
                    symbol: 'BTC-USD',
                    name: 'Bitcoin',
                    price: 43250.00,
                    change: 1250.00,
                    changePercent: 2.98,
                    volume: 12345678,
                    marketCap: 850000000000,
                    high52Week: 73750.07,
                    low52Week: 15460.00,
                    dayHigh: 43500.00,
                    dayLow: 42100.00,
                    openPrice: 42000.00,
                    previousClose: 42000.00,
                    lastUpdated: new Date().toISOString(),
                    exchange: 'Crypto',
                    currency: 'USD',
                    type: 'crypto'
                }
            ],

            systemSettings: [
                {
                    id: 'trading_hours_start',
                    category: 'trading',
                    key: 'market_open',
                    value: '09:30',
                    description: 'Market opening time (EST)',
                    isPublic: true,
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'system'
                },
                {
                    id: 'trading_hours_end',
                    category: 'trading',
                    key: 'market_close',
                    value: '16:00',
                    description: 'Market closing time (EST)',
                    isPublic: true,
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'system'
                },
                {
                    id: 'max_login_attempts',
                    category: 'security',
                    key: 'max_login_attempts',
                    value: 5,
                    description: 'Maximum login attempts before lockout',
                    isPublic: false,
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'system'
                }
            ]
        };
    }

    // Utility: Compare version strings
    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    // Clear all data (for development/testing)
    clearAllData() {
        const keys = [
            'centraltradehub_users',
            'centraltradehub_admins',
            'centraltradehub_current_user',
            'centraltradehub_session',
            'centraltradehub_market_data',
            'centraltradehub_settings',
            'centraltradehub_db_version',
            'centraltradehub_login_attempts'
        ];
        
        keys.forEach(key => localStorage.removeItem(key));
        sessionStorage.clear();
        
        console.log('All CentralTradehub data cleared');
    }
}

// Initialize migration system
const dbMigration = new DatabaseMigration();

// Auto-run migrations on load
document.addEventListener('DOMContentLoaded', () => {
    dbMigration.runMigrations();
});

// Export for global access
window.DatabaseMigration = DatabaseMigration;
window.dbMigration = dbMigration;
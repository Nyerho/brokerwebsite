// Firestore Database Manager for CentralTradehub
// Handles all database operations with proper error handling and validation

class FirestoreManager {
    constructor(db) {
        this.db = db;
        this.collections = {
            users: 'users',
            positions: 'positions',
            orders: 'orders',
            transactions: 'transactions',
            watchlists: 'watchlists',
            alerts: 'alerts',
            admins: 'admins',
            settings: 'settings',
            marketData: 'marketData'
        };
    }

    // User Management
    async createUser(userId, userData) {
        try {
            const userDoc = {
                ...userData,
                metadata: {
                    ...userData.metadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            };
            
            await this.db.collection(this.collections.users).doc(userId).set(userDoc);
            return { success: true, data: userDoc };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }

    async getUser(userId) {
        try {
            const doc = await this.db.collection(this.collections.users).doc(userId).get();
            if (doc.exists) {
                return { success: true, data: doc.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUser(userId, updateData) {
        try {
            const updateDoc = {
                ...updateData,
                'metadata.updatedAt': new Date()
            };
            
            await this.db.collection(this.collections.users).doc(userId).update(updateDoc);
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    }

    // Portfolio Management
    async getUserPositions(userId) {
        try {
            const snapshot = await this.db.collection(this.collections.positions)
                .where('userId', '==', userId)
                .where('status', '==', 'open')
                .get();
            
            const positions = [];
            snapshot.forEach(doc => {
                positions.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: positions };
        } catch (error) {
            console.error('Error getting positions:', error);
            return { success: false, error: error.message };
        }
    }

    async createPosition(positionData) {
        try {
            const positionDoc = {
                ...positionData,
                openDate: new Date(),
                lastUpdated: new Date(),
                status: 'open'
            };
            
            const docRef = await this.db.collection(this.collections.positions).add(positionDoc);
            return { success: true, id: docRef.id, data: positionDoc };
        } catch (error) {
            console.error('Error creating position:', error);
            return { success: false, error: error.message };
        }
    }

    // Order Management
    async createOrder(orderData) {
        try {
            const orderDoc = {
                ...orderData,
                status: 'pending',
                filledQuantity: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await this.db.collection(this.collections.orders).add(orderDoc);
            return { success: true, id: docRef.id, data: orderDoc };
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserOrders(userId, limit = 50) {
        try {
            const snapshot = await this.db.collection(this.collections.orders)
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            const orders = [];
            snapshot.forEach(doc => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: orders };
        } catch (error) {
            console.error('Error getting orders:', error);
            return { success: false, error: error.message };
        }
    }

    // Watchlist Management
    async createWatchlist(userId, watchlistData) {
        try {
            const watchlistDoc = {
                ...watchlistData,
                userId: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = await this.db.collection(this.collections.watchlists).add(watchlistDoc);
            return { success: true, id: docRef.id, data: watchlistDoc };
        } catch (error) {
            console.error('Error creating watchlist:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserWatchlists(userId) {
        try {
            const snapshot = await this.db.collection(this.collections.watchlists)
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const watchlists = [];
            snapshot.forEach(doc => {
                watchlists.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: watchlists };
        } catch (error) {
            console.error('Error getting watchlists:', error);
            return { success: false, error: error.message };
        }
    }

    // Market Data Management
    async updateMarketData(symbol, marketData) {
        try {
            const marketDoc = {
                ...marketData,
                symbol: symbol,
                lastUpdated: new Date()
            };
            
            await this.db.collection(this.collections.marketData).doc(symbol).set(marketDoc, { merge: true });
            return { success: true };
        } catch (error) {
            console.error('Error updating market data:', error);
            return { success: false, error: error.message };
        }
    }

    async getMarketData(symbols) {
        try {
            const promises = symbols.map(symbol => 
                this.db.collection(this.collections.marketData).doc(symbol).get()
            );
            
            const docs = await Promise.all(promises);
            const marketData = {};
            
            docs.forEach((doc, index) => {
                if (doc.exists) {
                    marketData[symbols[index]] = doc.data();
                }
            });
            
            return { success: true, data: marketData };
        } catch (error) {
            console.error('Error getting market data:', error);
            return { success: false, error: error.message };
        }
    }

    // Real-time listeners
    subscribeToUserData(userId, callback) {
        return this.db.collection(this.collections.users).doc(userId)
            .onSnapshot(callback, error => {
                console.error('User data subscription error:', error);
            });
    }

    subscribeToPositions(userId, callback) {
        return this.db.collection(this.collections.positions)
            .where('userId', '==', userId)
            .where('status', '==', 'open')
            .onSnapshot(callback, error => {
                console.error('Positions subscription error:', error);
            });
    }

    subscribeToMarketData(symbols, callback) {
        const unsubscribers = symbols.map(symbol => 
            this.db.collection(this.collections.marketData).doc(symbol)
                .onSnapshot(callback, error => {
                    console.error(`Market data subscription error for ${symbol}:`, error);
                })
        );
        
        return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirestoreManager;
} else {
    window.FirestoreManager = FirestoreManager;
}
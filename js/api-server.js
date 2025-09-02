// CentralTradehub Backend API Server
// Express.js server with Firebase integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        await authenticateToken(req, res, async () => {
            const adminDoc = await db.collection('admins').doc(req.user.uid).get();
            if (!adminDoc.exists || !adminDoc.data().auth.isActive) {
                return res.status(403).json({ error: 'Admin access required' });
            }
            req.admin = adminDoc.data();
            next();
        });
    } catch (error) {
        console.error('Admin authentication error:', error);
        return res.status(403).json({ error: 'Admin authentication failed' });
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// User Management Endpoints

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userData = userDoc.data();
        // Remove sensitive data
        delete userData.auth;
        
        res.json({ success: true, data: userData });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { profile, preferences, account } = req.body;
        
        const updateData = {
            'metadata.updatedAt': new Date()
        };
        
        if (profile) {
            Object.keys(profile).forEach(key => {
                updateData[`profile.${key}`] = profile[key];
            });
        }
        
        if (preferences) {
            Object.keys(preferences).forEach(key => {
                updateData[`preferences.${key}`] = preferences[key];
            });
        }
        
        if (account && account.tradingExperience) {
            updateData['account.tradingExperience'] = account.tradingExperience;
        }
        
        await db.collection('users').doc(req.user.uid).update(updateData);
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Portfolio Management Endpoints

// Get user portfolio
app.get('/api/portfolio', authenticateToken, async (req, res) => {
    try {
        const positionsSnapshot = await db.collection('positions')
            .where('userId', '==', req.user.uid)
            .where('status', '==', 'open')
            .get();
        
        const positions = [];
        positionsSnapshot.forEach(doc => {
            positions.push({ id: doc.id, ...doc.data() });
        });
        
        // Calculate portfolio summary
        const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
        const totalGainLoss = positions.reduce((sum, pos) => sum + pos.unrealizedGainLoss, 0);
        const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
        
        res.json({
            success: true,
            data: {
                positions,
                summary: {
                    totalValue,
                    totalGainLoss,
                    totalGainLossPercentage,
                    positionCount: positions.length
                }
            }
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

// Create new position
app.post('/api/portfolio/position', authenticateToken, async (req, res) => {
    try {
        const { symbol, name, type, side, quantity, price } = req.body;
        
        // Validate required fields
        if (!symbol || !name || !type || !side || !quantity || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const positionData = {
            userId: req.user.uid,
            symbol: symbol.toUpperCase(),
            name,
            type,
            side,
            quantity: parseFloat(quantity),
            averagePrice: parseFloat(price),
            currentPrice: parseFloat(price),
            marketValue: parseFloat(quantity) * parseFloat(price),
            costBasis: parseFloat(quantity) * parseFloat(price),
            unrealizedGainLoss: 0,
            unrealizedGainLossPercentage: 0,
            dayGainLoss: 0,
            dayGainLossPercentage: 0,
            openDate: new Date(),
            lastUpdated: new Date(),
            status: 'open',
            metadata: {
                exchange: req.body.exchange || 'NASDAQ',
                sector: req.body.sector || 'Technology',
                industry: req.body.industry || 'Software',
                currency: req.body.currency || 'USD'
            }
        };
        
        const docRef = await db.collection('positions').add(positionData);
        
        res.json({
            success: true,
            data: { id: docRef.id, ...positionData },
            message: 'Position created successfully'
        });
    } catch (error) {
        console.error('Create position error:', error);
        res.status(500).json({ error: 'Failed to create position' });
    }
});

// Trading Orders Endpoints

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const status = req.query.status;
        
        let query = db.collection('orders')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(limit);
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        const ordersSnapshot = await query.get();
        const orders = [];
        
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create new order
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { symbol, type, side, quantity, price, stopPrice, timeInForce } = req.body;
        
        // Validate required fields
        if (!symbol || !type || !side || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const orderData = {
            userId: req.user.uid,
            symbol: symbol.toUpperCase(),
            type,
            side,
            quantity: parseFloat(quantity),
            price: price ? parseFloat(price) : null,
            stopPrice: stopPrice ? parseFloat(stopPrice) : null,
            timeInForce: timeInForce || 'day',
            status: 'pending',
            filledQuantity: 0,
            averageFillPrice: 0,
            commission: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                source: 'web',
                notes: req.body.notes || ''
            }
        };
        
        const docRef = await db.collection('orders').add(orderData);
        
        res.json({
            success: true,
            data: { id: docRef.id, ...orderData },
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Watchlist Management Endpoints

// Get user watchlists
app.get('/api/watchlists', authenticateToken, async (req, res) => {
    try {
        const watchlistsSnapshot = await db.collection('watchlists')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        const watchlists = [];
        watchlistsSnapshot.forEach(doc => {
            watchlists.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, data: watchlists });
    } catch (error) {
        console.error('Get watchlists error:', error);
        res.status(500).json({ error: 'Failed to fetch watchlists' });
    }
});

// Create new watchlist
app.post('/api/watchlists', authenticateToken, async (req, res) => {
    try {
        const { name, description, symbols } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Watchlist name is required' });
        }
        
        const watchlistData = {
            userId: req.user.uid,
            name,
            description: description || '',
            isDefault: false,
            symbols: symbols || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                color: req.body.color || '#007bff',
                sortOrder: 0,
                isPublic: false
            }
        };
        
        const docRef = await db.collection('watchlists').add(watchlistData);
        
        res.json({
            success: true,
            data: { id: docRef.id, ...watchlistData },
            message: 'Watchlist created successfully'
        });
    } catch (error) {
        console.error('Create watchlist error:', error);
        res.status(500).json({ error: 'Failed to create watchlist' });
    }
});

// Admin Endpoints

// Get all users (admin only)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const usersSnapshot = await db.collection('users')
            .orderBy('metadata.createdAt', 'desc')
            .limit(limit)
            .offset(offset)
            .get();
        
        const users = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            // Remove sensitive data
            delete userData.auth;
            users.push({ id: doc.id, ...userData });
        });
        
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get system statistics (admin only)
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const [usersSnapshot, positionsSnapshot, ordersSnapshot] = await Promise.all([
            db.collection('users').get(),
            db.collection('positions').where('status', '==', 'open').get(),
            db.collection('orders').where('status', '==', 'filled').get()
        ]);
        
        const stats = {
            totalUsers: usersSnapshot.size,
            activePositions: positionsSnapshot.size,
            completedOrders: ordersSnapshot.size,
            timestamp: new Date().toISOString()
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`CentralTradehub API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
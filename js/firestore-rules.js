// Firestore Security Rules for CentralTradehub
// These rules should be deployed to your Firebase project

const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    function isValidUser() {
      return request.auth != null && 
             request.auth.token.email_verified == true;
    }
    
    // Users Collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
      allow read: if isAdmin(); // Admins can read all users
      
      // Validate user data structure
      allow create: if isAuthenticated() && 
                   isOwner(userId) &&
                   validateUserData(request.resource.data);
      
      allow update: if isAuthenticated() && 
                   isOwner(userId) &&
                   validateUserUpdate(request.resource.data, resource.data);
    }
    
    // Trading Positions Collection
    match /positions/{positionId} {
      allow read, write: if isAuthenticated() && 
                        isOwner(resource.data.userId);
      allow read: if isAdmin();
      
      allow create: if isAuthenticated() && 
                   isOwner(request.resource.data.userId) &&
                   validatePositionData(request.resource.data);
    }
    
    // Trading Orders Collection
    match /orders/{orderId} {
      allow read, write: if isAuthenticated() && 
                        isOwner(resource.data.userId);
      allow read: if isAdmin();
      
      allow create: if isAuthenticated() && 
                   isOwner(request.resource.data.userId) &&
                   validateOrderData(request.resource.data);
    }
    
    // Transaction History Collection
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && 
                 isOwner(resource.data.userId);
      allow write: if isAdmin(); // Only admins can modify transactions
      allow read: if isAdmin();
    }
    
    // Watchlists Collection
    match /watchlists/{watchlistId} {
      allow read, write: if isAuthenticated() && 
                        isOwner(resource.data.userId);
      allow read: if isAdmin();
    }
    
    // Price Alerts Collection
    match /alerts/{alertId} {
      allow read, write: if isAuthenticated() && 
                        isOwner(resource.data.userId);
      allow read: if isAdmin();
    }
    
    // Admin Users Collection
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
    
    // System Settings Collection
    match /settings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Market Data Collection (public read)
    match /marketData/{symbol} {
      allow read: if true; // Public market data
      allow write: if isAdmin(); // Only admins/system can update
    }
    
    // Validation functions
    function validateUserData(data) {
      return data.keys().hasAll(['email', 'profile', 'account', 'metadata']) &&
             data.email is string &&
             data.profile.firstName is string &&
             data.profile.lastName is string &&
             data.account.type in ['basic', 'premium', 'professional', 'institutional'] &&
             data.account.status in ['active', 'suspended', 'pending', 'closed'];
    }
    
    function validateUserUpdate(newData, oldData) {
      return newData.email == oldData.email && // Email cannot be changed
             newData.metadata.createdAt == oldData.metadata.createdAt; // CreatedAt cannot be changed
    }
    
    function validatePositionData(data) {
      return data.keys().hasAll(['userId', 'symbol', 'type', 'side', 'quantity']) &&
             data.userId is string &&
             data.symbol is string &&
             data.type in ['stock', 'crypto', 'forex', 'commodity'] &&
             data.side in ['long', 'short'] &&
             data.quantity is number &&
             data.quantity > 0;
    }
    
    function validateOrderData(data) {
      return data.keys().hasAll(['userId', 'symbol', 'type', 'side', 'quantity']) &&
             data.userId is string &&
             data.symbol is string &&
             data.type in ['market', 'limit', 'stop', 'stop-limit'] &&
             data.side in ['buy', 'sell'] &&
             data.quantity is number &&
             data.quantity > 0;
    }
  }
}
`;

// Export for deployment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firestoreRules };
} else {
    window.FirestoreRules = { firestoreRules };
}
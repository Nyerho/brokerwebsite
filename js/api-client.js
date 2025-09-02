// API Client for CentralTradehub Frontend
// Handles all API communications with proper error handling

class APIClient {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.token = null;
    }

    // Set authentication token
    setAuthToken(token) {
        this.token = token;
    }

    // Clear authentication token
    clearAuthToken() {
        this.token = null;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // User Management API calls
    async getUserProfile() {
        return this.get('/user/profile');
    }

    async updateUserProfile(profileData) {
        return this.put('/user/profile', profileData);
    }

    // Portfolio Management API calls
    async getPortfolio() {
        return this.get('/portfolio');
    }

    async createPosition(positionData) {
        return this.post('/portfolio/position', positionData);
    }

    // Trading Orders API calls
    async getOrders(params = {}) {
        return this.get('/orders', params);
    }

    async createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    // Watchlist Management API calls
    async getWatchlists() {
        return this.get('/watchlists');
    }

    async createWatchlist(watchlistData) {
        return this.post('/watchlists', watchlistData);
    }

    async updateWatchlist(watchlistId, watchlistData) {
        return this.put(`/watchlists/${watchlistId}`, watchlistData);
    }

    async deleteWatchlist(watchlistId) {
        return this.delete(`/watchlists/${watchlistId}`);
    }

    // Admin API calls
    async getUsers(params = {}) {
        return this.get('/admin/users', params);
    }

    async getSystemStats() {
        return this.get('/admin/stats');
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }
}

// Create global API client instance
const apiClient = new APIClient();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
} else {
    window.APIClient = APIClient;
    window.apiClient = apiClient;
}
import axios from 'axios';
import { ShoppingListItem } from '../types/ShoppingListItem';

// Base URL for the Azure Functions API
const API_BASE_URL = 'http://localhost:7071/api';

// Available subscription keys for demo purposes
// In a real application, these would be provided by the API provider
const DEMO_SUBSCRIPTION_KEYS = {
    DEMO: 'demo-key-12345',
    PREMIUM: 'premium-key-67890',
    ENTERPRISE: 'enterprise-key-11111'
};

// Create an axios instance for API requests
// This instance will be used for all shopping list operations
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token and subscription key
// This interceptor runs before every request to automatically add required headers
api.interceptors.request.use(
    (config) => {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
            // Add the JWT token to the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add the subscription key to the request headers
        // The API requires a valid subscription key for all operations
        config.headers['X-Subscription-Key'] = DEMO_SUBSCRIPTION_KEYS.DEMO;

        // Log the request for debugging purposes
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        // Log any errors that occur during request setup
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:7071');
        }
        if (error.response?.status === 404) {
            throw new Error('API endpoint not found. Please check your backend routes.');
        }
        if (error.response?.status === 500) {
            throw new Error('Backend server error. Please check your backend logs.');
        }
        throw error;
    }
);

export const shoppingListApi = {
    // Test backend connectivity
    testConnection: async (): Promise<boolean> => {
        try {
            // Try to connect to any endpoint - if we get a 401, the server is running
            const response = await axios.get('http://localhost:7071/api/GetShoppingList', {
                headers: {
                    'X-Subscription-Key': DEMO_SUBSCRIPTION_KEYS.DEMO
                }
            });
            return true;
        } catch (error: any) {
            // If we get a 401 Unauthorized, the server is running but we need auth
            // If we get a network error, the server is not running
            if (error.response?.status === 401) {
                console.log('Backend is running but requires authentication');
                return true; // Server is running
            }
            console.error('Backend connection test failed:', error);
            return false;
        }
    },

    // Get all items
    getAllItems: async (): Promise<ShoppingListItem[]> => {
        const response = await api.get('/GetShoppingList');
        return response.data;
    },

    // Get item by ID
    getItemById: async (id: string): Promise<ShoppingListItem> => {
        const response = await api.get(`/GetShoppingList/${id}`);
        return response.data;
    },

    // Add new item
    addItem: async (item: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt'>): Promise<ShoppingListItem> => {
        const response = await api.post('/AddItemInShoppingList', item);
        return response.data;
    },

    // Update item
    updateItem: async (id: string, item: ShoppingListItem): Promise<ShoppingListItem> => {
        const response = await api.put(`/${id}`, item);
        return response.data;
    },

    // Delete item
    deleteItem: async (id: string): Promise<void> => {
        await api.delete(`/${id}`);
    },
}; 
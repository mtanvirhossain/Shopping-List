import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/Auth';

// Base URL for the Azure Functions API
const API_BASE_URL = 'http://localhost:7071/api';

// Create an axios instance for authentication requests
// This instance will be used for login and registration
const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Available subscription keys for demo purposes
// In a real application, these would be provided by the API provider
const DEMO_SUBSCRIPTION_KEYS = {
    DEMO: 'demo-key-12345',
    PREMIUM: 'premium-key-67890',
    ENTERPRISE: 'enterprise-key-11111'
};

/**
 * Authentication service for handling user login, registration, and token management
 * This service provides methods for authenticating users and managing JWT tokens
 */
export const authService = {
    /**
     * Authenticates a user with username and password
     * @param credentials - Object containing username and password
     * @returns Promise that resolves to AuthResponse with JWT token
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        console.log('Attempting login with credentials:', credentials);
        
        // Add subscription key to the request headers
        // The API requires a valid subscription key for authentication
        const config = {
            headers: {
                'X-Subscription-Key': DEMO_SUBSCRIPTION_KEYS.DEMO
            }
        };

        try {
            console.log('Making login request to:', `${API_BASE_URL}/Login`);
            // Make POST request to the login endpoint
            const response = await authApi.post('/Login', credentials, config);
            console.log('Login response received:', response.status);
            return response.data;
        } catch (error) {
            console.error('Login request failed:', error);
            throw error;
        }
    },

    /**
     * Registers a new user account
     * @param userData - Object containing username, email, and password
     * @returns Promise that resolves to AuthResponse with JWT token
     */
    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        console.log('Attempting registration with userData:', userData);
        
        // Add subscription key to the request headers
        // The API requires a valid subscription key for registration
        const config = {
            headers: {
                'X-Subscription-Key': DEMO_SUBSCRIPTION_KEYS.DEMO
            }
        };

        try {
            console.log('Making registration request to:', `${API_BASE_URL}/Register`);
            // Make POST request to the register endpoint
            const response = await authApi.post('/Register', userData, config);
            console.log('Registration response received:', response.status);
            return response.data;
        } catch (error) {
            console.error('Registration request failed:', error);
            throw error;
        }
    },

    /**
     * Stores the JWT token in browser's localStorage
     * localStorage persists data even after browser is closed
     * @param token - The JWT token to store
     */
    setToken: (token: string): void => {
        localStorage.setItem('authToken', token);
    },

    /**
     * Retrieves the JWT token from browser's localStorage
     * @returns The stored JWT token or null if not found
     */
    getToken: (): string | null => {
        return localStorage.getItem('authToken');
    },

    /**
     * Removes the JWT token from browser's localStorage
     * This is used when the user logs out
     */
    removeToken: (): void => {
        localStorage.removeItem('authToken');
    },

    /**
     * Checks if the user is currently authenticated
     * @returns True if a valid token exists, false otherwise
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('authToken');
    },

    /**
     * Gets the current subscription key being used
     * @returns The subscription key for API requests
     */
    getSubscriptionKey: (): string => {
        return DEMO_SUBSCRIPTION_KEYS.DEMO;
    },

    /**
     * Gets all available subscription keys (for demo purposes)
     * @returns Object containing all available subscription keys
     */
    getAvailableSubscriptionKeys: () => {
        return DEMO_SUBSCRIPTION_KEYS;
    }
}; 
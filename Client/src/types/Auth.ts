/**
 * TypeScript interfaces for authentication-related data structures
 * These interfaces ensure type safety when working with auth API responses
 * and help maintain consistency between frontend and backend data models
 */

/**
 * Enumeration of possible user account statuses
 * Must match the UserStatus enum in the backend API
 */
export enum UserStatus {
    /** User account is active and can login normally */
    Active = 'Active',
    /** User account is pending email verification */
    PendingVerification = 'PendingVerification',
    /** User account has been suspended by administrator */
    Suspended = 'Suspended',
    /** User account has been permanently deactivated */
    Deactivated = 'Deactivated'
}

/**
 * Enumeration of user roles in the system
 * Must match the UserRole enum in the backend API
 */
export enum UserRole {
    /** Standard user with basic shopping list features */
    User = 'User',
    /** Administrator with additional management capabilities */
    Admin = 'Admin'
}

/**
 * Interface for user login requests
 * Contains the credentials needed for authentication
 */
export interface LoginRequest {
    /** Username or email for login */
    username: string;
    /** User's password for authentication */
    password: string;
}

/**
 * Interface for user registration requests
 * Contains all information needed to create a new user account
 */
export interface RegisterRequest {
    /** Desired username (must be unique) */
    username: string;
    /** User's email address (must be unique and valid) */
    email: string;
    /** User's password (will be hashed before storage) */
    password: string;
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
}

/**
 * Interface for successful authentication responses
 * Contains user information and JWT token for future requests
 */
export interface AuthResponse {
    /** JWT token for authenticated requests - include in Authorization header as "Bearer {token}" */
    token: string;
    /** User's unique identifier */
    userId: string;
    /** User's username */
    username: string;
    /** User's email address */
    email: string;
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
    /** User's role in the system */
    role: UserRole;
    /** User's account status */
    status: UserStatus;
}

/**
 * Interface for API error responses
 * Provides consistent error information from the backend
 */
export interface ErrorResponse {
    /** Human-readable error message */
    message: string;
    /** Optional error code for programmatic handling */
    code?: string;
    /** Additional error details (for debugging) */
    details?: any;
}

/**
 * Interface for the current user's authentication state
 * Used to manage user session in the frontend application
 */
export interface AuthState {
    /** Whether the user is currently authenticated */
    isAuthenticated: boolean;
    /** Current user information (null if not authenticated) */
    user: AuthResponse | null;
    /** JWT token for API requests (null if not authenticated) */
    token: string | null;
}
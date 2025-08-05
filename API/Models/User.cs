using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace API.Models
{
    /// <summary>
    /// Represents a user in the shopping list application
    /// This model is used for Cosmos DB storage and includes all user-related data
    /// </summary>
    public class User
    {
        /// <summary>
        /// Unique identifier for the user (also used as partition key in Cosmos DB)
        /// This is automatically generated when a new user is created
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// User's chosen username for login (must be unique)
        /// Used for authentication along with password
        /// </summary>
        [JsonProperty("username")]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// User's email address (must be unique and valid format)
        /// Used for account verification and password reset
        /// </summary>
        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Hashed password using BCrypt for security
        /// Never store plain text passwords - always hash them
        /// </summary>
        [JsonProperty("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>
        /// User's first name for personalization
        /// </summary>
        [JsonProperty("firstName")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User's last name for personalization
        /// </summary>
        [JsonProperty("lastName")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Current status of the user account
        /// Controls whether user can login and access features
        /// </summary>
        [JsonProperty("status")]
        public UserStatus Status { get; set; } = UserStatus.Active;

        /// <summary>
        /// User's role in the system (for future authorization features)
        /// Currently all users are standard users
        /// </summary>
        [JsonProperty("role")]
        public UserRole Role { get; set; } = UserRole.User;

        /// <summary>
        /// Timestamp when the user account was created
        /// </summary>
        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Timestamp when the user account was last updated
        /// </summary>
        [JsonProperty("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Number of consecutive failed login attempts
        /// Used for account lockout security feature
        /// </summary>
        [JsonProperty("failedLoginAttempts")]
        public int FailedLoginAttempts { get; set; } = 0;

        /// <summary>
        /// Timestamp when the account was locked due to too many failed attempts
        /// Null if account is not locked
        /// </summary>
        [JsonProperty("lockoutUntil")]
        public DateTime? LockoutUntil { get; set; }

        /// <summary>
        /// Token used for email verification
        /// Generated when user registers, verified when they click email link
        /// </summary>
        [JsonProperty("emailVerificationToken")]
        public string? EmailVerificationToken { get; set; }

        /// <summary>
        /// Timestamp when the email verification token expires
        /// </summary>
        [JsonProperty("emailVerificationExpires")]
        public DateTime? EmailVerificationExpires { get; set; }

        /// <summary>
        /// Token used for password reset functionality
        /// Generated when user requests password reset
        /// </summary>
        [JsonProperty("passwordResetToken")]
        public string? PasswordResetToken { get; set; }

        /// <summary>
        /// Timestamp when the password reset token expires
        /// </summary>
        [JsonProperty("passwordResetExpires")]
        public DateTime? PasswordResetExpires { get; set; }
    }

    /// <summary>
    /// Enumeration of possible user account statuses
    /// Controls user access and account state
    /// </summary>
    public enum UserStatus
    {
        /// <summary>
        /// User account is active and can login normally
        /// </summary>
        Active,

        /// <summary>
        /// User account is pending email verification
        /// Cannot login until email is verified
        /// </summary>
        PendingVerification,

        /// <summary>
        /// User account has been suspended by administrator
        /// Cannot login until reactivated
        /// </summary>
        Suspended,

        /// <summary>
        /// User account has been permanently deactivated
        /// Cannot login and data may be scheduled for deletion
        /// </summary>
        Deactivated
    }

    /// <summary>
    /// Enumeration of user roles in the system
    /// Used for authorization and permission control
    /// </summary>
    public enum UserRole
    {
        /// <summary>
        /// Standard user with basic shopping list features
        /// </summary>
        User,

        /// <summary>
        /// Administrator with additional management capabilities
        /// </summary>
        Admin
    }

    // Authentication Request/Response Models

    /// <summary>
    /// Model for user login requests
    /// Contains credentials needed for authentication
    /// </summary>
    public class LoginRequest
    {
        /// <summary>
        /// Username or email for login
        /// </summary>
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// User's password for authentication
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// Model for user registration requests
    /// Contains all information needed to create a new user account
    /// </summary>
    public class RegisterRequest
    {
        /// <summary>
        /// Desired username (must be unique)
        /// </summary>
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters")]
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// User's email address (must be unique and valid)
        /// </summary>
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's password (will be hashed before storage)
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// User's first name
        /// </summary>
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User's last name
        /// </summary>
        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string LastName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Model for successful authentication responses
    /// Contains user information and JWT token for future requests
    /// </summary>
    public class AuthResponse
    {
        /// <summary>
        /// JWT token for authenticated requests
        /// Include this in Authorization header as "Bearer {token}"
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// User's unique identifier
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// User's username
        /// </summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's first name
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User's last name
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// User's role in the system
        /// </summary>
        public UserRole Role { get; set; }

        /// <summary>
        /// User's account status
        /// </summary>
        public UserStatus Status { get; set; }
    }

    /// <summary>
    /// Model for API error responses
    /// Provides consistent error information to clients
    /// </summary>
    public class ErrorResponse
    {
        /// <summary>
        /// Human-readable error message
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Optional error code for programmatic handling
        /// </summary>
        public string? Code { get; set; }

        /// <summary>
        /// Additional error details (for debugging)
        /// </summary>
        public object? Details { get; set; }
    }
}
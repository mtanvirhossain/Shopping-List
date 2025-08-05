using System;
using System.Threading.Tasks;
using API.Models;
using API.Services;
using BCrypt.Net;
using Microsoft.Extensions.Logging;

namespace API.Services
{
    /// <summary>
    /// Service for managing user operations with industry-standard security practices
    /// This service handles user authentication, registration, and account management
    /// </summary>
    public static class UserService
    {
        /// <summary>
        /// Maximum number of failed login attempts before account lockout
        /// </summary>
        private const int MaxFailedLoginAttempts = 5;

        /// <summary>
        /// Duration of account lockout in minutes
        /// </summary>
        private const int LockoutDurationMinutes = 30;

        /// <summary>
        /// Authenticates a user with username/email and password
        /// Implements security features like account lockout and failed attempt tracking
        /// </summary>
        /// <param name="usernameOrEmail">Username or email address for login</param>
        /// <param name="password">Plain text password to verify</param>
        /// <returns>Authentication result with user data and JWT token if successful</returns>
        public static async Task<AuthenticationResult> AuthenticateUserAsync(string usernameOrEmail, string password)
        {
            try
            {
                // Step 1: Initialize Cosmos DB service
                await CosmosDbService.InitializeAsync();

                // Step 2: Find user by username or email
                // Try to find user by username first, then by email if not found
                User? user = await CosmosDbService.GetUserByUsernameAsync(usernameOrEmail);
                if (user == null)
                {
                    user = await CosmosDbService.GetUserByEmailAsync(usernameOrEmail);
                }

                // If user doesn't exist, return failure
                if (user == null)
                {
                    Console.WriteLine($"DEBUG: User not found for username/email: {usernameOrEmail}");
                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Invalid username or password"
                    };
                }

                Console.WriteLine($"DEBUG: User found - Username: {user.Username}, Email: {user.Email}");
                Console.WriteLine($"DEBUG: Password hash: {user.PasswordHash}");
                Console.WriteLine($"DEBUG: Input password: {password}");

                // Step 3: Check if account is locked
                if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
                {
                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Account is temporarily locked due to too many failed login attempts"
                    };
                }

                // Step 4: Verify password
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
                Console.WriteLine($"DEBUG: Password verification result: {isPasswordValid}");
                
                if (!isPasswordValid)
                {
                    Console.WriteLine($"DEBUG: Password verification failed");
                    // Increment failed login attempts
                    user.FailedLoginAttempts++;
                    
                    // Lock account if too many failed attempts
                    if (user.FailedLoginAttempts >= MaxFailedLoginAttempts)
                    {
                        user.LockoutUntil = DateTime.UtcNow.AddMinutes(LockoutDurationMinutes);
                    }

                    // Update user with failed attempt info
                    await CosmosDbService.UpdateUserAsync(user);

                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Invalid username or password"
                    };
                }

                // Step 5: Check account status
                if (user.Status != UserStatus.Active)
                {
                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Account is not active"
                    };
                }

                // Step 6: Reset failed login attempts on successful login
                user.FailedLoginAttempts = 0;
                user.LockoutUntil = null;
                user.UpdatedAt = DateTime.UtcNow;
                await CosmosDbService.UpdateUserAsync(user);

                // Step 7: Generate JWT token
                var token = JwtService.GenerateToken(user);

                // Step 8: Create authentication response
                var authResponse = new AuthResponse
                {
                    Token = token,
                    UserId = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    Status = user.Status
                };

                return new AuthenticationResult
                {
                    IsSuccess = true,
                    AuthResponse = authResponse
                };
            }
            catch (Exception)
            {
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    ErrorMessage = "An error occurred during authentication"
                };
            }
        }

        /// <summary>
        /// Registers a new user in the system
        /// Validates input data, checks for duplicates, and creates user account
        /// </summary>
        /// <param name="request">Registration request with user information</param>
        /// <returns>Registration result with user data and JWT token if successful</returns>
        public static async Task<AuthenticationResult> RegisterUserAsync(RegisterRequest request)
        {
            try
            {
                // Step 1: Initialize Cosmos DB service
                await CosmosDbService.InitializeAsync();

                // Step 2: Validate input data
                var validationResult = ValidateRegistrationRequest(request);
                if (!validationResult.IsValid)
                {
                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = validationResult.ErrorMessage
                    };
                }

                // Step 3: Check if username already exists
                var existingUserByUsername = await CosmosDbService.GetUserByUsernameAsync(request.Username);
                if (existingUserByUsername != null)
                {
                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Username already exists"
                    };
                }

                // Step 4: Check if email already exists
                var existingUserByEmail = await CosmosDbService.GetUserByEmailAsync(request.Email);
                if (existingUserByEmail != null)
                {
                    return new AuthenticationResult
                    {
                        IsSuccess = false,
                        ErrorMessage = "Email already exists"
                    };
                }

                // Step 5: Hash password
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Step 6: Create new user
                var newUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Status = UserStatus.Active, // Set to Active for testing
                    Role = UserRole.User,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    FailedLoginAttempts = 0
                };

                // Step 7: Save user to database
                try
                {
                    var savedUser = await CosmosDbService.CreateUserAsync(newUser);
                    Console.WriteLine($"DEBUG: User saved successfully with ID: {savedUser.Id}");
                    
                    // Test retrieval immediately after saving
                    var retrievedUser = await CosmosDbService.GetUserByUsernameAsync(newUser.Username);
                    if (retrievedUser != null)
                    {
                        Console.WriteLine($"DEBUG: User retrieved successfully: {retrievedUser.Username}");
                    }
                    else
                    {
                        Console.WriteLine("DEBUG: User not found after saving!");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"DEBUG: Error saving user: {ex.Message}");
                    throw;
                }

                // Step 8: Generate JWT token for automatic login
                var token = JwtService.GenerateToken(newUser);

                // Step 9: Create authentication response
                var authResponse = new AuthResponse
                {
                    Token = token,
                    UserId = newUser.Id,
                    Username = newUser.Username,
                    Email = newUser.Email,
                    FirstName = newUser.FirstName,
                    LastName = newUser.LastName,
                    Role = newUser.Role,
                    Status = newUser.Status
                };

                return new AuthenticationResult
                {
                    IsSuccess = true,
                    AuthResponse = authResponse
                };
            }
            catch (Exception)
            {
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    ErrorMessage = "An error occurred during registration"
                };
            }
        }

        /// <summary>
        /// Validates registration request data
        /// Checks for required fields and format validation
        /// </summary>
        /// <param name="request">Registration request to validate</param>
        /// <returns>Validation result indicating success or failure with error message</returns>
        private static UserValidationResult ValidateRegistrationRequest(RegisterRequest request)
        {
            // Check required fields
            if (string.IsNullOrWhiteSpace(request.Username))
                return new UserValidationResult { IsValid = false, ErrorMessage = "Username is required" };

            if (string.IsNullOrWhiteSpace(request.Email))
                return new UserValidationResult { IsValid = false, ErrorMessage = "Email is required" };

            if (string.IsNullOrWhiteSpace(request.Password))
                return new UserValidationResult { IsValid = false, ErrorMessage = "Password is required" };

            if (string.IsNullOrWhiteSpace(request.FirstName))
                return new UserValidationResult { IsValid = false, ErrorMessage = "First name is required" };

            if (string.IsNullOrWhiteSpace(request.LastName))
                return new UserValidationResult { IsValid = false, ErrorMessage = "Last name is required" };

            // Validate username format
            if (request.Username.Length < 3 || request.Username.Length > 50)
                return new UserValidationResult { IsValid = false, ErrorMessage = "Username must be between 3 and 50 characters" };

            // Validate email format
            if (!IsValidEmail(request.Email))
                return new UserValidationResult { IsValid = false, ErrorMessage = "Invalid email format" };

            // Validate password strength
            if (request.Password.Length < 6)
                return new UserValidationResult { IsValid = false, ErrorMessage = "Password must be at least 6 characters long" };

            return new UserValidationResult { IsValid = true };
        }

        /// <summary>
        /// Validates email format using basic regex pattern
        /// </summary>
        /// <param name="email">Email address to validate</param>
        /// <returns>True if email format is valid, false otherwise</returns>
        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }

    /// <summary>
    /// Result of authentication operations
    /// Contains success status, user data, and error information
    /// </summary>
    public class AuthenticationResult
    {
        /// <summary>
        /// Whether the authentication was successful
        /// </summary>
        public bool IsSuccess { get; set; }

        /// <summary>
        /// Authentication response with user data and token (if successful)
        /// </summary>
        public AuthResponse? AuthResponse { get; set; }

        /// <summary>
        /// Error message if authentication failed
        /// </summary>
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// Result of validation operations
    /// Contains validation status and error information
    /// </summary>
    public class UserValidationResult
    {
        /// <summary>
        /// Whether the validation was successful
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// Error message if validation failed
        /// </summary>
        public string? ErrorMessage { get; set; }
    }
}
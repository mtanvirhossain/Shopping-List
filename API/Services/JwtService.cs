using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using API.Models;

namespace API.Services
{
    /// <summary>
    /// Service for generating and validating JWT (JSON Web Tokens)
    /// JWT tokens are used to securely transmit user information between client and server
    /// </summary>
    public static class JwtService
    {
        // JWT Configuration Constants
        // These values define how JWT tokens are created and validated
        
        /// <summary>
        /// Secret key used to sign and verify JWT tokens
        /// In production, this should be stored in Azure Key Vault or environment variables
        /// </summary>
        private static readonly string SecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "your-super-secret-key-with-at-least-32-characters";
        
        /// <summary>
        /// The issuer of the JWT token (who created the token)
        /// </summary>
        private static readonly string Issuer = "ShoppingListApp";
        
        /// <summary>
        /// The intended audience of the JWT token (who should use the token)
        /// </summary>
        private static readonly string Audience = "ShoppingListApp";

        /// <summary>
        /// Generates a JWT token for a user
        /// </summary>
        /// <param name="user">The user object containing information to include in the token</param>
        /// <returns>A JWT token string that can be used for authentication</returns>
        public static string GenerateToken(User user)
        {
            // Create a JWT token handler for generating tokens
            var tokenHandler = new JwtSecurityTokenHandler();
            
            // Convert the secret key to bytes for signing
            var key = Encoding.ASCII.GetBytes(SecretKey);

            // Define the token descriptor with all the token properties
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                // Create claims (information) to include in the token
                Subject = new ClaimsIdentity(new[]
                {
                    // User ID claim - used to identify the user
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    // Username claim - for display purposes
                    new Claim(ClaimTypes.Name, user.Username),
                    // Email claim - for user identification
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                
                // Set token expiration to 7 days from now
                Expires = DateTime.UtcNow.AddDays(7),
                
                // Set the issuer (who created the token)
                Issuer = Issuer,
                
                // Set the audience (who should use the token)
                Audience = Audience,
                
                // Define how the token should be signed
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            // Create the JWT token using the descriptor
            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            // Convert the token to a string and return it
            return tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// Validates a JWT token and extracts user information
        /// </summary>
        /// <param name="token">The JWT token string to validate</param>
        /// <returns>ClaimsPrincipal containing user information if valid, null if invalid</returns>
        public static ClaimsPrincipal? ValidateToken(string token)
        {
            try
            {
                // Create a JWT token handler for validation
                var tokenHandler = new JwtSecurityTokenHandler();
                
                // Convert the secret key to bytes for verification
                var key = Encoding.ASCII.GetBytes(SecretKey);

                // Define validation parameters to ensure token security
                var validationParameters = new TokenValidationParameters
                {
                    // Validate that the token was signed with our secret key
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    
                    // Validate that the token was issued by us
                    ValidateIssuer = true,
                    ValidIssuer = Issuer,
                    
                    // Validate that the token is intended for our application
                    ValidateAudience = true,
                    ValidAudience = Audience,
                    
                    // Validate that the token hasn't expired
                    ValidateLifetime = true,
                    
                    // Don't allow any clock skew (tolerance for time differences)
                    ClockSkew = TimeSpan.Zero
                };

                // Validate the token and extract the claims principal
                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                
                // Return the claims principal containing user information
                return principal;
            }
            catch
            {
                // If any validation fails, return null
                // This could be due to expired token, invalid signature, etc.
                return null;
            }
        }
    }
} 
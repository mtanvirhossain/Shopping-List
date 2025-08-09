using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using API.Services;
using System.Security.Claims;

namespace API
{
    /// <summary>
    /// Azure Function for validating JWT tokens against the database
    /// This provides server-side token validation for enhanced security
    /// </summary>
    public static class ValidateToken
    {
        /// <summary>
        /// Validates a JWT token and returns user information if valid
        /// </summary>
        /// <param name="req">The HTTP request containing the JWT token</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response with user information if token is valid</returns>
        [FunctionName("ValidateToken")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", "options", Route = "ValidateToken")] HttpRequest req,
            ILogger log)
        {
            // Handle OPTIONS preflight request
            if (req.Method.ToLower() == "options")
            {
                log.LogInformation("Handling OPTIONS request for ValidateToken");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                req.HttpContext.Response.Headers.Add("Access-Control-Max-Age", "86400");
                return new StatusCodeResult(200);
            }

            // Log the start of the ValidateToken function execution
            log.LogInformation("ValidateToken function processed a request.");

            try
            {
                // Step 1: Extract and validate subscription key from request headers
                var subscriptionKey = req.Headers["X-Subscription-Key"].ToString();
                
                // Validate the subscription key
                var subscriptionValidation = SubscriptionKeyService.ValidateSubscriptionKey(subscriptionKey ?? string.Empty);
                if (!subscriptionValidation.IsValid)
                {
                    log.LogWarning("Invalid subscription key attempt in ValidateToken: {SubscriptionKey}", subscriptionKey);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult($"Subscription key validation failed: {subscriptionValidation.ErrorMessage}");
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in ValidateToken: {SubscriptionKey}", subscriptionKey);

                // Step 2: Extract JWT token from Authorization header
                var authHeader = req.Headers["Authorization"].FirstOrDefault();
                
                // Check if the Authorization header exists and has the correct format
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    log.LogWarning("Missing or invalid Authorization header");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Authorization header required");
                }

                // Extract the token by removing the 'Bearer ' prefix
                var token = authHeader.Substring("Bearer ".Length);
                
                // Step 3: Validate the JWT token
                var principal = JwtService.ValidateToken(token);
                if (principal == null)
                {
                    log.LogWarning("Invalid JWT token provided");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 4: Extract user ID from the JWT token
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    log.LogWarning("JWT token missing user identifier claim");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 5: Verify user exists in database
                await CosmosDbService.InitializeAsync();
                var user = await CosmosDbService.GetUserByIdAsync(userId);
                
                if (user == null)
                {
                    log.LogWarning("User not found in database for token validation: {UserId}", userId);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("User not found");
                }

                // Step 6: Check if user account is active
                if (user.Status != Models.UserStatus.Active)
                {
                    log.LogWarning("Inactive user account attempting token validation: {UserId}", userId);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Account is not active");
                }

                // Step 7: Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");

                // Step 8: Return user information (without sensitive data)
                var userInfo = new
                {
                    userId = user.Id,
                    username = user.Username,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    role = user.Role,
                    status = user.Status,
                    createdAt = user.CreatedAt,
                    updatedAt = user.UpdatedAt
                };

                log.LogInformation("Token validation successful for user: {Username}", user.Username);
                return new OkObjectResult(userInfo);
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the validation process
                log.LogError(ex, "Unexpected error during token validation");
                
                // Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                return new StatusCodeResult(500);
            }
        }
    }
}

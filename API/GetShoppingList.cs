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
    /// Azure Function for retrieving user's shopping list items
    /// This function requires both subscription key and JWT token validation
    /// </summary>
    public static class GetShoppingList
    {
        /// <summary>
        /// Retrieves all shopping list items for the authenticated user
        /// </summary>
        /// <param name="req">The HTTP request containing subscription key and JWT token</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response with shopping list items if successful, error message if failed</returns>
        [FunctionName("GetShoppingList")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "options", Route = null)] HttpRequest req,
            ILogger log)
        {
            // Log the start of the GetShoppingList function execution
            log.LogInformation("GetShoppingList function processed a request.");

            // Handle CORS preflight requests
            if (req.Method.ToLower() == "options")
            {
                log.LogInformation("Handling OPTIONS request for GetShoppingList");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                req.HttpContext.Response.Headers.Add("Access-Control-Max-Age", "86400");
                return new OkResult();
            }

            try
            {
                // Step 1: Extract and validate subscription key from request headers
                // The subscription key should be sent in the 'X-Subscription-Key' header
                var subscriptionKey = req.Headers["X-Subscription-Key"].ToString();
                
                // Validate the subscription key
                var subscriptionValidation = SubscriptionKeyService.ValidateSubscriptionKey(subscriptionKey ?? string.Empty);
                if (!subscriptionValidation.IsValid)
                {
                    // Log the failed subscription key validation for monitoring
                    log.LogWarning("Invalid subscription key attempt in GetShoppingList: {SubscriptionKey}", subscriptionKey);
                    
                    // Add CORS headers to error response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult($"Subscription key validation failed: {subscriptionValidation.ErrorMessage}");
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in GetShoppingList: {SubscriptionKey}", subscriptionKey);

                // Step 2: Extract JWT token from Authorization header
                // The JWT token should be sent in the 'Authorization' header with 'Bearer ' prefix
                var authHeader = req.Headers["Authorization"].FirstOrDefault();
                
                // Check if the Authorization header exists and has the correct format
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    log.LogWarning("Missing or invalid Authorization header");
                    
                    // Add CORS headers to error response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Authorization header required");
                }

                // Extract the token by removing the 'Bearer ' prefix
                var token = authHeader.Substring("Bearer ".Length);
                
                // Step 3: Validate the JWT token
                // Use the JWT service to validate the token and extract user information
                var principal = JwtService.ValidateToken(token);
                if (principal == null)
                {
                    log.LogWarning("Invalid JWT token provided");
                    
                    // Add CORS headers to error response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 4: Extract user ID from the JWT token
                // The user ID is stored in the token as a claim
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    log.LogWarning("JWT token missing user identifier claim");
                    
                    // Add CORS headers to error response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 5: Retrieve user's shopping list items from Cosmos DB
                // Get all shopping list items that belong to this specific user
                var items = await CosmosDbService.GetUserItemsAsync(userId);

                // Log successful retrieval
                log.LogInformation("Successfully retrieved {ItemCount} items for user: {UserId}", items.Count, userId);

                // Step 6: Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                // Step 7: Return the shopping list items
                // Return HTTP 200 OK with the list of shopping items
                return new OkObjectResult(items);
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the process
                log.LogError(ex, "Unexpected error while getting shopping list");
                
                // Add CORS headers to error response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                return new StatusCodeResult(500);
            }
        }
    }
}

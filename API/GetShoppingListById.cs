using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using API.Services;

namespace API
{
    /// <summary>
    /// Azure Function for getting a specific shopping list item by ID
    /// This function requires both subscription key and JWT token validation
    /// </summary>
    public static class GetShoppingListById
    {
        /// <summary>
        /// Gets a specific shopping list item by ID for the authenticated user
        /// </summary>
        /// <param name="req">The HTTP request containing subscription key and JWT token</param>
        /// <param name="id">The ID of the item to retrieve</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response with the item if found, error message if not found</returns>
        [FunctionName("GetShoppingListById")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "options", Route = "GetShoppingListById/{id}")] HttpRequest req,
            string id,
            ILogger log)
        {
            // Handle OPTIONS preflight request
            if (req.Method.ToLower() == "options")
            {
                log.LogInformation("Handling OPTIONS request for GetShoppingListById");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                req.HttpContext.Response.Headers.Add("Access-Control-Max-Age", "86400");
                return new StatusCodeResult(200);
            }

            log.LogInformation("GetShoppingListById function processed a request for ID: {id}", id);

            try
            {
                // Step 1: Extract and validate subscription key from request headers
                var subscriptionKey = req.Headers["X-Subscription-Key"].ToString();
                
                // Validate the subscription key
                var subscriptionValidation = SubscriptionKeyService.ValidateSubscriptionKey(subscriptionKey ?? string.Empty);
                if (!subscriptionValidation.IsValid)
                {
                    log.LogWarning("Invalid subscription key attempt in GetShoppingListById: {SubscriptionKey}", subscriptionKey);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult($"Subscription key validation failed: {subscriptionValidation.ErrorMessage}");
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in GetShoppingListById: {SubscriptionKey}", subscriptionKey);

                // Step 2: Extract JWT token from Authorization header
                var authHeader = req.Headers["Authorization"].FirstOrDefault();
                
                // Check if the Authorization header exists and has the correct format
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    log.LogWarning("Missing or invalid Authorization header");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
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
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
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
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 5: Get the item from Cosmos DB
                await CosmosDbService.InitializeAsync();
                var item = await CosmosDbService.GetItemByIdAsync(id, userId);
                
                if (item == null)
                {
                    log.LogWarning("Item with ID {ItemId} not found for user {UserId}", id, userId);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new NotFoundObjectResult($"Item with ID {id} not found");
                }

                // Log successful item retrieval
                log.LogInformation("Successfully retrieved item '{ItemName}' (ID: {ItemId}) for user: {UserId}", item.ItemName, id, userId);

                // Step 6: Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");

                // Step 7: Return the item
                return new OkObjectResult(item);
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the process
                log.LogError(ex, "Unexpected error while retrieving item with ID: {ItemId}", id);
                
                // Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                return new StatusCodeResult(500);
            }
        }
    }
}

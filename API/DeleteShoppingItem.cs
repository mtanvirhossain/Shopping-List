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
    /// Azure Function for deleting shopping list items
    /// This function requires both subscription key and JWT token validation
    /// </summary>
    public static class DeleteShoppingItem
    {
        /// <summary>
        /// Deletes a shopping list item for the authenticated user
        /// </summary>
        /// <param name="req">The HTTP request containing subscription key and JWT token</param>
        /// <param name="id">The ID of the item to delete</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response indicating success or failure</returns>
        [FunctionName("DeleteShoppingItem")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "delete", "options", Route = "DeleteShoppingItem/{id}")] HttpRequest req,
            string id,
            ILogger log)
        {
            // Handle OPTIONS preflight request
            if (req.Method.ToLower() == "options")
            {
                log.LogInformation("Handling OPTIONS request for DeleteShoppingItem");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                req.HttpContext.Response.Headers.Add("Access-Control-Max-Age", "86400");
                return new StatusCodeResult(200);
            }

            // Log the start of the DeleteShoppingItem function execution
            log.LogInformation("DeleteShoppingItem function processed a request for ID: {id}", id);

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
                    log.LogWarning("Invalid subscription key attempt in DeleteShoppingItem: {SubscriptionKey}", subscriptionKey);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult($"Subscription key validation failed: {subscriptionValidation.ErrorMessage}");
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in DeleteShoppingItem: {SubscriptionKey}", subscriptionKey);

                // Step 2: Extract JWT token from Authorization header
                // The JWT token should be sent in the 'Authorization' header with 'Bearer ' prefix
                var authHeader = req.Headers["Authorization"].FirstOrDefault();
                
                // Check if the Authorization header exists and has the correct format
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    log.LogWarning("Missing or invalid Authorization header");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
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
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 4: Extract user ID from the JWT token
                // The user ID is stored in the token as a claim
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    log.LogWarning("JWT token missing user identifier claim");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 5: Delete the item from Cosmos DB
                // Delete the shopping list item from the database
                // The CosmosDbService will ensure the item belongs to the authenticated user
                var success = await CosmosDbService.DeleteItemAsync(id, userId);
                
                if (!success)
                {
                    log.LogWarning("Item with ID {ItemId} not found for user {UserId}", id, userId);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new NotFoundObjectResult($"Item with ID {id} not found");
                }

                // Log successful item deletion
                log.LogInformation("Successfully deleted item with ID: {ItemId} for user: {UserId}", id, userId);

                // Step 6: Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");

                // Step 7: Return success response
                // Return HTTP 204 No Content to indicate successful deletion
                return new NoContentResult();
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the process
                log.LogError(ex, "Unexpected error while deleting item with ID: {ItemId}", id);
                
                // Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "DELETE, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                return new StatusCodeResult(500);
            }
        }
    }
}

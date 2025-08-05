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
            [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "{id}")] HttpRequest req,
            string id,
            ILogger log)
        {
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
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 4: Extract user ID from the JWT token
                // The user ID is stored in the token as a claim
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    log.LogWarning("JWT token missing user identifier claim");
                    return new UnauthorizedObjectResult("Invalid token");
                }

                // Step 5: Delete the item from Cosmos DB
                // Delete the shopping list item from the database
                // The CosmosDbService will ensure the item belongs to the authenticated user
                var success = await CosmosDbService.DeleteItemAsync(id, userId);
                
                if (!success)
                {
                    log.LogWarning("Item with ID {ItemId} not found for user {UserId}", id, userId);
                    return new NotFoundObjectResult($"Item with ID {id} not found");
                }

                // Log successful item deletion
                log.LogInformation("Successfully deleted item with ID: {ItemId} for user: {UserId}", id, userId);

                // Step 6: Return success response
                // Return HTTP 204 No Content to indicate successful deletion
                return new NoContentResult();
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the process
                log.LogError(ex, "Unexpected error while deleting item with ID: {ItemId}", id);
                return new StatusCodeResult(500);
            }
        }
    }
}

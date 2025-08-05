using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using API.Models;
using API.Services;
using System.Security.Claims;

namespace API
{
    /// <summary>
    /// Azure Function for adding new items to user's shopping list
    /// This function requires both subscription key and JWT token validation
    /// </summary>
    public static class AddItemInShoppingList
    {
        /// <summary>
        /// Adds a new shopping list item for the authenticated user
        /// </summary>
        /// <param name="req">The HTTP request containing subscription key, JWT token, and item data</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response with created item if successful, error message if failed</returns>
        [FunctionName("AddItemInShoppingList")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            // Log the start of the AddItemInShoppingList function execution
            log.LogInformation("AddItemInShoppingList function processed a request.");

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
                    log.LogWarning("Invalid subscription key attempt in AddItemInShoppingList: {SubscriptionKey}", subscriptionKey);
                    return new UnauthorizedObjectResult($"Subscription key validation failed: {subscriptionValidation.ErrorMessage}");
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in AddItemInShoppingList: {SubscriptionKey}", subscriptionKey);

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

                // Step 5: Read and parse the request body
                // Read the entire request body as a string
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                
                // Deserialize the JSON request body into a ShoppingListItem object
                var item = JsonConvert.DeserializeObject<ShoppingListItem>(requestBody);

                // Step 6: Validate the item data
                // Check if the item is null or missing required fields
                if (item == null || string.IsNullOrEmpty(item.ItemName))
                {
                    log.LogWarning("Invalid item data - missing required fields");
                    return new BadRequestObjectResult("ItemName is required");
                }

                // Step 7: Associate the item with the authenticated user
                // Set the user ID to ensure the item belongs to the correct user
                item.UserId = userId;

                // Step 8: Save the item to Cosmos DB
                // Create the new shopping list item in the database
                var addedItem = await CosmosDbService.CreateItemAsync(item);

                // Log successful item creation
                log.LogInformation("Successfully added item '{ItemName}' for user: {UserId}", addedItem.ItemName, userId);

                // Step 9: Return the created item
                // Return HTTP 201 Created with the newly created item
                return new CreatedAtActionResult("GetShoppingList", "GetShoppingList", new { id = addedItem.Id }, addedItem);
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the process
                log.LogError(ex, "Unexpected error while adding item");
                return new StatusCodeResult(500);
            }
        }
    }
}

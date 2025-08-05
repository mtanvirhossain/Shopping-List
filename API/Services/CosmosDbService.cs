using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using API.Models;

namespace API.Services
{
    /// <summary>
    /// Service for managing data operations with Azure Cosmos DB
    /// This service handles all database operations for users and shopping list items
    /// </summary>
    public static class CosmosDbService
    {
        // Cosmos DB Configuration Constants
        // These values define the connection and container settings
        
        /// <summary>
        /// Connection string for Azure Cosmos DB
        /// In production, this should be stored in Azure Key Vault or environment variables
        /// </summary>
        private static readonly string ConnectionString = Environment.GetEnvironmentVariable("COSMOS_DB_CONNECTION_STRING") ?? "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
        
        /// <summary>
        /// Name of the Cosmos DB database
        /// </summary>
        private static readonly string DatabaseName = "ShoppingListAppDatabase";
        
        /// <summary>
        /// Name of the container that stores user information
        /// </summary>
        private static readonly string UsersContainerName = "users";
        
        /// <summary>
        /// Name of the container that stores shopping list items
        /// </summary>
        private static readonly string ItemsContainerName = "lists";

        // Static fields to hold Cosmos DB client and containers
        // These are initialized once and reused for all operations
        
        /// <summary>
        /// Cosmos DB client instance for connecting to the database
        /// </summary>
        private static CosmosClient? _cosmosClient;
        
        /// <summary>
        /// Container instance for user data operations
        /// </summary>
        private static Container? _usersContainer;
        
        /// <summary>
        /// Container instance for shopping list item operations
        /// </summary>
        private static Container? _itemsContainer;

        /// <summary>
        /// Initializes the Cosmos DB connection and creates necessary containers
        /// This method should be called before any database operations
        /// </summary>
        public static async Task InitializeAsync()
        {
            try
            {
                // Step 1: Create Cosmos DB client
                // The client manages the connection to the Cosmos DB account
                _cosmosClient = new CosmosClient(ConnectionString);
                
                // Step 2: Create or get the database
                // CreateDatabaseIfNotExistsAsync will create the database if it doesn't exist,
                // or return the existing database if it does exist
                var database = await _cosmosClient.CreateDatabaseIfNotExistsAsync(DatabaseName);
                
                // Step 3: Create or get the containers
                // CreateContainerIfNotExistsAsync will create the container if it doesn't exist,
                // or return the existing container if it does exist
                
                // Users container - partitioned by user ID for efficient queries
                // Note: Using /id as partition key to match existing container structure
                _usersContainer = await database.Database.CreateContainerIfNotExistsAsync(UsersContainerName, "/id");
                
                // Shopping items container - partitioned by item ID to match existing container structure
                // Note: Using /id as partition key to match existing container structure
                _itemsContainer = await database.Database.CreateContainerIfNotExistsAsync(ItemsContainerName, "/id");
            }
            catch (Exception ex)
            {
                // Log the error and rethrow for proper error handling
                throw new Exception($"Failed to initialize Cosmos DB: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Retrieves a user by their username from Cosmos DB
        /// </summary>
        /// <param name="username">The username to search for</param>
        /// <returns>The user object if found, null otherwise</returns>
        public static async Task<API.Models.User?> GetUserByUsernameAsync(string username)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            try
            {
                // Step 1: Create a parameterized query
                // Using parameterized queries prevents SQL injection attacks
                var query = new QueryDefinition("SELECT * FROM c WHERE c.Username = @username")
                    .WithParameter("@username", username);
                
                // Step 2: Execute the query with cross-partition enabled
                // GetItemQueryIterator creates an iterator for the query results
                var iterator = _usersContainer!.GetItemQueryIterator<API.Models.User>(query);
                
                // Step 3: Read the results
                // ReadNextAsync reads the next page of results
                var results = await iterator.ReadNextAsync();
                
                // Step 4: Return the first (and should be only) result
                // FirstOrDefault returns the first item or null if no items found
                return results.FirstOrDefault();
            }
            catch
            {
                // If any error occurs (connection issues, etc.), return null
                return null;
            }
        }

        /// <summary>
        /// Retrieves a user by their email address from Cosmos DB
        /// </summary>
        /// <param name="email">The email address to search for</param>
        /// <returns>The user object if found, null otherwise</returns>
        public static async Task<API.Models.User?> GetUserByEmailAsync(string email)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            try
            {
                // Step 1: Create a parameterized query for email search
                // Using parameterized queries prevents SQL injection attacks
                var query = new QueryDefinition("SELECT * FROM c WHERE c.Email = @email")
                    .WithParameter("@email", email);
                
                // Step 2: Execute the query with cross-partition enabled
                // GetItemQueryIterator creates an iterator for the query results
                var iterator = _usersContainer!.GetItemQueryIterator<API.Models.User>(query);
                
                // Step 3: Read the results
                // ReadNextAsync reads the next page of results
                var results = await iterator.ReadNextAsync();
                
                // Step 4: Return the first (and should be only) result
                // FirstOrDefault returns the first item or null if no items found
                return results.FirstOrDefault();
            }
            catch
            {
                // If any error occurs (connection issues, etc.), return null
                return null;
            }
        }

        /// <summary>
        /// Updates an existing user in Cosmos DB
        /// This is used for updating user information like login attempts, last login time, etc.
        /// </summary>
        /// <param name="user">The user object to update</param>
        /// <returns>The updated user object</returns>
        public static async Task<API.Models.User> UpdateUserAsync(API.Models.User user)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            try
            {
                // Step 1: Update the user's last modified timestamp
                // This is used for audit trails and data integrity
                user.UpdatedAt = DateTime.UtcNow;

                // Step 2: Upsert the user document
                // Upsert will create the document if it doesn't exist, or update it if it does
                // Use Id as partition key to match container structure
                var response = await _usersContainer!.UpsertItemAsync(user, new PartitionKey(user.Id));
                
                // Step 3: Return the updated user object
                // The response contains the updated document from Cosmos DB
                return response.Resource;
            }
            catch (Exception ex)
            {
                // Log the error and rethrow for proper error handling
                throw new Exception($"Failed to update user {user.Id}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Retrieves a user by their unique ID from Cosmos DB
        /// This is the most efficient way to retrieve a specific user
        /// </summary>
        /// <param name="userId">The user ID to search for</param>
        /// <returns>The user object if found, null otherwise</returns>
        public static async Task<API.Models.User?> GetUserByIdAsync(string userId)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            try
            {
                // Step 1: Read the user document directly by ID
                // This is the most efficient way to retrieve a specific document
                var response = await _usersContainer!.ReadItemAsync<API.Models.User>(userId, new PartitionKey(userId));
                
                // Step 2: Return the user object
                // The response contains the user document from Cosmos DB
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // User not found - return null
                return null;
            }
            catch
            {
                // If any other error occurs (connection issues, etc.), return null
                return null;
            }
        }

        /// <summary>
        /// Deletes a user from Cosmos DB
        /// This is used for account deletion and administrative purposes
        /// </summary>
        /// <param name="userId">The ID of the user to delete</param>
        /// <returns>True if the user was deleted successfully, false otherwise</returns>
        public static async Task<bool> DeleteUserAsync(string userId)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            try
            {
                // Step 1: Delete the user document by ID
                // This permanently removes the user from the database
                await _usersContainer!.DeleteItemAsync<API.Models.User>(userId, new PartitionKey(userId));
                
                // Step 2: Return success
                // If we reach here, the deletion was successful
                return true;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // User not found - return false
                return false;
            }
            catch
            {
                // If any other error occurs (connection issues, etc.), return false
                return false;
            }
        }

        /// <summary>
        /// Retrieves all users from Cosmos DB (for administrative purposes)
        /// This should be used carefully and only by administrators
        /// </summary>
        /// <param name="limit">Maximum number of users to retrieve (default: 100)</param>
        /// <returns>List of user objects</returns>
        public static async Task<List<API.Models.User>> GetAllUsersAsync(int limit = 100)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            try
            {
                // Step 1: Create a query to get all users
                // Using a simple SELECT query to retrieve all users
                var query = new QueryDefinition("SELECT * FROM c");
                
                // Step 2: Execute the query with a limit
                // GetItemQueryIterator creates an iterator for the query results
                var iterator = _usersContainer!.GetItemQueryIterator<API.Models.User>(query, requestOptions: new QueryRequestOptions { MaxItemCount = limit });
                
                // Step 3: Read the results
                // ReadNextAsync reads the next page of results
                var results = await iterator.ReadNextAsync();
                
                // Step 4: Return the list of users
                // ToList converts the results to a List<User>
                return results.ToList();
            }
            catch
            {
                // If any error occurs (connection issues, etc.), return empty list
                return new List<API.Models.User>();
            }
        }

        /// <summary>
        /// Creates a new user in the Cosmos DB users container
        /// </summary>
        /// <param name="user">The user object to create</param>
        /// <returns>The created user object from Cosmos DB</returns>
        public static async Task<API.Models.User> CreateUserAsync(API.Models.User user)
        {
            // Ensure the Cosmos DB connection is initialized
            if (_usersContainer == null) await InitializeAsync();

            // Create the user item with the correct partition key (Id)
            var response = await _usersContainer!.CreateItemAsync(user, new PartitionKey(user.Id));
            return response.Resource;
        }

        public static async Task<List<ShoppingListItem>> GetUserItemsAsync(string userId)
        {
            if (_itemsContainer == null) await InitializeAsync();

            try
            {
                var query = new QueryDefinition("SELECT * FROM c WHERE c.UserId = @userId")
                    .WithParameter("@userId", userId);
                
                var iterator = _itemsContainer!.GetItemQueryIterator<ShoppingListItem>(query);
                var results = await iterator.ReadNextAsync();
                
                return results.ToList();
            }
            catch
            {
                return new List<ShoppingListItem>();
            }
        }

        public static async Task<ShoppingListItem> CreateItemAsync(ShoppingListItem item)
        {
            if (_itemsContainer == null) await InitializeAsync();

            item.Id = Guid.NewGuid().ToString();
            var response = await _itemsContainer!.CreateItemAsync(item, new PartitionKey(item.Id));
            return response.Resource;
        }

        public static async Task<ShoppingListItem?> UpdateItemAsync(ShoppingListItem item)
        {
            if (_itemsContainer == null) await InitializeAsync();

            try
            {
                var response = await _itemsContainer!.UpsertItemAsync(item, new PartitionKey(item.Id));
                return response.Resource;
            }
            catch
            {
                return null;
            }
        }

        public static async Task<bool> DeleteItemAsync(string itemId, string userId)
        {
            if (_itemsContainer == null) await InitializeAsync();

            try
            {
                await _itemsContainer!.DeleteItemAsync<ShoppingListItem>(itemId, new PartitionKey(itemId));
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
} 
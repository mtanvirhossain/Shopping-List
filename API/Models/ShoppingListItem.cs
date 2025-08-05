using System;
using Newtonsoft.Json; // Added for JsonProperty attribute

namespace API.Models
{
    /// <summary>
    /// Represents a shopping list item in the system
    /// This model is used for storing shopping list items in Cosmos DB
    /// </summary>
    public class ShoppingListItem
    {
        /// <summary>
        /// Unique identifier for the shopping list item (GUID)
        /// This is the primary key and partition key in Cosmos DB
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// ID of the user who owns this shopping list item
        /// Used for data isolation and security - users can only see their own items
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Name/description of the item to purchase
        /// This is the main content that users see in their shopping list
        /// </summary>
        public string ItemName { get; set; } = string.Empty;

        /// <summary>
        /// Quantity of the item needed
        /// Allows users to specify how many of each item they need
        /// </summary>
        public int Quantity { get; set; }

        /// <summary>
        /// Category classification for the item (e.g., "Groceries", "Electronics")
        /// Helps users organize their shopping lists by grouping similar items
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Timestamp when the item was created
        /// Used for sorting, auditing, and displaying creation dates to users
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 
using System;
using System.Collections.Generic;
using System.Linq;

namespace API.Services
{
    /// <summary>
    /// Service for managing and validating subscription keys
    /// This simulates a real-world API management system where clients need subscription keys
    /// </summary>
    public static class SubscriptionKeyService
    {
        // In a real application, this would be stored in a database or Azure Key Vault
        // For demo purposes, we're using a static dictionary
        private static readonly Dictionary<string, SubscriptionKeyInfo> _validSubscriptionKeys = new Dictionary<string, SubscriptionKeyInfo>
        {
            // Demo subscription keys - in production, these would be generated and stored securely
            { "demo-key-12345", new SubscriptionKeyInfo { Key = "demo-key-12345", IsActive = true, RateLimit = 1000, CreatedAt = DateTime.UtcNow.AddDays(-30) } },
            { "premium-key-67890", new SubscriptionKeyInfo { Key = "premium-key-67890", IsActive = true, RateLimit = 5000, CreatedAt = DateTime.UtcNow.AddDays(-15) } },
            { "enterprise-key-11111", new SubscriptionKeyInfo { Key = "enterprise-key-11111", IsActive = true, RateLimit = 10000, CreatedAt = DateTime.UtcNow.AddDays(-7) } }
        };

        /// <summary>
        /// Validates if a subscription key is valid and active
        /// </summary>
        /// <param name="subscriptionKey">The subscription key to validate</param>
        /// <returns>True if the key is valid and active, false otherwise</returns>
        public static bool IsValidSubscriptionKey(string subscriptionKey)
        {
            // Check if the subscription key is null or empty
            if (string.IsNullOrWhiteSpace(subscriptionKey))
            {
                return false;
            }

            // Try to get the subscription key info from our dictionary
            if (_validSubscriptionKeys.TryGetValue(subscriptionKey, out SubscriptionKeyInfo? keyInfo))
            {
                // Check if the key is active
                return keyInfo.IsActive;
            }

            // If the key doesn't exist in our dictionary, it's invalid
            return false;
        }

        /// <summary>
        /// Gets subscription key information for logging and monitoring purposes
        /// </summary>
        /// <param name="subscriptionKey">The subscription key to get info for</param>
        /// <returns>SubscriptionKeyInfo if found, null otherwise</returns>
        public static SubscriptionKeyInfo? GetSubscriptionKeyInfo(string subscriptionKey)
        {
            // Try to get the subscription key info from our dictionary
            _validSubscriptionKeys.TryGetValue(subscriptionKey, out SubscriptionKeyInfo? keyInfo);
            return keyInfo;
        }

        /// <summary>
        /// Validates subscription key and returns detailed validation result
        /// This method provides more detailed information for debugging and monitoring
        /// </summary>
        /// <param name="subscriptionKey">The subscription key to validate</param>
        /// <returns>ValidationResult with detailed information about the validation</returns>
        public static ValidationResult ValidateSubscriptionKey(string subscriptionKey)
        {
            // Create a new validation result object
            var result = new ValidationResult();

            // Check if the subscription key is null or empty
            if (string.IsNullOrWhiteSpace(subscriptionKey))
            {
                result.IsValid = false;
                result.ErrorMessage = "Subscription key is required";
                return result;
            }

            // Try to get the subscription key info from our dictionary
            if (_validSubscriptionKeys.TryGetValue(subscriptionKey, out SubscriptionKeyInfo? keyInfo))
            {
                // Check if the key is active
                if (keyInfo.IsActive)
                {
                    result.IsValid = true;
                    result.SubscriptionKeyInfo = keyInfo;
                }
                else
                {
                    result.IsValid = false;
                    result.ErrorMessage = "Subscription key is inactive";
                }
            }
            else
            {
                result.IsValid = false;
                result.ErrorMessage = "Invalid subscription key";
            }

            return result;
        }
    }

    /// <summary>
    /// Represents information about a subscription key
    /// This class holds metadata about each subscription key
    /// </summary>
    public class SubscriptionKeyInfo
    {
        /// <summary>
        /// The actual subscription key value
        /// </summary>
        public string Key { get; set; } = string.Empty;

        /// <summary>
        /// Whether the subscription key is currently active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// The rate limit for this subscription (requests per day)
        /// </summary>
        public int RateLimit { get; set; }

        /// <summary>
        /// When this subscription key was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Represents the result of a subscription key validation
    /// This class provides detailed information about the validation process
    /// </summary>
    public class ValidationResult
    {
        /// <summary>
        /// Whether the subscription key is valid
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// Error message if validation failed
        /// </summary>
        public string ErrorMessage { get; set; } = string.Empty;

        /// <summary>
        /// Subscription key information if validation succeeded
        /// </summary>
        public SubscriptionKeyInfo? SubscriptionKeyInfo { get; set; }
    }
} 
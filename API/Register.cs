using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using API.Models;
using API.Services;

namespace API
{
    /// <summary>
    /// Azure Function for user registration
    /// Handles new user account creation with validation and security features
    /// </summary>
    public static class Register
    {
        /// <summary>
        /// Registers a new user in the system
        /// Validates subscription key, processes registration data, and creates user account
        /// </summary>
        /// <param name="req">HTTP request containing subscription key and registration data</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response with authentication token or error message</returns>
        [FunctionName("Register")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", "options", Route = "Register")] HttpRequest req,
            ILogger log)
        {
            // Log the start of the registration process
            log.LogInformation("Register function processed a request.");

            // Handle CORS preflight requests
            if (req.Method.ToLower() == "options")
            {
                log.LogInformation("Handling OPTIONS request for Register");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                req.HttpContext.Response.Headers.Add("Access-Control-Max-Age", "86400");
                return new OkResult();
            }

            try
            {
                // Step 1: Extract and validate subscription key from request headers
                // The subscription key should be sent in the 'X-Subscription-Key' header
                var subscriptionKey = req.Headers["X-Subscription-Key"].ToString();
                
                // Validate the subscription key using the subscription service
                var subscriptionValidation = SubscriptionKeyService.ValidateSubscriptionKey(subscriptionKey ?? string.Empty);
                if (!subscriptionValidation.IsValid)
                {
                    // Log the failed subscription key validation for monitoring
                    log.LogWarning("Invalid subscription key attempt in Register: {SubscriptionKey}", subscriptionKey);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new UnauthorizedObjectResult(new ErrorResponse 
                    { 
                        Message = $"Subscription key validation failed: {subscriptionValidation.ErrorMessage}",
                        Code = "INVALID_SUBSCRIPTION_KEY"
                    });
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in Register: {SubscriptionKey}", subscriptionKey);

                // Step 2: Read and parse the registration request body
                // The request body should contain JSON with user registration information
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                
                // Check if request body is empty
                if (string.IsNullOrEmpty(requestBody))
                {
                    log.LogWarning("Empty request body in Register");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = "Request body is required",
                        Code = "EMPTY_REQUEST_BODY"
                    });
                }

                // Deserialize the JSON request body into a RegisterRequest object
                RegisterRequest? registerRequest;
                try
                {
                    registerRequest = JsonConvert.DeserializeObject<RegisterRequest>(requestBody);
                }
                catch (JsonException ex)
                {
                    log.LogWarning(ex, "Invalid JSON in Register request body");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = "Invalid JSON format in request body",
                        Code = "INVALID_JSON"
                    });
                }

                // Check if deserialization was successful
                if (registerRequest == null)
                {
                    log.LogWarning("Failed to deserialize Register request");
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = "Invalid registration data",
                        Code = "INVALID_REGISTRATION_DATA"
                    });
                }

                // Step 3: Process the registration using UserService
                // The UserService handles all validation, password hashing, and user creation
                var result = await UserService.RegisterUserAsync(registerRequest);
                
                // Check if registration was successful
                if (!result.IsSuccess)
                {
                    // Log the registration failure with details
                    log.LogWarning("Registration failed for username {Username}: {ErrorMessage}", 
                        registerRequest.Username, result.ErrorMessage);
                    
                    // Add CORS headers to the response
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                    req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                    
                    // Return appropriate HTTP status based on the type of error
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = result.ErrorMessage ?? "Registration failed",
                        Code = "REGISTRATION_FAILED"
                    });
                }

                // Step 4: Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                // Step 5: Return success response with authentication information
                // If registration is successful, the user is automatically logged in
                log.LogInformation("User registration successful for username: {Username}", registerRequest.Username);
                
                return new OkObjectResult(result.AuthResponse);
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the registration process
                log.LogError(ex, "Unexpected error during user registration");
                
                // Add CORS headers to the response
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                
                // Return a generic error response to avoid exposing internal details
                return new StatusCodeResult(500);
            }
        }
    }
}
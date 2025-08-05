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
    /// Azure Function for user login authentication
    /// Handles user authentication and JWT token generation
    /// </summary>
    public static class Login
    {
        /// <summary>
        /// Authenticates a user and returns a JWT token for authorized access
        /// Validates subscription key, processes login credentials, and generates auth token
        /// </summary>
        /// <param name="req">HTTP request containing subscription key and login credentials</param>
        /// <param name="log">Logger for recording function execution details</param>
        /// <returns>HTTP response with authentication token or error message</returns>
        [FunctionName("Login")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "login")] HttpRequest req,
            ILogger log)
        {
            // Log the start of the login process
            log.LogInformation("Login function processed a request.");

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
                    log.LogWarning("Invalid subscription key attempt in Login: {SubscriptionKey}", subscriptionKey);
                    return new UnauthorizedObjectResult(new ErrorResponse 
                    { 
                        Message = $"Subscription key validation failed: {subscriptionValidation.ErrorMessage}",
                        Code = "INVALID_SUBSCRIPTION_KEY"
                    });
                }

                // Log successful subscription key validation
                log.LogInformation("Subscription key validated successfully in Login: {SubscriptionKey}", subscriptionKey);

                // Step 2: Read and parse the login request body
                // The request body should contain JSON with user login credentials
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                
                // Check if request body is empty
                if (string.IsNullOrEmpty(requestBody))
                {
                    log.LogWarning("Empty request body in Login");
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = "Request body is required",
                        Code = "EMPTY_REQUEST_BODY"
                    });
                }

                // Deserialize the JSON request body into a LoginRequest object
                LoginRequest? loginRequest;
                try
                {
                    loginRequest = JsonConvert.DeserializeObject<LoginRequest>(requestBody);
                }
                catch (JsonException ex)
                {
                    log.LogWarning(ex, "Invalid JSON in Login request body");
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = "Invalid JSON format in request body",
                        Code = "INVALID_JSON"
                    });
                }

                // Check if deserialization was successful
                if (loginRequest == null)
                {
                    log.LogWarning("Failed to deserialize Login request");
                    return new BadRequestObjectResult(new ErrorResponse 
                    { 
                        Message = "Invalid login data",
                        Code = "INVALID_LOGIN_DATA"
                    });
                }

                // Step 3: Process the authentication using UserService
                // The UserService handles credential validation, account lockout, and token generation
                var result = await UserService.AuthenticateUserAsync(loginRequest.Username, loginRequest.Password);
                
                // Check if authentication was successful
                if (!result.IsSuccess)
                {
                    // Log the authentication failure (without exposing sensitive details)
                    log.LogWarning("Authentication failed for username {Username}: {ErrorMessage}", 
                        loginRequest.Username, result.ErrorMessage);
                    
                    // Return unauthorized status for failed authentication
                    return new UnauthorizedObjectResult(new ErrorResponse 
                    { 
                        Message = result.ErrorMessage ?? "Authentication failed",
                        Code = "AUTHENTICATION_FAILED"
                    });
                }

                // Step 4: Return success response with authentication information
                // If authentication is successful, return the JWT token and user info
                log.LogInformation("User authentication successful for username: {Username}", loginRequest.Username);
                
                return new OkObjectResult(result.AuthResponse);
            }
            catch (Exception ex)
            {
                // Log any unexpected errors that occur during the authentication process
                log.LogError(ex, "Unexpected error during user authentication");
                
                // Return a generic error response to avoid exposing internal details
                return new StatusCodeResult(500);
            }
        }
    }
}
using Microsoft.AspNetCore.Http;

namespace API.Services
{
    /// <summary>
    /// Helper service for handling CORS headers dynamically
    /// </summary>
    public static class CorsHelper
    {
        /// <summary>
        /// Sets CORS headers based on the request origin
        /// </summary>
        /// <param name="request">The HTTP request</param>
        /// <param name="response">The HTTP response</param>
        public static void SetCorsHeaders(HttpRequest request, HttpResponse response)
        {
            var origin = request.Headers["Origin"].ToString();
            
            // Allow both localhost:3000 and localhost:3001
            var allowedOrigin = (origin == "http://localhost:3001" || origin == "http://localhost:3000") ? origin : "http://localhost:3000";
            
            response.Headers.Add("Access-Control-Allow-Origin", allowedOrigin);
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
        }

        /// <summary>
        /// Sets CORS headers for OPTIONS preflight requests
        /// </summary>
        /// <param name="request">The HTTP request</param>
        /// <param name="response">The HTTP response</param>
        public static void SetCorsHeadersForOptions(HttpRequest request, HttpResponse response)
        {
            var origin = request.Headers["Origin"].ToString();
            
            // Allow both localhost:3000 and localhost:3001
            var allowedOrigin = (origin == "http://localhost:3001" || origin == "http://localhost:3000") ? origin : "http://localhost:3000";
            
            response.Headers.Add("Access-Control-Allow-Origin", allowedOrigin);
            response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
            response.Headers.Add("Access-Control-Max-Age", "86400");
        }
    }
}

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace API
{
    public static class UpdateShoppingList
    {
        [FunctionName("UpdateShoppingList")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", "options", Route = null)] HttpRequest req,
            ILogger log)
        {
            // Handle OPTIONS preflight request
            if (req.Method.ToLower() == "options")
            {
                log.LogInformation("Handling OPTIONS request for UpdateShoppingList");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");
                req.HttpContext.Response.Headers.Add("Access-Control-Max-Age", "86400");
                return new StatusCodeResult(200);
            }

            log.LogInformation("C# HTTP trigger function processed a request.");

            string name = req.Query["name"];

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            name = name ?? data?.name;

            string responseMessage = string.IsNullOrEmpty(name)
                ? "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response."
                : $"Hello, {name}. This HTTP triggered function executed successfully.";

            // Add CORS headers to the response
            req.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
            req.HttpContext.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            req.HttpContext.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Subscription-Key, Authorization");

            return new OkObjectResult(responseMessage);
        }
    }
}

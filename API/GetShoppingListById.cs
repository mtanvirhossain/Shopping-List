using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using API.Services;

namespace API
{
    public static class GetShoppingListById
    {
        [FunctionName("GetShoppingListById")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "{id}")] HttpRequest req,
            string id,
            ILogger log)
        {
            log.LogInformation("GetShoppingListById function processed a request for ID: {id}", id);

            var item = ShoppingListService.GetItemById(id);
            if (item == null)
            {
                return new NotFoundObjectResult($"Item with ID {id} not found");
            }

            return new OkObjectResult(item);
        }
    }
}

using System.Collections.Generic;
using API.Models;

namespace API.Services
{
    public static class ShoppingListService
    {
        private static List<ShoppingListItem> _items = new List<ShoppingListItem>
        {
            new ShoppingListItem { Id = "1", ItemName = "Milk", Quantity = 2, Category = "Dairy" },
            new ShoppingListItem { Id = "2", ItemName = "Bread", Quantity = 1, Category = "Bakery" },
            new ShoppingListItem { Id = "3", ItemName = "Apples", Quantity = 6, Category = "Fruits" }
        };

        public static List<ShoppingListItem> GetAllItems()
        {
            return _items;
        }

        public static ShoppingListItem? GetItemById(string id)
        {
            return _items.Find(x => x.Id == id);
        }

        public static ShoppingListItem AddItem(ShoppingListItem item)
        {
            item.Id = (_items.Count + 1).ToString();
            _items.Add(item);
            return item;
        }

        public static ShoppingListItem? UpdateItem(string id, ShoppingListItem item)
        {
            var existingItem = _items.Find(x => x.Id == id);
            if (existingItem == null)
                return null;

            existingItem.ItemName = item.ItemName;
            existingItem.Quantity = item.Quantity;
            existingItem.Category = item.Category;

            return existingItem;
        }

        public static bool DeleteItem(string id)
        {
            var item = _items.Find(x => x.Id == id);
            if (item == null)
                return false;

            return _items.Remove(item);
        }
    }
} 
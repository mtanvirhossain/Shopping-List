# Shopping List Client

React frontend application for the Shopping List project. Built with TypeScript, Material-UI (MUI), and Axios for API communication.

## Features

- **Modern UI**: Clean and responsive design using Material-UI components
- **Tab Navigation**: Easy navigation between different sections
- **CRUD Operations**: 
  - View all shopping list items in a table format
  - Add new items with form validation
  - Search items by ID
  - Edit and delete items
- **Real-time Updates**: Automatic refresh of data after operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during API operations

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Backend API running on `http://localhost:7071`

## Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Make sure your backend API is running on `http://localhost:7071`

## API Endpoints

The application expects the following backend endpoints:

- `GET /api/GetShoppingList` - Get all items
- `GET /api/GetShoppingList/{id}` - Get item by ID
- `POST /api/AddItemInShoppingList` - Add new item
- `PUT /api/GetShoppingList/{id}` - Update item
- `DELETE /api/GetShoppingList/{id}` - Delete item

## Data Model

```typescript
interface ShoppingListItem {
    Id: string;
    ItemName: string;
    Quantity: number;
    Category: string;
}
```

## Features Overview

### 1. All Items Tab
- Displays all shopping list items in a modern table format
- Shows item name, quantity, and category
- Edit and delete buttons for each item
- Empty state when no items exist

### 2. Add Item Tab
- Form to add new items with validation
- Dropdown for category selection
- Quantity input with number validation
- Success/error feedback messages

### 3. Search Item Tab
- Search items by their unique ID
- Displays detailed item information in a card format
- Edit and delete options for found items
- Error handling for invalid IDs

## Technologies Used

- **React 19** - Frontend framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client for API communication
- **React Router** - Navigation (if needed for future expansion)

## Project Structure

```
src/
├── components/
│   ├── NavBar.tsx           # Navigation bar with tabs
│   ├── ShoppingListTable.tsx # Table displaying all items
│   ├── AddItemForm.tsx      # Form for adding new items
│   └── SearchItem.tsx       # Search functionality
├── services/
│   └── api.ts              # API service with Axios
├── types/
│   └── ShoppingListItem.ts  # TypeScript interfaces
├── App.tsx                 # Main application component
└── index.tsx              # Application entry point
```

## Customization

### Styling
The app uses Material-UI's theming system. You can customize colors, typography, and component styles in the `App.tsx` file.

### API Configuration
Update the `API_BASE_URL` in `src/services/api.ts` if your backend runs on a different port or URL.

## Troubleshooting

1. **CORS Issues**: Make sure your backend allows requests from `http://localhost:3000`
2. **API Connection**: Ensure your backend is running on `http://localhost:7071`
3. **Port Conflicts**: If port 3000 is in use, React will automatically suggest an alternative port

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## Contributing

Feel free to submit issues and enhancement requests! 
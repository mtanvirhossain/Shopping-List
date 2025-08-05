# Shopping List Application

A full-stack shopping list application built with Azure Functions (C#) backend and React (TypeScript) frontend, featuring **JWT authentication** and **subscription key validation**.

## 🔐 Authentication & Security Features

### **Dual Authentication System**
- **JWT Token Authentication**: Secure user authentication with JSON Web Tokens
- **Subscription Key Validation**: API access control with subscription keys
- **Password Hashing**: BCrypt secure password storage
- **User Data Isolation**: Each user only sees their own shopping list items

### **Available Subscription Keys** (for demo purposes)
- `demo-key-12345` - Demo tier (1000 requests/day)
- `premium-key-67890` - Premium tier (5000 requests/day)  
- `enterprise-key-11111` - Enterprise tier (10000 requests/day)

## 🏗️ Project Structure

```
Shopping List App/
├── API/                    # Azure Functions backend
│   ├── Models/            # Data models
│   ├── *.cs              # Azure Function endpoints
│   └── API.csproj        # C# project file
├── Client/                # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API service layer
│   │   └── types/        # TypeScript interfaces
│   └── package.json      # Node.js dependencies
├── scripts/              # Deployment and setup scripts
└── docs/                # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Backend Requirements:**
  - .NET 6.0 SDK
  - Azure Functions Core Tools
  - Visual Studio 2022 or VS Code with C# extension

- **Frontend Requirements:**
  - Node.js (version 14 or higher)
  - npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Shopping List App"
   ```

2. **Setup Backend (API):**
   ```bash
   cd API
   dotnet restore
   dotnet build
   ```

3. **Setup Frontend (Client):**
   ```bash
   cd Client
   npm install
   ```

## 🏃‍♂️ Running the Application

### Backend (Azure Functions)

1. **Navigate to API directory:**
   ```bash
   cd API
   ```

2. **Start the Azure Functions runtime:**
   ```bash
   func start
   ```

3. **The API will be available at:** `http://localhost:7071`

### Frontend (React)

1. **Navigate to Client directory:**
   ```bash
   cd Client
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser and navigate to:** `http://localhost:3000`

## 🔑 Authentication Flow

### **1. User Registration**
```
POST /api/Register
Headers: 
  X-Subscription-Key: demo-key-12345
Body: {
  "username": "john_doe",
  "email": "john@example.com", 
  "password": "securepassword123"
}
Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "john_doe",
  "email": "john@example.com"
}
```

### **2. User Login**
```
POST /api/Login
Headers:
  X-Subscription-Key: demo-key-12345
Body: {
  "username": "john_doe",
  "password": "securepassword123"
}
Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "john_doe", 
  "email": "john@example.com"
}
```

### **3. Protected API Calls**
```
GET /api/GetShoppingList
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  X-Subscription-Key: demo-key-12345
```

## 📋 API Endpoints

The backend provides the following REST endpoints:

### **Authentication Endpoints**
| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|------------------|
| `POST` | `/api/Login` | User login | `X-Subscription-Key` |
| `POST` | `/api/Register` | User registration | `X-Subscription-Key` |

### **Protected Shopping List Endpoints**
| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|------------------|
| `GET` | `/api/GetShoppingList` | Get user's shopping list items | `Authorization: Bearer <token>`, `X-Subscription-Key` |
| `POST` | `/api/AddItemInShoppingList` | Add new item to user's list | `Authorization: Bearer <token>`, `X-Subscription-Key` |
| `PUT` | `/api/{id}` | Update existing item | `Authorization: Bearer <token>`, `X-Subscription-Key` |
| `DELETE` | `/api/{id}` | Delete item by ID | `Authorization: Bearer <token>`, `X-Subscription-Key` |

### Data Models

#### **Shopping List Item**
```typescript
interface ShoppingListItem {
    Id: string;
    UserId: string;        // Links item to specific user
    ItemName: string;
    Quantity: number;
    Category: string;
    CreatedAt: DateTime;    // When item was created
}
```

#### **User Authentication**
```typescript
interface User {
    Id: string;
    Username: string;
    Email: string;
    PasswordHash: string;   // BCrypt hashed password
    CreatedAt: DateTime;    // When account was created
}

interface LoginRequest {
    username: string;
    password: string;
}

interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;          // JWT token
    username: string;
    email: string;
}
```

## 🎨 Frontend Features

### **Authentication & Security**
- **Login/Register System**: Secure user authentication with JWT tokens
- **Subscription Key Management**: Automatic subscription key inclusion in API requests
- **Token Storage**: Secure token storage in localStorage
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Logout Functionality**: Secure logout with token removal

### **Core Functionality**
- **View All Items**: Display user's shopping list items in a modern table format
- **Add Items**: Form-based item creation with validation
- **Search Items**: Find items by their unique ID
- **Edit Items**: Update existing item details
- **Delete Items**: Remove items from the list
- **User Data Isolation**: Each user only sees their own shopping list items

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Material-UI Components**: Modern, accessible UI components
- **Real-time Updates**: Automatic data refresh after operations
- **Error Handling**: Comprehensive error messages and loading states
- **Form Validation**: Client-side validation for data integrity

### **Authentication Flow**
1. **Login/Register Page**: Users must authenticate before accessing the app
2. **Token Validation**: Automatic token validation on app startup
3. **Protected Navigation**: Only authenticated users can access shopping list features

### **Tab Navigation** (After Authentication)
1. **All Items Tab**: View and manage user's shopping list items
2. **Add Item Tab**: Create new items with category selection
3. **Search Item Tab**: Find specific items by ID
4. **Logout Button**: Secure logout functionality in navigation bar

## 🛠️ Technologies Used

### Backend
- **.NET 8.0** - Framework
- **Azure Functions** - Serverless compute
- **C#** - Programming language
- **Newtonsoft.Json** - JSON serialization
- **JWT Authentication** - Secure token-based authentication
- **BCrypt** - Password hashing
- **Azure Cosmos DB** - NoSQL database for data persistence
- **Subscription Key Validation** - API access control

### Frontend
- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client with interceptors for authentication
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **JWT Token Management** - Secure token storage and validation
- **Subscription Key Integration** - Automatic subscription key inclusion

## 🔧 Development

### Backend Development

1. **Adding New Endpoints:**
   - Create new `.cs` files in the `API/` directory
   - Follow the Azure Functions pattern with `[FunctionName]` attribute
   - Use `HttpTrigger` for HTTP endpoints

2. **Data Models:**
   - Add models in the `API/Models/` directory
   - Use proper C# naming conventions

### Frontend Development

1. **Adding Components:**
   - Create new components in `Client/src/components/`
   - Use TypeScript interfaces for type safety
   - Follow Material-UI design patterns

2. **API Integration:**
   - Update `Client/src/services/api.ts` for new endpoints
   - Add corresponding types in `Client/src/types/`

## 🚀 Deployment

### Backend Deployment (Azure Functions)

1. **Install Azure CLI and Functions Core Tools:**
   ```bash
   az login
   func azure functionapp publish <your-function-app-name>
   ```

2. **Configure Application Settings:**
   - Set connection strings and environment variables in Azure Portal
   - Update CORS settings if needed

### Frontend Deployment

1. **Build for Production:**
   ```bash
   cd Client
   npm run build
   ```

2. **Deploy to Static Hosting:**
   - Azure Static Web Apps
   - Netlify
   - Vercel
   - GitHub Pages

## 🔍 Troubleshooting

### Common Issues

1. **Backend Connection Issues:**
   - Ensure Azure Functions runtime is running on port 7071
   - Check CORS settings in `host.json`
   - Verify all dependencies are installed

2. **Frontend Issues:**
   - Clear browser cache and node_modules
   - Run `npm install` to reinstall dependencies
   - Check console for detailed error messages

3. **API Endpoint Issues:**
   - Verify endpoint URLs in `Client/src/services/api.ts`
   - Check Azure Functions logs for backend errors
   - Ensure proper HTTP methods are used

### Debug Mode

**Backend Debug:**
```bash
cd API
func start --verbose
```

**Frontend Debug:**
```bash
cd Client
npm run dev -- --debug
```

## 📝 Environment Configuration

### Backend Environment Variables
Create `API/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet"
  }
}
```

### Frontend Environment Variables
Create `Client/.env`:
```env
VITE_API_BASE_URL=http://localhost:7071/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test both backend and frontend
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the individual README files in `API/` and `Client/` directories
3. Create an issue in the repository

---

**Note**: Make sure both the backend (API) and frontend (Client) are running simultaneously for the full application to work properly.

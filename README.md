# Shopping List App

A full-stack shopping list application built with React frontend and Azure Functions backend, featuring JWT authentication, Cosmos DB integration, and a beautiful modern UI with glassmorphism design.

![Shopping List App](https://img.shields.io/badge/React-19-blue) ![Azure Functions](https://img.shields.io/badge/Azure%20Functions-.NET%208-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Cosmos DB](https://img.shields.io/badge/Cosmos%20DB-Database-orange) ![Material-UI](https://img.shields.io/badge/Material--UI-5-blue)

## 🚀 Features

### Frontend Features
- **Modern React UI** - Built with React 19 and TypeScript
- **Beautiful Glassmorphism Design** - Modern dark theme with dot background and glass effects
- **Material-UI Design System** - Clean, responsive user interface with custom theming
- **User Authentication** - Login and registration with JWT tokens
- **Real-time Updates** - Instant CRUD operations for shopping items
- **Inline Editing** - Modal-based editing without page navigation
- **Advanced Search** - Search items by ID with full CRUD operations
- **Form Validation** - Client-side validation with error handling
- **Responsive Design** - Works on desktop and mobile devices
- **Loading States** - Beautiful loading animations and progress indicators
- **Error Handling** - Comprehensive error handling with user-friendly messages

### Backend Features
- **Azure Functions** - Serverless C# backend with .NET 8
- **JWT Authentication** - Secure token-based authentication
- **Cosmos DB Integration** - NoSQL database for scalable data storage
- **API Security** - Subscription key validation for all endpoints
- **Password Security** - BCrypt hashing with account lockout protection
- **Comprehensive Logging** - Detailed logging for monitoring and debugging
- **Dynamic CORS Support** - Automatic CORS handling for multiple frontend ports
- **Enhanced Error Handling** - Proper error responses with CORS headers

### Security Features
- **JWT Token Authentication** - Secure API access with session storage
- **Password Hashing** - BCrypt encryption for user passwords
- **Account Lockout** - Protection against brute force attacks
- **Subscription Keys** - Additional API security layer
- **Input Validation** - Server-side validation for all inputs
- **Dynamic CORS Configuration** - Proper cross-origin resource sharing setup
- **Token Expiration** - JWT token validation with expiration checks

## 🎨 UI/UX Enhancements

### Modern Design System
- **Dark Theme** - Beautiful dark mode with custom color palette
- **Glassmorphism Effects** - Frosted glass backgrounds and borders
- **Dot Background** - Subtle dot pattern for visual depth
- **Gradient Accents** - Modern gradient buttons and highlights
- **Smooth Animations** - Hover effects and transitions
- **Typography** - Custom font weights and spacing

### Enhanced User Experience
- **Inline Editing Modals** - Edit items without leaving current page
- **Context Preservation** - Maintain search results and table state
- **Real-time Feedback** - Immediate updates and success confirmations
- **Loading States** - Professional loading indicators
- **Error Recovery** - Graceful error handling with retry options
- **Keyboard Navigation** - Full keyboard support for accessibility

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library with custom theming
- **Axios** - HTTP client with request/response interceptors
- **Session Storage** - Secure token storage for JWT

### Backend Stack
- **Azure Functions** - Serverless compute platform
- **C# .NET 8** - Modern C# development
- **Cosmos DB** - NoSQL database with partition key `/id`
- **JWT Tokens** - JSON Web Token authentication
- **BCrypt.Net** - Password hashing library
- **Dynamic CORS** - Flexible CORS handling for development

### Database Schema
- **Users Container** - User accounts with authentication data
- **Lists Container** - Shopping list items with user association
- **Partition Strategy** - Both containers use `/id` as partition key
- **Cross-Partition Queries** - Optimized queries for user data retrieval

## 📁 Project Structure

```
Shopping-List/
├── API/                          # Azure Functions Backend
│   ├── Models/                   # Data models
│   │   ├── User.cs              # User model with auth data
│   │   └── ShoppingListItem.cs  # Shopping item model
│   ├── Services/                # Business logic services
│   │   ├── CosmosDbService.cs   # Database operations
│   │   ├── JwtService.cs        # JWT token management
│   │   ├── UserService.cs       # User authentication logic
│   │   ├── SubscriptionKeyService.cs # API key validation
│   │   └── CorsHelper.cs        # Dynamic CORS handling
│   ├── Login.cs                 # Login endpoint
│   ├── Register.cs              # Registration endpoint
│   ├── GetShoppingList.cs       # Get items endpoint
│   ├── GetShoppingListById.cs   # Get item by ID endpoint
│   ├── AddItemInShoppingList.cs # Add item endpoint
│   ├── UpdateShoppingItem.cs    # Update item endpoint
│   ├── DeleteShoppingItem.cs    # Delete item endpoint
│   ├── ValidateToken.cs         # Token validation endpoint
│   └── host.json               # Azure Functions configuration
├── Client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Login.tsx       # Authentication component
│   │   │   ├── NavBar.tsx      # Navigation component
│   │   │   ├── ShoppingListTable.tsx # Items display with inline editing
│   │   │   ├── AddItemForm.tsx # Add/edit form
│   │   │   ├── SearchItem.tsx  # Search functionality with inline editing
│   │   │   ├── ConnectionStatus.tsx # Backend connectivity status
│   │   │   └── AuthDebug.tsx   # Authentication debugging tools
│   │   ├── services/           # API services
│   │   │   ├── api.ts          # Shopping list API calls
│   │   │   └── auth.ts         # Authentication API calls
│   │   ├── types/              # TypeScript interfaces
│   │   │   ├── Auth.ts         # Authentication types
│   │   │   └── ShoppingListItem.ts # Item types
│   │   ├── App.tsx             # Main application component
│   │   └── index.tsx           # Application entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Vite configuration
├── scripts/                     # Deployment scripts
│   ├── setup.sh                # Environment setup
│   └── deploy.sh               # Deployment script
└── README.md                   # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js 18+** - For frontend development
- **.NET 8 SDK** - For backend development
- **Azure Functions Core Tools** - For local Azure Functions development
- **Azure Cosmos DB Account** - For database storage
- **Git** - For version control

### 1. Clone the Repository
```bash
git clone https://github.com/mtanvirhossain/Shopping-List.git
cd Shopping-List
```

### 2. Backend Setup (Azure Functions)

#### Install Dependencies
```bash
cd API
dotnet restore
```

#### Configure Environment Variables
Create `local.settings.json` in the API directory:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet",
    "FUNCTIONS_INPROC_NET8_ENABLED": "1",
    "JWT_SECRET_KEY": "your-jwt-secret-key-here",
    "COSMOS_DB_CONNECTION_STRING": "your-cosmos-db-connection-string",
    "JWT_ISSUER": "ShoppingListApp",
    "JWT_AUDIENCE": "ShoppingListUsers"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

#### Start Azure Functions
```bash
func start
```
The API will be available at `http://localhost:7071`

### 3. Frontend Setup (React)

#### Install Dependencies
```bash
cd Client
npm install
```

#### Start Development Server
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000` or `http://localhost:3001`

### 4. Database Setup (Cosmos DB)

#### Create Cosmos DB Resources
1. **Database Name**: `ShoppingListAppDatabase`
2. **Containers**:
   - `users` (Partition key: `/id`)
   - `lists` (Partition key: `/id`)

#### Update Connection String
Replace the connection string in `local.settings.json` with your Cosmos DB connection string.

## 🔐 Authentication Flow

### Registration Process
1. User fills registration form with username, email, password, first name, last name
2. Frontend sends POST request to `/api/register` with subscription key
3. Backend validates input data and checks for existing users
4. Password is hashed using BCrypt before storage
5. New user is created in Cosmos DB with active status
6. JWT token is generated and returned for automatic login

### Login Process
1. User enters username/email and password
2. Frontend sends POST request to `/api/login` with subscription key
3. Backend validates credentials and checks account status
4. Failed attempts are tracked with account lockout protection
5. JWT token is generated and returned on successful authentication

### API Request Authentication
1. JWT token is included in Authorization header as `Bearer {token}`
2. Subscription key is included in `X-Subscription-Key` header
3. Each protected endpoint validates both token and subscription key
4. User ID is extracted from JWT token for data isolation

## 🔧 API Endpoints

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/ValidateToken` - Server-side token validation

### Shopping List Endpoints
- `GET /api/GetShoppingList` - Get all user's items
- `GET /api/GetShoppingListById/{id}` - Get specific item by ID
- `POST /api/AddItemInShoppingList` - Add new item
- `PUT /api/UpdateShoppingItem/{id}` - Update existing item
- `DELETE /api/DeleteShoppingItem/{id}` - Delete item

### Headers Required
```
Authorization: Bearer {jwt-token}
X-Subscription-Key: {subscription-key}
Content-Type: application/json
```

## 🎯 New Features & Improvements

### ✨ Inline Editing System
- **Modal-based editing** - Edit items without leaving current page
- **Context preservation** - Maintain search results and table state
- **Real-time updates** - Immediate UI updates after edits
- **Consistent experience** - Same editing flow across all components

### 🔍 Enhanced Search Functionality
- **Search by ID** - Find specific items by their unique identifier
- **Full CRUD operations** - Edit and delete items directly from search results
- **Inline editing** - Edit items without losing search context
- **Error handling** - Proper error messages for invalid searches

### 🎨 Modern UI Design
- **Dark theme** - Beautiful dark mode with custom color palette
- **Glassmorphism effects** - Frosted glass backgrounds and borders
- **Dot background** - Subtle dot pattern for visual depth
- **Gradient accents** - Modern gradient buttons and highlights
- **Smooth animations** - Hover effects and transitions

### 🔧 Technical Improvements
- **Dynamic CORS handling** - Automatic CORS support for multiple frontend ports
- **Enhanced error handling** - Comprehensive error responses with CORS headers
- **Session storage** - Secure JWT token storage
- **Loading states** - Professional loading indicators
- **Form validation** - Improved client-side validation

### 🛡️ Security Enhancements
- **Token expiration** - JWT token validation with expiration checks
- **Server-side validation** - Enhanced token validation endpoint
- **CORS security** - Proper CORS configuration for development
- **Input sanitization** - Improved input validation and sanitization

## 🚀 Deployment

### Azure Functions Deployment
```bash
cd API
func azure functionapp publish {your-function-app-name}
```

### Frontend Deployment
```bash
cd Client
npm run build
# Deploy the dist/ folder to your hosting service
```

### Environment Variables for Production
Update the following in your Azure Function App settings:
- `JWT_SECRET_KEY` - Strong secret key for JWT signing
- `COSMOS_DB_CONNECTION_STRING` - Production Cosmos DB connection
- `JWT_ISSUER` - Your application identifier
- `JWT_AUDIENCE` - Your user audience identifier

## 🧪 Testing

### Frontend Testing
```bash
cd Client
npm test
```

### Backend Testing
```bash
cd API
dotnet test
```

### Manual Testing
1. Start both backend and frontend servers
2. Register a new user account
3. Login with the created account
4. Add, edit, and delete shopping list items
5. Test search functionality by searching for item IDs
6. Test inline editing in both table and search views
7. Test authentication by refreshing the page

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
- Ensure .NET 8 SDK is installed
- Run `dotnet restore` in API directory
- Check that all NuGet packages are compatible

#### Authentication Failures
- Verify JWT secret key is set in local.settings.json
- Check Cosmos DB connection string is correct
- Ensure subscription keys match between frontend and backend
- Check session storage for JWT tokens

#### CORS Issues
- Verify CORS settings in host.json
- Check that frontend URL is allowed in CORS configuration
- Ensure dynamic CORS handling is working for your port

#### Database Connection Issues
- Verify Cosmos DB connection string format
- Ensure database and containers exist with correct names
- Check that partition keys are set to `/id` for both containers

#### Search Issues
- Verify item IDs exist in the database
- Check that the user has permission to access the item
- Ensure the GetShoppingListById endpoint is properly configured

## 📊 Performance Considerations

### Frontend Optimizations
- **Code Splitting** - Lazy loading of components
- **Memoization** - React.memo for expensive components
- **Efficient Re-renders** - Proper dependency arrays in hooks
- **Optimistic Updates** - Immediate UI updates with server sync

### Backend Optimizations
- **Connection Pooling** - Cosmos DB client reuse
- **Efficient Queries** - Proper partition key usage
- **Caching** - JWT token validation caching
- **Cross-Partition Queries** - Optimized queries for user data

### Database Optimizations
- **Partition Strategy** - Using `/id` for even distribution
- **Indexing** - Proper index configuration for queries
- **Request Units** - Monitoring and optimizing RU consumption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tanvir Hossain**
- GitHub: [@mtanvirhossain](https://github.com/mtanvirhossain)
- Repository: [Shopping-List](https://github.com/mtanvirhossain/Shopping-List)

## 🙏 Acknowledgments

- React team for the amazing framework
- Microsoft Azure for serverless computing platform
- Material-UI team for the component library
- BCrypt.Net contributors for password security
- Cosmos DB team for the NoSQL database solution
- Lightswind for design inspiration

## 📈 Future Enhancements

### Planned Features
- **Email Verification** - Complete email verification workflow
- **Password Reset** - Forgot password functionality
- **Shopping List Sharing** - Share lists with other users
- **Categories** - Organize items by categories
- **Notifications** - Real-time notifications for shared lists
- **Mobile App** - React Native mobile application
- **Offline Support** - Progressive Web App capabilities
- **Data Export** - Export shopping lists to various formats
- **Bulk Operations** - Select and edit multiple items at once
- **Advanced Search** - Search by name, category, or date range

### Technical Improvements
- **Unit Tests** - Comprehensive test coverage
- **Integration Tests** - End-to-end testing
- **Monitoring** - Application Insights integration
- **CI/CD Pipeline** - Automated deployment
- **Docker Support** - Containerization for local development
- **GraphQL API** - Alternative to REST endpoints
- **Microservices** - Split into smaller services
- **Real-time Updates** - WebSocket integration for live updates
- **PWA Features** - Service workers and offline caching

---

**Happy Shopping List Management!** 🛒✨
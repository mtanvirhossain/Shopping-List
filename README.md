# Shopping List App

A full-stack shopping list application built with React frontend and Azure Functions backend, featuring JWT authentication and Cosmos DB integration.

![Shopping List App](https://img.shields.io/badge/React-19-blue) ![Azure Functions](https://img.shields.io/badge/Azure%20Functions-.NET%208-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Cosmos DB](https://img.shields.io/badge/Cosmos%20DB-Database-orange)

## 🚀 Features

### Frontend Features
- **Modern React UI** - Built with React 19 and TypeScript
- **Material-UI Design** - Clean, responsive user interface
- **User Authentication** - Login and registration with JWT tokens
- **Real-time Updates** - Instant CRUD operations for shopping items
- **Form Validation** - Client-side validation with error handling
- **Responsive Design** - Works on desktop and mobile devices

### Backend Features
- **Azure Functions** - Serverless C# backend with .NET 8
- **JWT Authentication** - Secure token-based authentication
- **Cosmos DB Integration** - NoSQL database for scalable data storage
- **API Security** - Subscription key validation for all endpoints
- **Password Security** - BCrypt hashing with account lockout protection
- **Comprehensive Logging** - Detailed logging for monitoring and debugging

### Security Features
- **JWT Token Authentication** - Secure API access
- **Password Hashing** - BCrypt encryption for user passwords
- **Account Lockout** - Protection against brute force attacks
- **Subscription Keys** - Additional API security layer
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Proper cross-origin resource sharing setup

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library
- **Axios** - HTTP client with request/response interceptors

### Backend Stack
- **Azure Functions** - Serverless compute platform
- **C# .NET 8** - Modern C# development
- **Cosmos DB** - NoSQL database with partition key `/id`
- **JWT Tokens** - JSON Web Token authentication
- **BCrypt.Net** - Password hashing library

### Database Schema
- **Users Container** - User accounts with authentication data
- **Lists Container** - Shopping list items with user association
- **Partition Strategy** - Both containers use `/id` as partition key

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
│   │   └── SubscriptionKeyService.cs # API key validation
│   ├── Login.cs                 # Login endpoint
│   ├── Register.cs              # Registration endpoint
│   ├── GetShoppingList.cs       # Get items endpoint
│   ├── AddItemInShoppingList.cs # Add item endpoint
│   ├── UpdateShoppingItem.cs    # Update item endpoint
│   ├── DeleteShoppingItem.cs    # Delete item endpoint
│   └── host.json               # Azure Functions configuration
├── Client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Login.tsx       # Authentication component
│   │   │   ├── NavBar.tsx      # Navigation component
│   │   │   ├── ShoppingListTable.tsx # Items display
│   │   │   ├── AddItemForm.tsx # Add/edit form
│   │   │   └── SearchItem.tsx  # Search functionality
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
The frontend will be available at `http://localhost:3000`

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

### Shopping List Endpoints
- `GET /api/GetShoppingList` - Get all user's items
- `POST /api/AddItemInShoppingList` - Add new item
- `PUT /api/{id}` - Update existing item
- `DELETE /api/{id}` - Delete item

### Headers Required
```
Authorization: Bearer {jwt-token}
X-Subscription-Key: {subscription-key}
Content-Type: application/json
```

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
5. Test authentication by refreshing the page

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

#### CORS Issues
- Verify CORS settings in host.json
- Check that frontend URL is allowed in CORS configuration

#### Database Connection Issues
- Verify Cosmos DB connection string format
- Ensure database and containers exist with correct names
- Check that partition keys are set to `/id` for both containers

## 📊 Performance Considerations

### Frontend Optimizations
- **Code Splitting** - Lazy loading of components
- **Memoization** - React.memo for expensive components
- **Efficient Re-renders** - Proper dependency arrays in hooks

### Backend Optimizations
- **Connection Pooling** - Cosmos DB client reuse
- **Efficient Queries** - Proper partition key usage
- **Caching** - JWT token validation caching

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

### Technical Improvements
- **Unit Tests** - Comprehensive test coverage
- **Integration Tests** - End-to-end testing
- **Monitoring** - Application Insights integration
- **CI/CD Pipeline** - Automated deployment
- **Docker Support** - Containerization for local development
- **GraphQL API** - Alternative to REST endpoints
- **Microservices** - Split into smaller services

---

**Happy Shopping List Management!** 🛒✨
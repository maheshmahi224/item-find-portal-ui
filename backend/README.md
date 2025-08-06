# Lost & Found Portal - Backend API

A Node.js + TypeScript backend API for the Lost & Found Portal with MongoDB integration and automatic item cleanup.

## Features

- ✅ **Real-time Data Sync**: All devices see the same data in real-time
- ✅ **Automatic Deletion**: Items automatically deleted after 72 hours (3 days)
- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete items
- ✅ **Advanced Filtering**: Search by category, location, department, claimed status
- ✅ **Pagination**: Efficient data loading with pagination support
- ✅ **Statistics**: Real-time statistics and analytics
- ✅ **Type Safety**: Full TypeScript support with shared types
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **Security**: CORS, Helmet, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Environment**: dotenv

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/lost-found-portal

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Auto-deletion Configuration
   AUTO_DELETE_HOURS=72
   CLEANUP_INTERVAL_HOURS=1
   ```

3. **Database Connection**:
   - For local MongoDB: Start your MongoDB service
   - For cloud MongoDB: Update `MONGODB_URI` with your connection string

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## API Endpoints

### Items

#### GET `/api/items`
Get all items with filtering and pagination

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category
- `location` (string): Filter by location
- `department` (string): Filter by department
- `claimed` (boolean): Filter by claimed status
- `search` (string): Search in name and description
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort direction - asc/desc (default: desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET `/api/items/:id`
Get single item by ID

#### POST `/api/items`
Create new item

**Request Body**:
```json
{
  "name": "iPhone 13",
  "description": "Black iPhone with cracked screen",
  "location": "Library",
  "department": "Computer Science",
  "founderName": "John Doe",
  "contactInfo": "john@example.com",
  "imageUrl": "https://example.com/image.jpg",
  "category": "Phone"
}
```

#### PUT `/api/items/:id/claim`
Claim an item

**Request Body**:
```json
{
  "claimantName": "Jane Smith"
}
```

#### PUT `/api/items/:id`
Update an item (only unclaimed items)

#### DELETE `/api/items/:id`
Delete an item

#### GET `/api/items/stats/overview`
Get statistics

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "claimed": 25,
    "unclaimed": 75,
    "categoryStats": [...],
    "locationStats": [...]
  }
}
```

### Health Check

#### GET `/health`
Server health check

## Automatic Cleanup System

The backend includes an automatic cleanup system that:

- **Deletes expired items**: Unclaimed items older than 72 hours (configurable)
- **Runs periodically**: Checks every hour (configurable)
- **Logs activity**: Provides detailed logs of cleanup operations
- **TTL Index**: Uses MongoDB TTL index for automatic deletion

### Configuration

- `AUTO_DELETE_HOURS`: Time before items are deleted (default: 72)
- `CLEANUP_INTERVAL_HOURS`: How often to check for expired items (default: 1)

## Database Schema

### Item Schema
```typescript
{
  name: String (required, max 100 chars),
  description: String (max 500 chars),
  location: String (required),
  department: String (required),
  founderName: String (required),
  contactInfo: String,
  imageUrl: String (required),
  category: String (enum: ItemCategory),
  claimed: Boolean (default: false),
  claimedBy: String,
  claimedAt: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- `createdAt` (descending) - For sorting and TTL
- `category` - For filtering
- `location` - For filtering
- `claimed` - For filtering
- `name, description` - Text search
- TTL index on `createdAt` for automatic deletion

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Mongoose validation errors
- **Database Errors**: Connection and query errors
- **Not Found**: 404 for missing resources
- **Bad Request**: 400 for invalid input
- **Server Errors**: 500 for internal errors

All errors return a consistent format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## CORS Configuration

The API is configured to accept requests from the frontend origin:
- Development: `http://localhost:5173`
- Production: Configure via `CORS_ORIGIN` environment variable

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request body validation
- **Rate Limiting**: Built-in Express rate limiting
- **Error Sanitization**: Safe error messages

## Development

### Project Structure
```
src/
├── models/          # MongoDB schemas
├── routes/          # API routes
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── types/           # TypeScript types
└── server.ts        # Main server file
```

### Adding New Features

1. **New Route**: Add to `src/routes/`
2. **New Model**: Add to `src/models/`
3. **New Type**: Add to `src/types/`
4. **New Utility**: Add to `src/utils/`

### Testing

The API can be tested using:
- Postman
- curl
- Frontend application
- Any HTTP client

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=your-frontend-domain
```

### Build for Production
```bash
npm run build
npm start
```

## Monitoring

The API includes:
- Request logging (Morgan)
- Error logging
- Cleanup service logging
- Health check endpoint

## Support

For issues and questions:
1. Check the logs for error details
2. Verify environment variables
3. Ensure MongoDB is running
4. Check CORS configuration 
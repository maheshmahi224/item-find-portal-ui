# Lost & Found Portal

A modern, real-time lost and found management system built with React, TypeScript, and MongoDB.

## 🚀 Features

- ✅ **Real-time Data Sync**: All devices see the same data in real-time
- ✅ **Automatic Deletion**: Items automatically deleted after 72 hours (3 days)
- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete items
- ✅ **Advanced Filtering**: Search by category, location, department, claimed status
- ✅ **Pagination**: Efficient data loading with pagination support
- ✅ **Statistics**: Real-time statistics and analytics
- ✅ **Type Safety**: Full TypeScript support with shared types
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **Security**: CORS, Helmet, and input validation
- ✅ **Cloud Ready**: Deploy to Vercel, Netlify, Railway, or Render

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** for form handling

### Backend
- **Node.js** with TypeScript
- **Express.js** for API framework
- **MongoDB** with Mongoose ODM
- **MongoDB Atlas** for cloud database
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for logging

## 📦 Project Structure

```
item-find-portal-ui/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── backend/               # Backend source code
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── package.json       # Backend dependencies
├── vercel.json           # Vercel configuration
├── netlify.toml          # Netlify configuration
└── DEPLOYMENT.md         # Deployment guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Development

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Start development server**
   ```bash
npm run dev
```

3. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Testing
- **Add Items**: Click "Add Item" button and fill the form
- **View Items**: Items appear in real-time across all devices
- **Claim Items**: Click "Claim" on any item
- **Delete Items**: Click "Delete" on any item
- **Search & Filter**: Use the search bar and filters at the top

## 🌐 Deployment

This project is configured for easy deployment to cloud platforms:

### Quick Deployment Options

1. **Vercel (Recommended)**
   - Frontend: Deploy to Vercel
   - Backend: Deploy to Vercel Functions

2. **Netlify + Railway**
   - Frontend: Deploy to Netlify
   - Backend: Deploy to Railway

3. **Netlify + Render**
   - Frontend: Deploy to Netlify
   - Backend: Deploy to Render

### Detailed Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## 📚 API Documentation

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-backend-domain.com/api`

### Endpoints

#### Items
- `GET /items` - Get all items with filtering and pagination
- `GET /items/:id` - Get single item by ID
- `POST /items` - Create new item
- `PUT /items/:id/claim` - Claim an item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item
- `GET /items/stats/overview` - Get statistics

#### Health Check
- `GET /health` - Server health check

### Example API Usage

```javascript
// Get all items
const response = await fetch('https://your-backend-domain.com/api/items');
const data = await response.json();

// Create new item
const newItem = await fetch('https://your-backend-domain.com/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'iPhone 13',
    description: 'Black iPhone with cracked screen',
    location: 'Library',
    department: 'Computer Science',
    founderName: 'John Doe',
    contactInfo: 'john@example.com',
    imageUrl: 'https://example.com/image.jpg',
    category: 'Phone'
  })
});
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_NAME=Lost & Found Portal
VITE_APP_VERSION=1.0.0
```

#### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
AUTO_DELETE_HOURS=72
CLEANUP_INTERVAL_HOURS=1
```

### Automatic Cleanup

The system automatically deletes unclaimed items after 72 hours (3 days):
- Configured via `AUTO_DELETE_HOURS` environment variable
- Runs every hour (configurable via `CLEANUP_INTERVAL_HOURS`)
- Only affects unclaimed items
- Logs cleanup activities

## 🔒 Security Features

- **CORS Protection**: Configured to only allow specific origins
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling without exposing sensitive data
- **MongoDB Security**: Uses MongoDB Atlas with secure connection
- **Environment Variables**: Sensitive data stored in environment variables

## 📊 Monitoring

### Health Check
```bash
curl https://your-backend-domain.com/health
```

### API Status
```bash
curl https://your-backend-domain.com/api/items
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Verify environment variables are set correctly
3. Check the deployment logs
4. Test the API endpoints
5. Ensure MongoDB connection is working

## 🎉 Success!

Once deployed, your Lost & Found Portal will be:
- ✅ Accessible from anywhere in the world
- ✅ Real-time data synchronization across all devices
- ✅ Automatic cleanup of old items
- ✅ Secure and production-ready
- ✅ Scalable and maintainable

# Deployment Guide - Lost & Found Portal

## 🚀 Quick Deployment

### Step 1: Deploy Backend
1. Go to [Railway](https://railway.app) or [Render](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Add environment variables:
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://maheshmahi224dev:Mahesh123@database1.jj35k7q.mongodb.net/lost-found-portal?retryWrites=true&w=majority&appName=database1
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend-domain.com
   AUTO_DELETE_HOURS=72
   CLEANUP_INTERVAL_HOURS=1
   ```

### Step 2: Deploy Frontend
1. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `.` (root)
4. Add environment variables:
   ```env
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   VITE_APP_NAME=Lost & Found Portal
   VITE_APP_VERSION=1.0.0
   ```

### Step 3: Update URLs
After deployment, update the environment variables with your actual URLs.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **MongoDB Atlas**: Your database is already configured
3. **Environment Variables**: Configure them in your deployment platform

## 🔧 Environment Variables Setup

### Backend Environment Variables
Set these in your backend deployment platform:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://maheshmahi224dev:Mahesh123@database1.jj35k7q.mongodb.net/lost-found-portal?retryWrites=true&w=majority&appName=database1
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
AUTO_DELETE_HOURS=72
CLEANUP_INTERVAL_HOURS=1
```

### Frontend Environment Variables
Set these in your frontend deployment platform:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_NAME=Lost & Found Portal
VITE_APP_VERSION=1.0.0
```

## 🎯 Deployment Steps

### Step 1: Deploy Backend

#### Vercel Backend Deployment
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set the **Root Directory** to `backend`
4. Configure environment variables
5. Deploy

#### Railway Backend Deployment
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set the **Root Directory** to `backend`
4. Configure environment variables
5. Deploy

#### Render Backend Deployment
1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the **Root Directory** to `backend`
5. Configure environment variables
6. Deploy

### Step 2: Deploy Frontend

#### Vercel Frontend Deployment
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set the **Root Directory** to `.` (root)
4. Configure environment variables with your backend URL
5. Deploy

#### Netlify Frontend Deployment
1. Go to [Netlify](https://netlify.com)
2. Import your GitHub repository
3. Set the **Base directory** to `.` (root)
4. Set the **Build command** to `npm run build`
5. Set the **Publish directory** to `dist`
6. Configure environment variables with your backend URL
7. Deploy

### Step 3: Update Environment Variables

After getting your deployment URLs:

1. **Update Backend CORS**: Set `CORS_ORIGIN` to your frontend URL
2. **Update Frontend API URL**: Set `VITE_API_BASE_URL` to your backend URL

## 🔗 Example URLs

### Backend URLs
- **Vercel**: `https://your-app-name.vercel.app`
- **Railway**: `https://your-app-name.railway.app`
- **Render**: `https://your-app-name.onrender.com`

### Frontend URLs
- **Vercel**: `https://your-app-name.vercel.app`
- **Netlify**: `https://your-app-name.netlify.app`

## 📝 Configuration Files

### Backend Configuration
- `backend/vercel.json` - Vercel configuration
- `backend/package.json` - Build scripts
- `backend/.env` - Environment variables (don't commit this)

### Frontend Configuration
- `vercel.json` - Vercel configuration
- `netlify.toml` - Netlify configuration
- `.env` - Environment variables (don't commit this)

## 🔒 Security Notes

1. **JWT Secret**: Change the JWT secret in production
2. **CORS**: Only allow your frontend domain
3. **MongoDB**: Your connection string is already secure
4. **Environment Variables**: Never commit `.env` files

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CORS_ORIGIN` matches your frontend URL exactly
2. **Build Failures**: Check if all dependencies are installed
3. **Database Connection**: Verify MongoDB Atlas network access
4. **Environment Variables**: Ensure all required variables are set

### Debug Steps

1. Check deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check MongoDB connection
5. Verify CORS configuration

## 📊 Monitoring

### Backend Health Check
Test your backend health endpoint:
```
GET https://your-backend-domain.com/health
```

### API Endpoints
Test your API endpoints:
```
GET https://your-backend-domain.com/api/items
POST https://your-backend-domain.com/api/items
```

## 🔄 Continuous Deployment

Both Vercel and Netlify support automatic deployments:
- Push to `main` branch triggers deployment
- Preview deployments for pull requests
- Automatic rollback on failures

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test locally first
4. Check the platform's documentation

## 🎉 Success!

Once deployed, your Lost & Found Portal will be:
- ✅ Accessible from anywhere
- ✅ Real-time data sync across devices
- ✅ Automatic item cleanup (72 hours)
- ✅ Secure MongoDB connection
- ✅ Production-ready configuration 
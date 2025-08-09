import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';
import sharp from 'sharp';
import { connectDatabase } from './utils/database';
import { CleanupService } from './utils/cleanup';
import { errorHandler, notFound } from './middleware/errorHandler';
import itemsRouter from './routes/items';

// Load environment variables
dotenv.config();

// Tune sharp for better performance and reduced resource usage
sharp.concurrency(Math.max(1, Math.min(os.cpus().length, 4)));
sharp.cache({ files: 0, items: 512, memory: 256 });

const app = express();
const PORT = process.env.PORT || 5000;
// Support multiple origins (comma-separated), fallback to localhost
const RAW_CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const ALLOWED_ORIGINS = RAW_CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

// Security middleware
// Allow cross-origin resource loading for images by disabling CORP globally;
// we explicitly set CORP per static route below.
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin or non-browser requests (no Origin header)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Friendly root: redirect to health to avoid 404 confusion
app.get('/', (_req, res) => {
  res.redirect('/health');
});

// Serve uploads folder as static
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    etag: true,
    lastModified: true,
    cacheControl: true,
    maxAge: '365d',
    setHeaders: (res, filePath) => {
      if (/\.(?:png|jpg|jpeg|webp|avif)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        // Allow images to be embedded cross-origin (frontend on a different host)
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    },
  })
);

// API routes
app.use('/api/items', itemsRouter);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start cleanup service
    const cleanupService = CleanupService.getInstance();
    cleanupService.startCleanup();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 CORS Origin(s): ${ALLOWED_ORIGINS.join(', ') || 'N/A'}`);
      console.log(`🗑️ Auto-deletion: ${process.env.AUTO_DELETE_HOURS || 72} hours`);
      console.log(`🔄 Cleanup interval: ${process.env.CLEANUP_INTERVAL_HOURS || 1} hour(s)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer(); 
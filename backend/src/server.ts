import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import { connectDB } from './utils/database';
import { startCleanupService } from './utils/cleanup';
import itemRoutes from './routes/items';
import { Item } from './models/Item';

// --- Environment Variable Loading ---
console.log('[Server] Loading environment variables...');
dotenv.config();
console.log('[Server] Environment variables loaded.');

// Critical check for MONGO_URI
if (!process.env.MONGO_URI) {
  console.error('[Server] FATAL ERROR: MONGO_URI is not defined in the .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://finditatscient.vercel.app'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /--maheshmahi224\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// --- Middleware ---
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- API Routes ---
app.use('/api/items', itemRoutes);

// --- Server Initialization ---
const startServer = async () => {
  console.log('[Server] Initializing...');
  try {
    console.log('[Server] Connecting to database...');
    await connectDB();
    console.log('[Server] ✅ MongoDB connected successfully.');

    console.log('[Server] Ensuring MongoDB indexes...');
    await Item.ensureIndexes();
    console.log('[Server] ✅ MongoDB indexes ensured.');

    console.log('[Server] Starting cleanup service...');
    startCleanupService();
    console.log('[Server] ✅ Cleanup service started.');

    app.listen(PORT, () => {
      console.log(`[Server] ✅ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server] ❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
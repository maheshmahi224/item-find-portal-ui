import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import { connectDB } from './utils/database';
import { startCleanupService } from './utils/cleanup';
import itemRoutes from './routes/items';
import { Item } from './models/Item'; // Import Item model for index sync

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',             // Local dev frontend
  'https://finditatscient.vercel.app'  // Your deployed frontend
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow if the origin is in our list or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || /--maheshmahi224\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// --- Security Middleware ---
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images to be loaded cross-origin
}));

// --- Body Parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- API Routes ---
app.use('/api/items', itemRoutes);

// --- Server Initialization ---
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully.');

    // Ensure MongoDB indexes are created, including the TTL index for auto-deletion
    await Item.ensureIndexes();
    console.log('MongoDB indexes ensured.');

    startCleanupService();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
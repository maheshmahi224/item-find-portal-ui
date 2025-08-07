import 'express';

// Extend Express Request type to include multer file property

declare module 'express-serve-static-core' {
  interface Request {
    file?: any;
  }
}

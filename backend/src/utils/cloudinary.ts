import { v2 as cloudinary } from 'cloudinary';

const {
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env as Record<string, string | undefined>;

let isConfigured = false;

// Prefer explicit config; otherwise fall back to CLOUDINARY_URL
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  isConfigured = true;
} else if (CLOUDINARY_URL) {
  // cloudinary.config automatically reads CLOUDINARY_URL when called with no args
  cloudinary.config({ secure: true });
  // Basic sanity: ensure URL-like string exists
  isConfigured = true;
}

export { cloudinary, isConfigured };

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary, but only if the environment variables are set.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads a buffer to Cloudinary.
 * @param {Buffer} buffer The image buffer to upload.
 * @returns {Promise<UploadApiResponse>} A promise that resolves with the upload result.
 */
export const uploadToCloudinary = (buffer: Buffer): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured before attempting to upload
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return reject(new Error('Cloudinary is not configured.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload failed without an error response.'));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
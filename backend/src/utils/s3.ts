import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET = process.env.AWS_S3_BUCKET;

if (!BUCKET) {
  throw new Error('AWS_S3_BUCKET environment variable is not set');
}

const s3 = new S3Client({ region: REGION });

/**
 * Extracts the S3 object key from a full S3 URL or direct key.
 */
function getS3KeyFromUrl(url: string): string {
  // If the url is already a key, just return it
  if (!url.startsWith('http')) return url;
  // Otherwise, extract key from S3 URL
  const match = url.match(/https?:\/\/[^/]+\/(.+)/);
  if (match && match[1]) return decodeURIComponent(match[1]);
  throw new Error('Invalid S3 URL format');
}

/**
 * Deletes an object from S3 using its URL or key.
 */
export async function deleteImageFromS3(imageUrlOrKey: string): Promise<void> {
  const Key = getS3KeyFromUrl(imageUrlOrKey);
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key,
    }));
    console.log(`🗑️ Deleted image from S3: ${Key}`);
  } catch (err) {
    console.error(`❌ Failed to delete image from S3: ${Key}`, err);
    throw err;
  }
}

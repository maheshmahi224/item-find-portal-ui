import fs from 'fs';
import path from 'path';
import { Item } from '../models/Item';

const AUTO_DELETE_HOURS = parseInt(process.env.AUTO_DELETE_HOURS || '72', 10);
const CLEANUP_INTERVAL_HOURS = parseInt(process.env.CLEANUP_INTERVAL_HOURS || '1', 10);

const performCleanup = async (): Promise<void> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - AUTO_DELETE_HOURS);

    // Find unclaimed items older than the cutoff date
    const expiredItems = await Item.find({
      claimed: false,
      createdAt: { $lt: cutoffDate },
    });

    if (expiredItems.length === 0) {
      console.log('Cleanup service ran: No expired items to delete.');
      return;
    }

    console.log(`Cleanup service: Found ${expiredItems.length} expired items to delete.`);

    for (const item of expiredItems) {
      // Delete local image file if it exists
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const filename = path.basename(item.imageUrl);
        const imagePath = path.join(__dirname, '..', '..', 'uploads', filename);
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(`Failed to delete image: ${imagePath}`, err);
            }
          });
        }
      }
      // Delete the item from the database
      await Item.findByIdAndDelete(item._id);
    }

    console.log(`Cleanup service: Successfully deleted ${expiredItems.length} expired items.`);
  } catch (error) {
    console.error('Error during cleanup service execution:', error);
  }
};

export const startCleanupService = (): void => {
  console.log(`Cleanup service initiated. Will run every ${CLEANUP_INTERVAL_HOURS} hour(s).`);
  // Run once on startup, then set interval
  performCleanup();
  setInterval(performCleanup, CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000);
};
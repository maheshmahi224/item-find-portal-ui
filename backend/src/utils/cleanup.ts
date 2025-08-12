import { Item } from '../models/Item';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const AUTO_DELETE_HOURS = parseInt(process.env.AUTO_DELETE_HOURS || '72');
const CLEANUP_INTERVAL_HOURS = parseInt(process.env.CLEANUP_INTERVAL_HOURS || '1');

export class CleanupService {
  private static instance: CleanupService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  public startCleanup(): void {
    if (this.intervalId) {
      console.log('⚠️ Cleanup service is already running');
      return;
    }

    console.log(`🔄 Starting cleanup service - checking every ${CLEANUP_INTERVAL_HOURS} hour(s)`);
    
    // Run initial cleanup
    this.performCleanup();
    
    // Set up interval for periodic cleanup
    this.intervalId = setInterval(() => {
      this.performCleanup();
    }, CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000); // Convert hours to milliseconds
  }

  public stopCleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Cleanup service stopped');
    }
  }

  private async performCleanup(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - AUTO_DELETE_HOURS);

      // Find expired unclaimed items
      const expiredItems = await Item.find({
        createdAt: { $lt: cutoffDate },
        claimed: false
      });

      // Delete local image files for each expired item
      for (const item of expiredItems) {
        const url = item.imageUrl || '';
        // Skip external URLs (e.g., Cloudinary)
        if (!url || /^https?:\/\//i.test(url)) continue;
        // Our app stores '/uploads/<filename>' or 'uploads/<filename>'
        const filename = path.basename(url);
        if (!filename) continue;
        const imagePath = path.join(__dirname, '../uploads', filename);
        fs.unlink(imagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete image file for item ${item._id}:`, err);
          }
        });
      }

      // Delete expired items from MongoDB
      const result = await Item.deleteMany({
        createdAt: { $lt: cutoffDate },
        claimed: false
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️ Cleaned up ${result.deletedCount} expired items (older than ${AUTO_DELETE_HOURS} hours)`);
      } else {
        console.log(`✅ No expired items found to clean up`);
      }

      // Also check for items that will expire soon (within 1 hour) and log them
      const warningDate = new Date();
      warningDate.setHours(warningDate.getHours() - (AUTO_DELETE_HOURS - 1));

      const expiringItems = await Item.find({
        createdAt: { $lt: warningDate },
        claimed: false
      }).select('name createdAt');

      if (expiringItems.length > 0) {
        console.log(`⚠️ ${expiringItems.length} items will expire soon:`);
        expiringItems.forEach(item => {
          const hoursLeft = Math.round((AUTO_DELETE_HOURS * 60 * 60 * 1000 - (Date.now() - item.createdAt.getTime())) / (60 * 60 * 1000));
          console.log(`   - "${item.name}" (expires in ~${hoursLeft} hours)`);
        });
      }

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  public async getExpiringItems(): Promise<any[]> {
    try {
      const warningDate = new Date();
      warningDate.setHours(warningDate.getHours() - (AUTO_DELETE_HOURS - 1));

      return await Item.find({
        createdAt: { $lt: warningDate },
        claimed: false
      }).select('name createdAt category location');
    } catch (error) {
      console.error('❌ Error getting expiring items:', error);
      return [];
    }
  }

  public async getStats(): Promise<{ total: number; claimed: number; unclaimed: number; expiring: number }> {
    try {
      const [total, claimed, unclaimed, expiring] = await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ claimed: true }),
        Item.countDocuments({ claimed: false }),
        this.getExpiringItems().then(items => items.length)
      ]);

      return { total, claimed, unclaimed, expiring };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { total: 0, claimed: 0, unclaimed: 0, expiring: 0 };
    }
  }
} 
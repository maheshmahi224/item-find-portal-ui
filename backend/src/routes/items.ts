import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Item } from '../models/Item';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration with proper types
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
    }
  },
});

// POST /api/items - Create a new item
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description, category, location } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    // Process image with sharp
    const imageBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    let imageUrl;

    // Try uploading to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await uploadToCloudinary(imageBuffer);
        imageUrl = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload failed, falling back to local storage:', error);
      }
    }

    // Fallback to local storage if Cloudinary fails or is not configured
    if (!imageUrl) {
      const filename = `${uuidv4()}.webp`;
      const imagePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(imagePath, imageBuffer);
      imageUrl = `/uploads/${filename}`;
    }

    const newItem = new Item({
      name,
      description,
      category,
      location,
      imageUrl,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error while creating item.' });
  }
});

// GET /api/items - Get all items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/items/:id/claim - Claim an item
router.put('/:id/claim', async (req: Request, res: Response) => {
  try {
    const { claimedBy } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { claimed: true, claimedBy, claimedAt: new Date() },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // If image is stored locally, delete it
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filename = path.basename(item.imageUrl);
      const imagePath = path.join(uploadsDir, filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Item } from '../models/Item';
import { uploadToCloudinary } from '../utils/cloudinary';

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
    }
  },
});

// GET all items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
});

// POST a new item
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description, location, isLost } = req.body;
    let imageUrl = '';

    if (req.file) {
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // Try uploading to Cloudinary if configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const result = await uploadToCloudinary(processedImageBuffer);
          imageUrl = result.secure_url;
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
        }
      }

      // Fallback to local storage if Cloudinary is not configured or failed
      if (!imageUrl) {
        const filename = `${Date.now()}-${path.parse(req.file.originalname).name}.webp`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, processedImageBuffer);
        imageUrl = `/uploads/${filename}`;
      }
    }

    const newItem = new Item({
      name,
      description,
      location,
      isLost: isLost === 'true',
      imageUrl,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error while creating item.' });
  }
});


// PUT to claim an item
router.put('/:id/claim', async (req: Request, res: Response) => {
  try {
    const { claimedBy, contactInfo } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.claimed = true;
    item.claimedBy = claimedBy;
    item.contactInfo = contactInfo;
    item.claimedAt = new Date();

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE an item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // If image is stored locally, delete it
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filename = path.basename(item.imageUrl);
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
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

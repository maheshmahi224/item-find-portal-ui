import express, { Request, Response } from 'express';
import { Item } from '../models/Item';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, CreateItemRequest, ClaimItemRequest, FilterParams, PaginationParams } from '../types';

const router = express.Router();

// Multer storage config for local uploads
const storage = multer.diskStorage({
  destination: function (
    req: any,
    file: any,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (
    req: any,
    file: any,
    cb: (error: Error | null, filename: string) => void
  ) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/items - Get all items with filtering and pagination
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    location, 
    department, 
    claimed, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filters: FilterParams = {};
  const pagination: PaginationParams = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 20,
    sortBy: sortBy as string || 'createdAt',
    sortOrder: sortOrder as 'asc' | 'desc' || 'desc'
  };

  if (category) filters.category = category as any;
  if (location) filters.location = location as string;
  if (department) filters.department = department as string;
  if (claimed !== undefined) filters.claimed = claimed === 'true';
  if (search) filters.search = search as string;

  // Ensure pagination values are defined
  const pageNum = pagination.page || 1;
  const limitNum = pagination.limit || 20;
  const sortByField = pagination.sortBy || 'createdAt';
  const sortOrderDir = pagination.sortOrder || 'desc';

  // Build query
  let query = Item.find();

  // Apply filters
  if (filters.category) query = query.where('category', filters.category);
  if (filters.location) query = query.where('location', new RegExp(filters.location, 'i'));
  if (filters.department) query = query.where('department', new RegExp(filters.department, 'i'));
  if (filters.claimed !== undefined) query = query.where('claimed', filters.claimed);
  if (filters.search) {
    query = query.where({
      $or: [
        { name: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') }
      ]
    });
  }

  // Get total count for pagination
  const total = await Item.countDocuments(query.getQuery());

  // Apply pagination and sorting
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrderDir === 'asc' ? 1 : -1;
  
  const items = await query
    .sort({ [sortByField]: sortDirection })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const totalPages = Math.ceil(total / limitNum);

  const response: ApiResponse = {
    success: true,
    data: {
      items: items.map(item => item.toJSON ? item.toJSON() : { ...item, id: item._id?.toString?.() ?? item.id }),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    }
  };

  res.json(response);
}));

// GET /api/items/:id - Get single item by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }

  const response: ApiResponse = {
    success: true,
    data: item
  };

  res.json(response);
}));

// POST /api/items - Create new item with image upload
router.post('/', upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
  const itemData: any = req.body;

  // Validate required fields
  if (!itemData.name || !itemData.location || !itemData.department || !itemData.founderName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, location, department, founderName'
    });
  }

  // Handle image upload
  const file = req.file as any;
  if (file) {
    // Store relative path for use by frontend
    itemData.imageUrl = `/uploads/${file.filename}`;
  } else {
    itemData.imageUrl = '';
  }

  const newItem = new Item(itemData);
  const savedItem = await newItem.save();

  const response: ApiResponse = {
    success: true,
    data: savedItem,
    message: 'Item created successfully'
  };

  res.status(201).json(response);
}));

// PUT /api/items/:id/claim - Claim an item
router.put('/:id/claim', asyncHandler(async (req: Request, res: Response) => {
  const { claimantName }: ClaimItemRequest = req.body;

  if (!claimantName) {
    return res.status(400).json({
      success: false,
      error: 'Claimant name is required'
    });
  }

  const item = await Item.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }

  if (item.claimed) {
    return res.status(400).json({
      success: false,
      error: 'Item is already claimed'
    });
  }

  item.claimed = true;
  item.claimedBy = claimantName;
  item.claimedAt = new Date();

  const updatedItem = await item.save();

  const response: ApiResponse = {
    success: true,
    data: updatedItem,
    message: `Item claimed successfully by ${claimantName}`
  };

  res.json(response);
}));

// PUT /api/items/:id - Update item
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }

  // Don't allow updating claimed items
  if (item.claimed) {
    return res.status(400).json({
      success: false,
      error: 'Cannot update claimed items'
    });
  }

  const updatedItem = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  const response: ApiResponse = {
    success: true,
    data: updatedItem,
    message: 'Item updated successfully'
  };

  res.json(response);
}));

// DELETE /api/items/:id - Delete item
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }


  // Delete image file from local uploads if it exists
  if (item.imageUrl) {
    const imagePath = path.join(__dirname, '../../', item.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Failed to delete image file:', err);
      }
    });
  }

  await Item.findByIdAndDelete(req.params.id);

  const response: ApiResponse = {
    success: true,
    message: 'Item deleted successfully'
  };

  res.json(response);
}));

// GET /api/items/stats/overview - Get statistics
router.get('/stats/overview', asyncHandler(async (req: Request, res: Response) => {
  const [total, claimed, unclaimed] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ claimed: true }),
    Item.countDocuments({ claimed: false })
  ]);

  // Get category distribution
  const categoryStats = await Item.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get location distribution
  const locationStats = await Item.aggregate([
    {
      $group: {
        _id: '$location',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  const response: ApiResponse = {
    success: true,
    data: {
      total,
      claimed,
      unclaimed,
      categoryStats,
      locationStats
    }
  };

  res.json(response);
}));

export default router; 
import express, { Request, Response } from 'express';
import { Item } from '../models/Item';
import { deleteImageFromS3 } from '../utils/s3';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, CreateItemRequest, ClaimItemRequest, FilterParams, PaginationParams } from '../types';

const router = express.Router();

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
      items,
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

// POST /api/items - Create new item
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const itemData: CreateItemRequest = req.body;

  // Validate required fields
  if (!itemData.name || !itemData.location || !itemData.department || !itemData.founderName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, location, department, founderName'
    });
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

  // Delete image from S3 first (ignore error but log it)
  if (item.imageUrl) {
    try {
      await deleteImageFromS3(item.imageUrl);
    } catch (err) {
      console.error('Failed to delete image from S3:', err);
      // Optionally, you can return an error here if strict consistency is needed
    }
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
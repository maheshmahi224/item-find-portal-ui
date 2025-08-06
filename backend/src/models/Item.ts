import mongoose, { Document, Schema } from 'mongoose';
import { ItemCategory, FoundItem } from '../types';

export interface ItemDocument extends Document, Omit<FoundItem, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const itemSchema = new Schema<ItemDocument>({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  founderName: {
    type: String,
    required: [true, 'Founder name is required'],
    trim: true
  },
  contactInfo: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  category: {
    type: String,
    enum: Object.values(ItemCategory),
    required: [true, 'Category is required'],
    default: ItemCategory.Other
  },
  claimed: {
    type: Boolean,
    default: false
  },
  claimedBy: {
    type: String,
    trim: true
  },
  claimedAt: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Index for better query performance
itemSchema.index({ createdAt: -1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ claimed: 1 });
itemSchema.index({ name: 'text', description: 'text' });

// TTL index for automatic deletion after 72 hours (3 days)
itemSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 72 * 60 * 60, // 72 hours in seconds
  partialFilterExpression: { claimed: false } // Only delete unclaimed items
});

// Pre-save middleware to ensure proper data formatting
itemSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  if (this.isModified('description') && this.description) {
    this.description = this.description.trim();
  }
  if (this.isModified('location')) {
    this.location = this.location.trim();
  }
  if (this.isModified('department')) {
    this.department = this.department.trim();
  }
  if (this.isModified('founderName')) {
    this.founderName = this.founderName.trim();
  }
  if (this.isModified('contactInfo') && this.contactInfo) {
    this.contactInfo = this.contactInfo.trim();
  }
  next();
});

// Static method to get items with pagination and filtering
itemSchema.statics.findWithFilters = function(filters: any, pagination: any) {
  const query = this.find();
  
  // Apply filters
  if (filters.category) query.where('category', filters.category);
  if (filters.location) query.where('location', new RegExp(filters.location, 'i'));
  if (filters.department) query.where('department', new RegExp(filters.department, 'i'));
  if (filters.claimed !== undefined) query.where('claimed', filters.claimed);
  if (filters.search) {
    query.where({
      $or: [
        { name: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') }
      ]
    });
  }
  
  // Apply pagination
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;
  
  return query
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const Item = mongoose.model<ItemDocument>('Item', itemSchema); 
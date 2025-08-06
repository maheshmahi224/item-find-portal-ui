export enum ItemCategory {
  Phone = "Phone",
  Wallet = "Wallet",
  Watch = "Watch",
  Keys = "Keys",
  Jewelry = "Jewelry",
  Electronics = "Electronics",
  Clothing = "Clothing",
  Book = "Book",
  ID = "ID",
  Bag = "Bag",
  Other = "Other",
}

export interface FoundItem {
  id: string;
  name: string;
  description?: string;
  location: string;
  department: string;
  founderName: string;
  contactInfo?: string;
  imageUrl: string;
  createdAt: Date;
  category: ItemCategory;
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: Date;
}

export interface CreateItemRequest {
  name: string;
  description?: string;
  location: string;
  department: string;
  founderName: string;
  contactInfo?: string;
  imageUrl: string;
  category: ItemCategory;
}

export interface ClaimItemRequest {
  claimantName: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  category?: ItemCategory;
  location?: string;
  department?: string;
  claimed?: boolean;
  search?: string;
} 
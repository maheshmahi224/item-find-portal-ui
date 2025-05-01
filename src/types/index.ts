
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

export interface Department {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  name: string;
}

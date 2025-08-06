
import { ItemCategory } from "../types";

/**
 * Mock function to detect item category from an image
 * In a real implementation, this would call a machine learning API
 */
export const detectItemCategory = async (imageFile: File): Promise<ItemCategory> => {
  // This would be implemented using an actual ML API in production
  // For now, we'll return a random category as a mock
  const categories = Object.values(ItemCategory);
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};

/**
 * Mock function to get item name suggestions based on image and category
 */
export const getItemNameSuggestions = async (
  imageFile: File,
  category: ItemCategory
): Promise<string[]> => {
  // This would be implemented using an actual AI service in production
  // For now, we'll return empty suggestions
  const suggestions: Record<ItemCategory, string[]> = {
    [ItemCategory.Phone]: [],
    [ItemCategory.Wallet]: [],
    [ItemCategory.Watch]: [],
    [ItemCategory.Keys]: [],
    [ItemCategory.Jewelry]: [],
    [ItemCategory.Electronics]: [],
    [ItemCategory.Clothing]: [],
    [ItemCategory.Book]: [],
    [ItemCategory.ID]: [],
    [ItemCategory.Bag]: [],
    [ItemCategory.Other]: [],
  };

  return suggestions[category] || ["Unknown Item"];
};

/**
 * Mock function to get item description suggestions based on image and category
 */
export const getDescriptionSuggestions = async (
  imageFile: File,
  category: ItemCategory,
  itemName: string
): Promise<string[]> => {
  // This would be implemented using an actual AI service in production
  // For now, we'll return empty suggestions
  const suggestions: Record<ItemCategory, string[]> = {
    [ItemCategory.Phone]: [],
    [ItemCategory.Wallet]: [],
    [ItemCategory.Watch]: [],
    [ItemCategory.Keys]: [],
    [ItemCategory.Jewelry]: [],
    [ItemCategory.Electronics]: [],
    [ItemCategory.Clothing]: [],
    [ItemCategory.Book]: [],
    [ItemCategory.ID]: [],
    [ItemCategory.Bag]: [],
    [ItemCategory.Other]: [],
  };

  // Return empty array if no suggestions available
  return suggestions[category] || [];
};

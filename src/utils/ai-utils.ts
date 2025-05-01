
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
  // For now, we'll return category-specific suggestions as a mock
  const suggestions: Record<ItemCategory, string[]> = {
    [ItemCategory.Phone]: ["iPhone", "Samsung Galaxy", "Google Pixel", "OnePlus"],
    [ItemCategory.Wallet]: ["Leather Wallet", "Card Holder", "Money Clip", "Bifold Wallet"],
    [ItemCategory.Watch]: ["Casio Watch", "Digital Watch", "Smart Watch", "Analog Watch"],
    [ItemCategory.Keys]: ["House Keys", "Car Keys", "Office Keys", "Key Ring"],
    [ItemCategory.Jewelry]: ["Gold Ring", "Silver Necklace", "Bracelet", "Earrings"],
    [ItemCategory.Electronics]: ["Bluetooth Earbuds", "Power Bank", "Laptop Charger", "USB Drive"],
    [ItemCategory.Clothing]: ["Jacket", "Scarf", "Cap", "Gloves"],
    [ItemCategory.Book]: ["Textbook", "Notebook", "Novel", "Dictionary"],
    [ItemCategory.ID]: ["Student ID", "Driver's License", "Company Badge", "ID Card"],
    [ItemCategory.Bag]: ["Backpack", "Tote Bag", "Laptop Bag", "Purse"],
    [ItemCategory.Other]: ["Umbrella", "Water Bottle", "Glasses", "Medication"],
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
  // For now, we'll return generic descriptions as a mock
  const suggestions: Record<ItemCategory, string[]> = {
    [ItemCategory.Phone]: [
      `${itemName} with black case`,
      `${itemName} with cracked screen`,
      `${itemName} with clear case`,
      `${itemName} in working condition`,
    ],
    [ItemCategory.Wallet]: [
      `Black ${itemName}`,
      `Brown leather ${itemName}`,
      `${itemName} with credit cards inside`,
      `Small ${itemName} with zipper`,
    ],
    [ItemCategory.Watch]: [
      `${itemName} with leather strap`,
      `${itemName} with metal band`,
      `Digital ${itemName} with rubber band`,
      `${itemName} with dead battery`,
    ],
    [ItemCategory.Keys]: [
      `Set of ${itemName} with keychain`,
      `Single ${itemName} with blue tag`,
      `Multiple ${itemName} on ring`,
      `${itemName} with car remote`,
    ],
    [ItemCategory.Jewelry]: [
      `Gold ${itemName}`,
      `Silver ${itemName}`,
      `${itemName} with gemstones`,
      `Antique-looking ${itemName}`,
    ],
    [ItemCategory.Electronics]: [
      `New ${itemName}`,
      `${itemName} with charging cable`,
      `${itemName} in original packaging`,
      `${itemName} in good working condition`,
    ],
    [ItemCategory.Clothing]: [
      `Black ${itemName}`,
      `Blue ${itemName}`,
      `${itemName} size medium`,
      `New ${itemName} with tags`,
    ],
    [ItemCategory.Book]: [
      `Hardcover ${itemName}`,
      `${itemName} with highlighted pages`,
      `${itemName} with bookmarks`,
      `New ${itemName} in good condition`,
    ],
    [ItemCategory.ID]: [
      `${itemName} in card holder`,
      `${itemName} with lanyard`,
      `${itemName} issued in 2023`,
      `Expired ${itemName}`,
    ],
    [ItemCategory.Bag]: [
      `Black ${itemName}`,
      `${itemName} with multiple pockets`,
      `${itemName} with laptop compartment`,
      `${itemName} with personal items inside`,
    ],
    [ItemCategory.Other]: [
      `${itemName} in good condition`,
      `Slightly used ${itemName}`,
      `New looking ${itemName}`,
      `${itemName} with visible wear and tear`,
    ],
  };

  // If we don't have specific suggestions for this category, use the "Other" category
  return suggestions[category] || suggestions[ItemCategory.Other];
};


import React, { createContext, useContext, useState, useEffect } from "react";
import { FoundItem, ItemCategory } from "../types";
import { toast } from "../components/ui/sonner";

// Mock data for initial items
const initialItems: FoundItem[] = [
  {
    id: "1",
    name: "iPhone 13",
    description: "Black iPhone 13 with a cracked screen protector",
    location: "Library",
    department: "Computer Science and Engineering",
    founderName: "John Doe",
    contactInfo: "john.doe@example.com",
    imageUrl: "/placeholder.svg",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    category: ItemCategory.Phone,
    claimed: false,
  },
  {
    id: "2",
    name: "Blue Wallet",
    description: "A blue leather wallet with some cash inside",
    location: "Cafeteria",
    department: "Electronics and Electrical Engineering",
    founderName: "Jane Smith",
    contactInfo: "jane.smith@example.com",
    imageUrl: "/placeholder.svg",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    category: ItemCategory.Wallet,
    claimed: false,
  },
  {
    id: "3",
    name: "Casio Watch",
    description: "Black Casio digital watch with silver trim",
    location: "Gymnasium",
    department: "H&S Department",
    founderName: "Mike Johnson",
    contactInfo: "mike.johnson@example.com",
    imageUrl: "/placeholder.svg",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60), // 2.5 days ago
    category: ItemCategory.Watch,
    claimed: false,
  },
];

interface LostFoundContextType {
  items: FoundItem[];
  addItem: (item: Omit<FoundItem, "id" | "createdAt" | "claimed">) => void;
  claimItem: (id: string, claimantName: string) => void;
  deleteItem: (id: string) => void;
  refreshItems: () => void;
}

const LostFoundContext = createContext<LostFoundContextType | undefined>(undefined);

export const useLostFound = () => {
  const context = useContext(LostFoundContext);
  if (!context) {
    throw new Error("useLostFound must be used within a LostFoundProvider");
  }
  return context;
};

export const LostFoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FoundItem[]>([]);

  // Load items on component mount and set up polling for real-time sync
  useEffect(() => {
    loadItems();
    
    // Set up polling for real-time updates (every 30 seconds)
    const pollingInterval = setInterval(() => {
      loadItems();
    }, 30000);
    
    return () => clearInterval(pollingInterval);
  }, []);
  
  const loadItems = () => {
    try {
      const savedItems = localStorage.getItem("foundItems");
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          claimedAt: item.claimedAt ? new Date(item.claimedAt) : undefined,
        }));
        
        // Sort items by creation date (newest first)
        const sortedItems = parsedItems.sort((a: FoundItem, b: FoundItem) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setItems(sortedItems);
      } else {
        const sortedInitialItems = [...initialItems].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setItems(sortedInitialItems);
        saveItemsToLocalStorage(sortedInitialItems);
      }
    } catch (error) {
      console.error("Error loading items from localStorage:", error);
      const sortedInitialItems = [...initialItems].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(sortedInitialItems);
    }
  };

  // Auto-delete items older than 3 days
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => {
          const shouldKeep = new Date(item.createdAt) > threeDaysAgo;
          if (!shouldKeep && !item.claimed) {
            toast("Item expired", {
              description: `"${item.name}" has been automatically removed after 3 days.`
            });
          }
          return shouldKeep;
        });
        
        saveItemsToLocalStorage(updatedItems);
        return updatedItems;
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const saveItemsToLocalStorage = (itemsToSave: FoundItem[]) => {
    try {
      localStorage.setItem("foundItems", JSON.stringify(itemsToSave));
    } catch (error) {
      console.error("Error saving items to localStorage:", error);
    }
  };

  const addItem = (item: Omit<FoundItem, "id" | "createdAt" | "claimed">) => {
    const newItem: FoundItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      claimed: false,
    };
    
    // Add new item at the beginning of the array (newest first)
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    saveItemsToLocalStorage(updatedItems);
    
    toast("Item added", {
      description: `"${item.name}" has been added to the lost and found list.`
    });
  };

  const claimItem = (id: string, claimantName: string) => {
    const updatedItems = items.map(item => 
      item.id === id 
        ? { 
            ...item, 
            claimed: true, 
            claimedBy: claimantName,
            claimedAt: new Date() 
          } 
        : item
    );
    
    setItems(updatedItems);
    saveItemsToLocalStorage(updatedItems);
    
    const claimedItem = updatedItems.find(item => item.id === id);
    if (claimedItem) {
      toast("Item claimed", {
        description: `"${claimedItem.name}" has been claimed by ${claimantName}.`
      });
    }
  };

  const deleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    const updatedItems = items.filter(item => item.id !== id);
    
    setItems(updatedItems);
    saveItemsToLocalStorage(updatedItems);
    
    if (itemToDelete) {
      toast("Item deleted", {
        description: `"${itemToDelete.name}" has been removed from the list.`
      });
    }
  };

  const refreshItems = () => {
    loadItems();
  };

  return (
    <LostFoundContext.Provider value={{ items, addItem, claimItem, deleteItem, refreshItems }}>
      {children}
    </LostFoundContext.Provider>
  );
};

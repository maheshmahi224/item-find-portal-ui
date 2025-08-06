
import React, { createContext, useContext, useState, useEffect } from "react";
import { FoundItem, ItemCategory } from "../types";
import { toast } from "../components/ui/sonner";
import { apiService } from "../services/api";

// No predefined items - start with empty array
const initialItems: FoundItem[] = [];

interface LostFoundContextType {
  items: FoundItem[];
  addItem: (item: Omit<FoundItem, "id" | "createdAt" | "claimed">) => void;
  claimItem: (id: string, claimantName: string) => void;
  deleteItem: (id: string) => void;
  refreshItems: () => void;
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items on component mount and set up polling for real-time sync
  useEffect(() => {
    loadItems();
    
    // Set up polling for real-time updates (every 30 seconds)
    const pollingInterval = setInterval(() => {
      loadItems();
    }, 30000);
    
    return () => clearInterval(pollingInterval);
  }, []);
  
  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getItems({}, { limit: 100 });
      const sortedItems = response.items.sort((a: FoundItem, b: FoundItem) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setItems(sortedItems);
    } catch (error) {
      console.error("Error loading items from API:", error);
      
      // Check if it's a network error (server not running)
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const isConnectionError = error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('ECONNREFUSED')
      );
      
      if (isNetworkError || isConnectionError) {
        // Server is not running or network issue - show empty state instead of error
        setError(null);
        setItems([]);
      } else {
        // Real API error - show error message
        setError(error instanceof Error ? error.message : 'Failed to load items');
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Omit<FoundItem, "id" | "createdAt" | "claimed">) => {
    try {
      const newItem = await apiService.createItem(item);
      
      // Add new item at the beginning of the array (newest first)
      setItems(prevItems => [newItem, ...prevItems]);
      
      toast("Item added", {
        description: `"${item.name}" has been added to the lost and found list.`
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast("Error adding item", {
        description: error instanceof Error ? error.message : 'Failed to add item'
      });
    }
  };

  const claimItem = async (id: string, claimantName: string) => {
    try {
      const updatedItem = await apiService.claimItem(id, { claimantName });
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? updatedItem : item
        )
      );
      
      toast("Item claimed", {
        description: `"${updatedItem.name}" has been claimed by ${claimantName}.`
      });
    } catch (error) {
      console.error("Error claiming item:", error);
      toast("Error claiming item", {
        description: error instanceof Error ? error.message : 'Failed to claim item'
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const itemToDelete = items.find(item => item.id === id);
      
      await apiService.deleteItem(id);
      
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      if (itemToDelete) {
        toast("Item deleted", {
          description: `"${itemToDelete.name}" has been removed from the list.`
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast("Error deleting item", {
        description: error instanceof Error ? error.message : 'Failed to delete item'
      });
    }
  };

  const refreshItems = () => {
    loadItems();
  };

  return (
    <LostFoundContext.Provider value={{ 
      items, 
      addItem, 
      claimItem, 
      deleteItem, 
      refreshItems, 
      isLoading, 
      error 
    }}>
      {children}
    </LostFoundContext.Provider>
  );
};

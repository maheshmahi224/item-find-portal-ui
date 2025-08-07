import { FoundItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like network errors)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, it's likely a network error
        throw new Error('Network error: Unable to connect to server');
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }
      
      // Handle other network-related errors
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        throw new Error('Network error: Unable to connect to server');
      }
      
      throw error;
    }
  }

  // Get all items with filtering and pagination
  async getItems(
    filters: any = {},
    pagination: any = {}
  ): Promise<{ items: FoundItem[]; pagination: any }> {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.department) params.append('department', filters.department);
    if (filters.claimed !== undefined) params.append('claimed', filters.claimed.toString());
    if (filters.search) params.append('search', filters.search);
    
    // Add pagination parameters
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await this.request<{ items: FoundItem[]; pagination: any }>(`/items?${params.toString()}`);
    return response.data!;
  }

  // Get single item by ID
  async getItem(id: string): Promise<FoundItem> {
    const response = await this.request<FoundItem>(`/items/${id}`);
    return response.data!;
  }

  // Create a new item with image upload
  async createItem(item: Omit<FoundItem, "id" | "createdAt" | "claimed">, imageFile: File): Promise<FoundItem> {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", item.name);
    formData.append("description", item.description || "");
    formData.append("location", item.location);
    formData.append("department", item.department);
    formData.append("founderName", item.founderName);
    formData.append("contactInfo", item.contactInfo);
    formData.append("category", item.category);

    const response = await fetch(`${this.baseURL}/items`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to add item");
    }
    return data.data;
  }

  // Claim an item
  async claimItem(id: string, claimData: any): Promise<FoundItem> {
    const response = await this.request<FoundItem>(`/items/${id}/claim`, {
      method: 'PUT',
      body: JSON.stringify(claimData),
    });
    return response.data!;
  }

  // Update an item
  async updateItem(id: string, itemData: any): Promise<FoundItem> {
    const response = await this.request<FoundItem>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
    return response.data!;
  }

  // Delete an item
  async deleteItem(id: string): Promise<void> {
    await this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Get statistics
  async getStats(): Promise<any> {
    const response = await this.request('/items/stats/overview');
    return response.data!;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService(); 
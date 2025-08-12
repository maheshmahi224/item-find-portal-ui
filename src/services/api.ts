import { FoundItem } from '../types';

// Read env from Vite (VITE_*) or CRA-style (REACT_APP_*). CRA fallback helps when the
// build environment still provides REACT_APP_BACKEND_URL.
const viteEnv = (import.meta as any)?.env || {};
const nodeEnv = (globalThis as any)?.process?.env || {};

let API_BASE_URL =
  viteEnv.VITE_API_BASE_URL ||
  nodeEnv.REACT_APP_BACKEND_URL ||
  'http://localhost:5000/api';

// Runtime safety net: if bundle fell back to localhost but we're deployed,
// override to the known Render URL. This avoids "Failed to fetch" when envs are missing/cached.
try {
  const isBrowser = typeof window !== 'undefined' && !!window.location;
  const isLocalhostBase = /localhost:\d+\/api$/i.test(API_BASE_URL);
  const isRunningLocalhost = isBrowser && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  if (isBrowser && isLocalhostBase && !isRunningLocalhost) {
    // Dynamically determine backend URL from current domain
    const currentOrigin = window.location.origin;
    // Try to infer backend URL - could be same domain or a known pattern
    if (currentOrigin.includes('vercel.app')) {
      // For Vercel deployments, try the Render backend
      API_BASE_URL = 'https://item-find-portal-ui-6.onrender.com/api';
    } else {
      // For other deployments, assume backend is on same origin
      API_BASE_URL = `${currentOrigin}/api`;
    }
  }
} catch {}

// Derive the public origin (without the '/api' suffix) for static assets like '/uploads/...'
// Allows frontend and backend on different domains while keeping DB-stored relative image URLs working.
const PUBLIC_API_ORIGIN =
  (viteEnv.VITE_PUBLIC_API_ORIGIN as string) ||
  nodeEnv.REACT_APP_PUBLIC_API_ORIGIN ||
  API_BASE_URL.replace(/\/?api\/?$/, '');

// One-time log to help verify in production what base URL is used.
if (typeof window !== 'undefined' && !(window as any).__API_BASE_LOGGED__) {
  try {
    (window as any).__API_BASE_LOGGED__ = true;
    // eslint-disable-next-line no-console
    console.info('[API] Using base URL:', API_BASE_URL, 'public origin:', PUBLIC_API_ORIGIN);
  } catch {}
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

    // Backend returns an envelope: { success, data: { items, pagination }, ... }
    const response = await this.request<{ success: boolean; data: { items: FoundItem[]; pagination: any } }>(
      `/items?${params.toString()}`
    );
    return response.data;
  }

  // Get single item by ID
  async getItem(id: string): Promise<FoundItem> {
    const response = await this.request<FoundItem>(`/items/${id}`);
    return response;
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
    return response;
  }

  // Update an item
  async updateItem(id: string, itemData: any): Promise<FoundItem> {
    const response = await this.request<FoundItem>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
    return response;
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
    return response;
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

// Resolve image URL utility. If the value already looks absolute (http/https), return as-is.
// If it starts with '/uploads', prefix with backend public origin so images load cross-origin.
// Also tolerates values missing the leading slash (e.g., 'uploads/..').
// Handles extension conversion from legacy .jpg/.png to .webp format.
export function resolveImageUrl(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) return '';
  let url = String(pathOrUrl);
  if (/^https?:\/\//i.test(url)) return url; // already absolute (e.g., Cloudinary)

  // Convert legacy extensions to webp since backend now saves as webp
  url = url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');

  // Normalize leading slash
  const normalized = url.startsWith('/') ? url : `/${url}`;

  if (normalized.startsWith('/uploads')) {
    return `${PUBLIC_API_ORIGIN}${normalized}`;
  }
  return normalized;
}
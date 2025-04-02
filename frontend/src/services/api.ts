import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Asset types
export interface Asset {
  id: number;
  title: string;
  type: string;
  price: string;
  status: string;
  description: string;
  location: string;
  financials: {
    revenue: string;
    profit: string;
    employees: number;
    yearFounded: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  aiAnalysis?: {
    valuation: {
      value: string;
      confidence: number;
      factors: string[];
    };
    risks: {
      level: 'low' | 'medium' | 'high';
      items: string[];
    };
    opportunities: string[];
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AssetFilters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// API functions
export const assetApi = {
  // Get all assets with optional filters
  getAssets: async (filters?: AssetFilters) => {
    const response = await api.get<PaginatedResponse<Asset>>('/api/assets', { params: filters });
    return response.data;
  },

  // Get a single asset by ID
  getAsset: async (id: number) => {
    const response = await api.get<Asset>(`/api/assets/${id}`);
    return response.data;
  },

  // Get AI analysis for an asset
  getAssetAnalysis: async (id: number) => {
    const response = await api.get(`/api/assets/${id}/analyze`);
    return response.data;
  },

  // Analyze documents for an asset
  analyzeDocuments: async (id: number, documents: Asset['documents']) => {
    const response = await api.post(`/api/assets/${id}/documents/analyze`, { documents });
    return response.data;
  },

  // Get valuation report for an asset
  getValuationReport: async (id: number) => {
    const response = await api.get(`/api/assets/${id}/report`);
    return response.data;
  },

  // Update an asset
  updateAsset: async (asset: Partial<Asset>) => {
    const response = await api.put<Asset>(`/api/assets/${asset.id}`, asset);
    return response.data;
  },

  // Delete an asset
  deleteAsset: async (id: number) => {
    const response = await api.delete(`/api/assets/${id}`);
    return response.data;
  },
};

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new ApiError(
        error.response.data.detail || 'An error occurred',
        error.response.status,
        error.response.data
      );
    }
    throw new ApiError('Network error occurred');
  }
); 
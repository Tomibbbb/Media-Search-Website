// API service for authentication and user-related operations

// Types based on Swagger definitions
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: UserProfile;
  token: string;
}

// Openverse API interfaces
export interface ImageSearchParams {
  q: string;
  page_size?: number;
  page?: number;
  license?: 'by' | 'by-sa' | 'by-nc' | 'by-nd' | 'by-nc-sa' | 'by-nc-nd' | 'pdm' | 'cc0';
  category?: 'photograph' | 'illustration' | 'digitized_artwork';
  source?: string;
  creator?: string;
  tags?: string;
}

export interface AudioSearchParams {
  q: string;
  page_size?: number;
  page?: number;
  license?: 'by' | 'by-sa' | 'by-nc' | 'by-nd' | 'by-nc-sa' | 'by-nc-nd' | 'pdm' | 'cc0';
  source?: string;
  creator?: string;
  genres?: string;
  duration?: string;
  tags?: string;
}

export interface ImageItem {
  id: string;
  title: string;
  creator?: string;
  creator_url?: string;
  url: string;
  thumbnail?: string;
  source: string;
  license: string;
  license_version?: string;
  license_url?: string;
  foreign_landing_url: string;
  detail_url: string;
  related_url?: string;
  fields_matched?: string[];
  tags?: Array<{ name: string }>;  
}

export interface AudioItem {
  id: string;
  title: string;
  creator?: string;
  creator_url?: string;
  url: string;
  thumbnail?: string;
  audio_url: string;
  source: string;
  license: string;
  license_version?: string;
  license_url?: string;
  foreign_landing_url: string;
  detail_url: string;
  related_url?: string;
  duration?: number;
  bit_rate?: number;
  sample_rate?: number;
  fields_matched?: string[];
  tags?: Array<{ name: string }>;
  genres?: string[];
}

export interface SearchResponse<T> {
  result_count: number;
  page_count: number;
  results: T[];
}

// Base API URL - should be configured based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Shared function to create authenticated request headers
const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Authentication API calls
export const authApi = {
  // Register a new user
  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  // Login user
  login: async (credentials: LoginUserDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  // Verify token is valid
  verifyToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get user profile
  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get profile');
    }

    return response.json();
  },
};

// Openverse API calls
export const openverseApi = {
  // Search for images
  searchImages: async (params: ImageSearchParams, token: string): Promise<SearchResponse<ImageItem>> => {
    // Create query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/openverse/images?${queryParams.toString()}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search images');
    }

    return response.json();
  },

  // Get image by ID
  getImage: async (id: string, token: string): Promise<ImageItem> => {
    const response = await fetch(`${API_URL}/api/openverse/images/${id}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get image');
    }

    return response.json();
  },

  // Search for audio
  searchAudio: async (params: AudioSearchParams, token: string): Promise<SearchResponse<AudioItem>> => {
    // Create query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/openverse/audio?${queryParams.toString()}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search audio');
    }

    return response.json();
  },

  // Get audio by ID
  getAudio: async (id: string, token: string): Promise<AudioItem> => {
    const response = await fetch(`${API_URL}/api/openverse/audio/${id}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get audio');
    }

    return response.json();
  },
};
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

export interface RecentSearch {
  id: string;
  type: 'image' | 'audio';
  query: string;
  filters?: Record<string, any>;
  timestamp: number;
}

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const MAX_RECENT_SEARCHES = 10;

export const recentSearchesService = {
  getRecentSearches: (): RecentSearch[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const storedSearches = localStorage.getItem('recentSearches');
      if (storedSearches) {
        return JSON.parse(storedSearches);
      }
    } catch (error) {
      // Handle error silently
    }
    
    return [];
  },
  
  addRecentSearch: (type: 'image' | 'audio', query: string, filters?: Record<string, any>): RecentSearch[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const searches = recentSearchesService.getRecentSearches();
      
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        type,
        query,
        filters,
        timestamp: Date.now()
      };
      
      const existingIndex = searches.findIndex(
        search => search.type === type && search.query === query
      );
      
      if (existingIndex !== -1) {
        searches.splice(existingIndex, 1);
      }
      
      searches.unshift(newSearch);
      
      const limitedSearches = searches.slice(0, MAX_RECENT_SEARCHES);
      
      localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
      
      return limitedSearches;
    } catch (error) {
      return [];
    }
  },
  
  deleteRecentSearch: (id: string): RecentSearch[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const searches = recentSearchesService.getRecentSearches();
      const updatedSearches = searches.filter(search => search.id !== id);
      
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      return updatedSearches;
    } catch (error) {
      return [];
    }
  },
  
  clearRecentSearches: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('recentSearches');
    } catch (error) {
      // Handle error silently
    }
  }
};

export const authApi = {
  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
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

  login: async (credentials: LoginUserDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
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

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  getProfile: async (token: string): Promise<UserProfile> => {
    const response = await fetch(`${API_URL}/users/profile`, {
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
  
  saveSearch: async (searchData: { type: 'image' | 'audio', query: string, filters?: Record<string, any> }, token: string): Promise<RecentSearch[]> => {
    const response = await fetch(`${API_URL}/users/saved-searches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(searchData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save search');
    }

    return response.json();
  },
};

export const openverseApi = {
  searchImages: async (params: ImageSearchParams, token: string): Promise<SearchResponse<ImageItem>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/openverse/images?${queryParams.toString()}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search images');
    }
    
    if (params.q) {
      const { q, license, category, source, creator, tags } = params;
      const filters: Record<string, any> = {};
      if (license) filters.license = license;
      if (category) filters.category = category;
      if (source) filters.source = source;
      if (creator) filters.creator = creator;
      if (tags) filters.tags = tags;
      
      recentSearchesService.addRecentSearch('image', q, Object.keys(filters).length > 0 ? filters : undefined);
    }

    return response.json();
  },

  getImage: async (id: string, token: string): Promise<ImageItem> => {
    const response = await fetch(`${API_URL}/openverse/images/${id}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get image');
    }

    return response.json();
  },

  searchAudio: async (params: AudioSearchParams, token: string): Promise<SearchResponse<AudioItem>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/openverse/audio?${queryParams.toString()}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search audio');
    }
    
    if (params.q) {
      const { q, license, source, creator, genres, duration, tags } = params;
      const filters: Record<string, any> = {};
      if (license) filters.license = license;
      if (source) filters.source = source;
      if (creator) filters.creator = creator;
      if (genres) filters.genres = genres;
      if (duration) filters.duration = duration;
      if (tags) filters.tags = tags;
      
      recentSearchesService.addRecentSearch('audio', q, Object.keys(filters).length > 0 ? filters : undefined);
    }

    return response.json();
  },

  getAudio: async (id: string, token: string): Promise<AudioItem> => {
    const response = await fetch(`${API_URL}/openverse/audio/${id}`, {
      headers: createAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get audio');
    }

    return response.json();
  },
};
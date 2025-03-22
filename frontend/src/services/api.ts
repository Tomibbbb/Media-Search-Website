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

// Base API URL - should be configured based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
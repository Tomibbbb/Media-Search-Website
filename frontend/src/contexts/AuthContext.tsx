'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, UserProfile, CreateUserDto, LoginUserDto } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginUserDto) => Promise<void>;
  register: (userData: CreateUserDto) => Promise<void>;
  logout: () => void;
  error: string | null;
  setAuthState: (state: { isAuthenticated: boolean; user: UserProfile; token: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state from localStorage (on client side only)
  useEffect(() => {
    const initAuth = async () => {
      // Check for token in localStorage
      const storedToken = localStorage.getItem('token');
      // Also check for 'authToken' which might be set by OAuth flow
      const oauthToken = localStorage.getItem('authToken');
      
      const tokenToUse = oauthToken || storedToken;
      
      if (tokenToUse) {
        setToken(tokenToUse);
        // If we found an OAuth token, move it to the regular token storage
        if (oauthToken) {
          localStorage.setItem('token', oauthToken);
          localStorage.removeItem('authToken');
        }
        
        try {
          // Verify token and get user profile
          const valid = await authApi.verifyToken(tokenToUse);
          if (valid) {
            const profile = await authApi.getProfile(tokenToUse);
            setUser(profile);
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          // Clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // Register new user
  const register = async (userData: CreateUserDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(userData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      router.push('/profile'); // Redirect to profile page after successful registration
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials: LoginUserDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
      router.push('/profile'); // Redirect to profile page after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  // Set authentication state from external sources (OAuth)
  const setAuthState = (state: { isAuthenticated: boolean; user: UserProfile; token: string }) => {
    setUser(state.user);
    setToken(state.token);
    localStorage.setItem('token', state.token);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
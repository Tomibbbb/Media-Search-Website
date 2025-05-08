'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { authApi } from '../../../services/api';

export default function LoginSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthState } = useAuth();
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = searchParams.get('token');
    
    if (!token) {
      setError('No authentication token received');
      setTimeout(() => router.push('/login'), 1000);
      return;
    }
    
    localStorage.setItem('token', token);
    
    setTimeout(async () => {
      try {
        const userProfile = await authApi.getProfile(token);
        
        setAuthState({
          isAuthenticated: true,
          user: userProfile,
          token: token
        });
        
        router.push('/profile');
      } catch (err) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => router.push('/login'), 2000);
      }
    }, 500);
  }, [searchParams, router, setAuthState, mounted]);
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 50%, #E91E63 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          top: '10%',
          left: '10%',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          bottom: '5%',
          right: '15%',
          filter: 'blur(30px)',
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '450px',
          width: '100%',
          px: 3,
        }}
      >
        {error ? (
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                color: '#e53935',
                fontWeight: 'bold',
                mb: 2,
                textAlign: 'center',
              }}
            >
              Authentication Error
            </Typography>
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mt: 2 }}
            >
              Redirecting back to login...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              },
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <CircularProgress 
                size={40} 
                sx={{ 
                  color: 'white',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }} 
              />
            </Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: 'white', 
                textAlign: 'center',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              Login Successful!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                textAlign: 'center',
                mb: 3,
                fontWeight: 300,
                letterSpacing: '0.3px',
              }}
            >
              Welcome back to Openverse Explorer
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 5,
                px: 3,
                py: 1.5,
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.6 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.6 },
                  },
                }}
              >
                Redirecting to your profile...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
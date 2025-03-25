'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button, 
  Avatar,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import { PersonOutline as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // This should never render due to the redirect, but it's a safeguard
  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #673AB7 30%, #9C27B0 90%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            
            <Typography variant="h4" component="h1" gutterBottom>
              {user.firstName} {user.lastName}
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Account Information
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Account ID
            </Typography>
            <Typography variant="body1">
              {user._id}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Explore Openverse Media
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => router.push('/images')}
                  sx={{ mb: 1 }}
                >
                  Search Images
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => router.push('/audio')}
                  sx={{ mb: 1 }}
                >
                  Search Audio
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => logout()}
              sx={{ mt: 2 }}
            >
              Log Out
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
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
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { 
  PersonOutline as PersonIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { RecentSearch, recentSearchesService } from '../../services/api';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, token } = useAuth();
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Load recent searches
  useEffect(() => {
    if (isAuthenticated) {
      loadRecentSearches();
    }
  }, [isAuthenticated]);
  
  const loadRecentSearches = () => {
    try {
      const searches = recentSearchesService.getRecentSearches();
      setRecentSearches(searches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent searches');
      console.error('Error loading recent searches:', err);
    }
  };
  
  // Delete a recent search
  const handleDeleteSearch = (id: string) => {
    try {
      const updatedSearches = recentSearchesService.deleteRecentSearch(id);
      setRecentSearches(updatedSearches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete search');
      console.error('Error deleting search:', err);
    }
  };
  
  // Clear all recent searches
  const handleClearAllSearches = () => {
    try {
      recentSearchesService.clearRecentSearches();
      setRecentSearches([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear searches');
      console.error('Error clearing searches:', err);
    }
  };
  
  // Execute a recent search
  const handleExecuteSearch = (search: RecentSearch) => {
    if (search.type === 'image') {
      // For image searches, navigate to the images page with query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('q', search.query);
      
      // Add any filters
      if (search.filters) {
        Object.entries(search.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      router.push(`/images?${queryParams.toString()}`);
    } else if (search.type === 'audio') {
      // For audio searches
      const queryParams = new URLSearchParams();
      queryParams.append('q', search.query);
      
      // Add any filters
      if (search.filters) {
        Object.entries(search.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      router.push(`/audio?${queryParams.toString()}`);
    }
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

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
                  startIcon={<ImageIcon />}
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
                  startIcon={<AudioIcon />}
                >
                  Search Audio
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {/* Recent Searches Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1 }} /> Recent Searches
              </Typography>
              
              {recentSearches.length > 0 && (
                <Button 
                  size="small" 
                  color="error" 
                  onClick={handleClearAllSearches}
                  startIcon={<ClearAllIcon />}
                >
                  Clear All
                </Button>
              )}
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {recentSearches.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {recentSearches.map((search) => (
                  <ListItem 
                    key={search.id}
                    button
                    onClick={() => handleExecuteSearch(search)}
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSearch(search.id);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {search.type === 'image' ? (
                            <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                          ) : (
                            <AudioIcon sx={{ mr: 1, color: 'secondary.main' }} />
                          )}
                          <Typography variant="body1">{search.query}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(search.timestamp)}
                          </Typography>
                          
                          {search.filters && Object.keys(search.filters).length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {Object.entries(search.filters).map(([key, value]) => (
                                <Chip 
                                  key={key} 
                                  size="small" 
                                  label={`${key}: ${value}`} 
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No recent searches yet. Search for images or audio to see your search history here.
              </Typography>
            )}
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
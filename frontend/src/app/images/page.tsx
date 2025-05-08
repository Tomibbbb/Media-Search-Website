'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  BookmarkAdd as BookmarkAddIcon 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { openverseApi, ImageSearchParams, ImageItem, authApi } from '../../services/api';

export default function ImagesPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<ImageSearchParams>({ q: '', page: 1, page_size: 12 });
  const [searchResults, setSearchResults] = useState<ImageItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Check URL for search parameters
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated && token) {
      const url = new URL(window.location.href);
      const queryParam = url.searchParams.get('q');
      
      if (queryParam) {
        // Extract all parameters from URL
        const params: ImageSearchParams = { q: queryParam, page: 1, page_size: 12 };
        
        // Optional params
        const license = url.searchParams.get('license');
        const category = url.searchParams.get('category');
        const source = url.searchParams.get('source');
        const creator = url.searchParams.get('creator');
        const tags = url.searchParams.get('tags');
        
        if (license) params.license = license as any;
        if (category) params.category = category as any;
        if (source) params.source = source;
        if (creator) params.creator = creator;
        if (tags) params.tags = tags;
        
        // Update state
        setSearchParams(params);
        
        // Execute search
        performSearch(params);
      }
    }
  }, [isAuthenticated, token]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({ ...prev, q: e.target.value }));
  };

  // Handle category change
  const handleCategoryChange = (e: any) => {
    setSearchParams(prev => ({ ...prev, category: e.target.value, page: 1 }));
  };

  // Handle license change
  const handleLicenseChange = (e: any) => {
    setSearchParams(prev => ({ ...prev, license: e.target.value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
    performSearch({ ...searchParams, page });
  };

  // Perform search
  const performSearch = async (params: ImageSearchParams) => {
    if (!params.q) {
      setError('Please enter a search term');
      return;
    }
    
    if (!token) {
      router.push('/login');
      return;
    }

    setError(null);
    setSearching(true);
    
    try {
      const result = await openverseApi.searchImages(params, token);
      setSearchResults(result.results);
      setTotalResults(result.result_count);
      setTotalPages(result.page_count);
      setSearchPerformed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch({ ...searchParams, page: 1 });
  };

  // Handle image click
  const handleImageClick = (id: string) => {
    router.push(`/images/${id}`);
  };
  
  // Save the current search
  const handleSaveSearch = async () => {
    if (!token || !searchParams.q) return;
    
    // Extract relevant filters
    const filters: Record<string, any> = {};
    if (searchParams.license) filters.license = searchParams.license;
    if (searchParams.category) filters.category = searchParams.category;
    
    try {
      await authApi.saveSearch({
        type: 'image',
        query: searchParams.q,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      }, token);
      
      setSaveSuccess(true);
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save search');
    }
  };
  
  // Handle closing the success snackbar
  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 4,
      background: 'linear-gradient(45deg, #E3F2FD 30%, #BBDEFB 90%)',
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Openverse Image Search
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => router.push('/profile')}
          >
            Profile
          </Button>
        </Box>

        {/* Search Form */}
        <Box 
          component="form" 
          onSubmit={handleSearch}
          sx={{ 
            mb: 4,
            p: 3,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Images"
                variant="outlined"
                value={searchParams.q}
                onChange={handleSearchChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={searchParams.category || ''}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="photograph">Photographs</MenuItem>
                  <MenuItem value="illustration">Illustrations</MenuItem>
                  <MenuItem value="digitized_artwork">Digitized Artwork</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="license-label">License</InputLabel>
                <Select
                  labelId="license-label"
                  value={searchParams.license || ''}
                  label="License"
                  onChange={handleLicenseChange}
                >
                  <MenuItem value="">All Licenses</MenuItem>
                  <MenuItem value="by">Attribution</MenuItem>
                  <MenuItem value="by-sa">Attribution-ShareAlike</MenuItem>
                  <MenuItem value="by-nc">Attribution-NonCommercial</MenuItem>
                  <MenuItem value="pdm">Public Domain Mark</MenuItem>
                  <MenuItem value="cc0">CC0</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Grid container sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit" 
                fullWidth
                disabled={!searchParams.q || searching}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Error Message */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }} align="center">
            {error}
          </Typography>
        )}

        {/* Search Results */}
        {searching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {searchPerformed && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  {totalResults === 0 
                    ? 'No results found' 
                    : `Showing ${(searchParams.page - 1) * (searchParams.page_size || 12) + 1}-${Math.min(searchParams.page * (searchParams.page_size || 12), totalResults)} of ${totalResults} results`}
                </Typography>
                
                {searchParams.q && totalResults > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSaveSearch}
                    startIcon={<BookmarkAddIcon />}
                  >
                    Save Search
                  </Button>
                )}
              </Box>
            )}

            <Grid container spacing={3}>
              {searchResults.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => handleImageClick(image.id)}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={image.thumbnail || image.url}
                        alt={image.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="subtitle1" component="div" noWrap>
                          {image.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {image.creator || 'Unknown creator'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          License: {image.license}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Stack spacing={2} sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
                <Pagination 
                  count={totalPages} 
                  page={searchParams.page} 
                  onChange={handlePageChange} 
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
        
        {/* Success snackbar */}
        <Snackbar
          open={saveSuccess}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Search saved successfully!
          </Alert>
        </Snackbar>
        
        {/* Error snackbar */}
        <Snackbar
          open={!!saveError}
          autoHideDuration={4000}
          onClose={() => setSaveError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSaveError(null)} severity="error" sx={{ width: '100%' }}>
            {saveError}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
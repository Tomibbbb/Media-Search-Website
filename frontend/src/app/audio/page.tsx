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
  Slider,
  CardActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  BookmarkAdd as BookmarkAddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { openverseApi, AudioSearchParams, AudioItem, authApi } from '../../services/api';

export default function AudioPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<AudioSearchParams>({ q: '', page: 1, page_size: 12 });
  const [searchResults, setSearchResults] = useState<AudioItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
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
        const params: AudioSearchParams = { q: queryParam, page: 1, page_size: 12 };
        
        // Optional params
        const license = url.searchParams.get('license');
        const genres = url.searchParams.get('genres');
        const source = url.searchParams.get('source');
        const creator = url.searchParams.get('creator');
        const duration = url.searchParams.get('duration');
        const tags = url.searchParams.get('tags');
        
        if (license) params.license = license as any;
        if (genres) params.genres = genres;
        if (source) params.source = source;
        if (creator) params.creator = creator;
        if (duration) params.duration = duration;
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

  // Handle license change
  const handleLicenseChange = (e: any) => {
    setSearchParams(prev => ({ ...prev, license: e.target.value, page: 1 }));
  };

  // Handle genres change
  const handleGenresChange = (e: any) => {
    setSearchParams(prev => ({ ...prev, genres: e.target.value, page: 1 }));
  };

  // Handle duration range change
  const handleDurationChange = (e: any, newValue: number | number[]) => {
    // Assuming newValue is [min, max]
    if (Array.isArray(newValue)) {
      const durationStr = `${newValue[0]}-${newValue[1]}`;
      setSearchParams(prev => ({ ...prev, duration: durationStr, page: 1 }));
    }
  };

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
    performSearch({ ...searchParams, page });
  };

  // Play or pause audio
  const toggleAudio = (audioId: string, audioUrl: string) => {
    if (playingAudio === audioId) {
      // Pause current audio
      const audioElement = document.getElementById(`audio-${audioId}`) as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
        setPlayingAudio(null);
      }
    } else {
      // Pause any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
        }
      }
      
      // Create or get audio element
      let audioElement = document.getElementById(`audio-${audioId}`) as HTMLAudioElement;
      if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = `audio-${audioId}`;
        audioElement.src = audioUrl;
        audioElement.onended = () => setPlayingAudio(null);
        document.body.appendChild(audioElement);
      }
      
      // Play the audio with error handling
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            setPlayingAudio(audioId);
          })
          .catch(error => {
            console.error("Audio playback error:", error);
            // Create an alert to show the error
            setError(`Couldn't play audio. ${error.message}`);
          });
      }
    }
  };

  // Perform search
  const performSearch = async (params: AudioSearchParams) => {
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
      const result = await openverseApi.searchAudio(params, token);
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

  // Handle audio click for details view
  const handleAudioClick = (id: string) => {
    router.push(`/audio/${id}`);
  };
  
  // Save the current search
  const handleSaveSearch = async () => {
    if (!token || !searchParams.q) return;
    
    // Extract relevant filters
    const filters: Record<string, any> = {};
    if (searchParams.license) filters.license = searchParams.license;
    if (searchParams.genres) filters.genres = searchParams.genres;
    
    try {
      await authApi.saveSearch(token, {
        type: 'audio',
        query: searchParams.q,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });
      
      setSaveSuccess(true);
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save search');
      console.error('Error saving search:', err);
    }
  };
  
  // Handle closing the success snackbar
  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  // Format duration in seconds to MM:SS format
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      background: 'linear-gradient(45deg, #EDE7F6 30%, #D1C4E9 90%)',
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
            Openverse Audio Search
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Audio"
                variant="outlined"
                value={searchParams.q}
                onChange={handleSearchChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
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
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="genres-label">Genre</InputLabel>
                <Select
                  labelId="genres-label"
                  value={searchParams.genres || ''}
                  label="Genre"
                  onChange={handleGenresChange}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  <MenuItem value="classical">Classical</MenuItem>
                  <MenuItem value="electronic">Electronic</MenuItem>
                  <MenuItem value="jazz">Jazz</MenuItem>
                  <MenuItem value="rock">Rock</MenuItem>
                  <MenuItem value="hip-hop">Hip-Hop</MenuItem>
                  <MenuItem value="folk">Folk</MenuItem>
                  <MenuItem value="ambient">Ambient</MenuItem>
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
              {searchResults.map((audio) => (
                <Grid item xs={12} sm={6} md={4} key={audio.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => handleAudioClick(audio.id)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={audio.thumbnail || '/audio-placeholder.jpg'}
                        alt={audio.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="subtitle1" component="div" noWrap>
                          {audio.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {audio.creator || 'Unknown creator'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDuration(audio.duration)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            License: {audio.license}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={playingAudio === audio.id ? <PauseIcon /> : <PlayIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAudio(audio.id, audio.audio_url);
                        }}
                        fullWidth
                      >
                        {playingAudio === audio.id ? 'Pause' : 'Play'}
                      </Button>
                    </CardActions>
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
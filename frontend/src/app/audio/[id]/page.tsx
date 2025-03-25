'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent,
  CircularProgress,
  Grid,
  Button,
  Chip,
  Link,
  Paper,
  Divider,
  IconButton,
  Slider,
  Stack
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  PermMedia as PermMediaIcon,
  Copyright as CopyrightIcon,
  MusicNote as MusicIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { openverseApi, AudioItem } from '../../../services/api';

export default function AudioDetailsPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [audio, setAudio] = useState<AudioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Audio player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch audio details on mount
  useEffect(() => {
    const fetchAudioDetails = async () => {
      if (!token || !audioId) return;
      
      try {
        const audioData = await openverseApi.getAudio(audioId, token);
        setAudio(audioData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio details');
      } finally {
        setLoading(false);
      }
    };

    if (token && audioId) {
      fetchAudioDetails();
    }
  }, [token, audioId]);

  // Set up audio player when audio data is loaded
  useEffect(() => {
    if (audio?.audio_url && audioRef.current) {
      audioRef.current.src = audio.audio_url;
      
      const onLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      const onTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      };
      
      audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
      audioRef.current.addEventListener('timeupdate', onTimeUpdate);
      audioRef.current.addEventListener('ended', onEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
          audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
          audioRef.current.removeEventListener('ended', onEnded);
        }
      };
    }
  }, [audio]);

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time change
  const handleTimeChange = (_: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === 'number') {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  // Handle volume change
  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === 'number') {
      setVolume(newValue);
      audioRef.current.volume = newValue;
      if (newValue === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Format time in seconds to MM:SS format
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Search
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!audio) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Audio not found
          </Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            Back to Search
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 4,
      background: 'linear-gradient(45deg, #EDE7F6 30%, #D1C4E9 90%)',
    }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to Search
        </Button>

        <audio ref={audioRef} style={{ display: 'none' }} />

        <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
          <Grid container>
            <Grid item xs={12}>
              <Box sx={{ 
                backgroundColor: '#3f51b5',
                backgroundImage: `linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)`,
                color: 'white',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4
                }}>
                  {/* Album art */}
                  <Box 
                    sx={{ 
                      width: { xs: '150px', sm: '200px' }, 
                      height: { xs: '150px', sm: '200px' },
                      bgcolor: 'rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      mr: { xs: 0, sm: 4 },
                      mb: { xs: 2, sm: 0 },
                      overflow: 'hidden'
                    }}
                  >
                    {audio.thumbnail ? (
                      <img 
                        src={audio.thumbnail} 
                        alt={audio.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <MusicIcon sx={{ fontSize: 80, opacity: 0.7 }} />
                    )}
                  </Box>
                  
                  {/* Audio info */}
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                      {audio.title}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {audio.creator || 'Unknown Artist'}
                    </Typography>
                    {audio.genres && audio.genres.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        {audio.genres.map((genre, index) => (
                          <Chip 
                            key={index} 
                            label={genre} 
                            size="small" 
                            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Audio player controls */}
                <Box sx={{ width: '100%', maxWidth: '900px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                      {isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
                    </IconButton>
                    <Typography sx={{ minWidth: 40 }}>
                      {formatTime(currentTime)}
                    </Typography>
                    <Slider
                      size="small"
                      value={currentTime}
                      max={duration || 100}
                      onChange={handleTimeChange}
                      sx={{ 
                        mx: 2, 
                        color: 'white',
                        '& .MuiSlider-track': { backgroundColor: 'white' },
                        '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.3)' },
                        '& .MuiSlider-thumb': { backgroundColor: 'white', width: 12, height: 12 }
                      }}
                    />
                    <Typography sx={{ minWidth: 40 }}>
                      {formatTime(duration)}
                    </Typography>
                    <IconButton onClick={toggleMute} sx={{ color: 'white', ml: 1 }}>
                      {isMuted ? <MuteIcon /> : <VolumeIcon />}
                    </IconButton>
                    <Slider
                      size="small"
                      value={isMuted ? 0 : volume}
                      max={1}
                      step={0.01}
                      onChange={handleVolumeChange}
                      sx={{ 
                        width: 80, 
                        color: 'white',
                        '& .MuiSlider-track': { backgroundColor: 'white' },
                        '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.3)' },
                        '& .MuiSlider-thumb': { backgroundColor: 'white', width: 12, height: 12 }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <CardContent sx={{ p: 3 }}>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <PermMediaIcon sx={{ mr: 1 }} /> Source:
                      </Typography>
                      <Typography variant="body1">
                        {audio.source}
                        {audio.foreign_landing_url && (
                          <Link href={audio.foreign_landing_url} target="_blank" sx={{ ml: 1 }}>
                            (View original)
                          </Link>
                        )}
                      </Typography>
                    </Box>
                    
                    {(audio.duration || audio.bit_rate || audio.sample_rate) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Technical Information:
                        </Typography>
                        {audio.duration && (
                          <Typography variant="body2">
                            Duration: {formatTime(audio.duration)}
                          </Typography>
                        )}
                        {audio.bit_rate && (
                          <Typography variant="body2">
                            Bit Rate: {audio.bit_rate} kbps
                          </Typography>
                        )}
                        {audio.sample_rate && (
                          <Typography variant="body2">
                            Sample Rate: {audio.sample_rate} Hz
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <CopyrightIcon sx={{ mr: 1 }} /> License:
                      </Typography>
                      <Typography variant="body1">
                        {audio.license}
                        {audio.license_version && ` (${audio.license_version})`}
                        {audio.license_url && (
                          <Link href={audio.license_url} target="_blank" sx={{ ml: 1 }}>
                            (View details)
                          </Link>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {audio.tags && audio.tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {audio.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag.name} 
                          variant="outlined" 
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mt: 4 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    href={audio.audio_url} 
                    target="_blank"
                    fullWidth
                  >
                    Download Audio
                  </Button>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
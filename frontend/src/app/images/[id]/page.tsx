'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardMedia, 
  CardContent,
  CircularProgress,
  Grid,
  Button,
  Chip,
  Link,
  Paper,
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  PermMedia as PermMediaIcon,
  Copyright as CopyrightIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { openverseApi, ImageItem } from '../../../services/api';

export default function ImageDetailsPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [image, setImage] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const imageId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch image details on mount
  useEffect(() => {
    const fetchImageDetails = async () => {
      if (!token || !imageId) return;
      
      try {
        const imageData = await openverseApi.getImage(imageId, token);
        setImage(imageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load image details');
      } finally {
        setLoading(false);
      }
    };

    if (token && imageId) {
      fetchImageDetails();
    }
  }, [token, imageId]);

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

  if (!image) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Image not found
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
      background: 'linear-gradient(45deg, #E3F2FD 30%, #BBDEFB 90%)',
    }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            variant="contained"
          >
            Back to Search
          </Button>
          <Box>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => router.push('/')}
              sx={{ mr: 2 }}
            >
              Home
            </Button>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => router.push('/profile')}
            >
              Profile
            </Button>
          </Box>
        </Box>

        <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
          <Grid container>
            <Grid item xs={12}>
              <Box sx={{ 
                position: 'relative', 
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
              }}>
                <CardMedia
                  component="img"
                  image={image.url}
                  alt={image.title}
                  sx={{ 
                    maxHeight: '500px',
                    objectFit: 'contain',
                    width: 'auto',
                    maxWidth: '100%'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {image.title}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Creator: 
                  </Typography>
                  <Typography variant="body1">
                    {image.creator || 'Unknown'}
                    {image.creator_url && (
                      <Link href={image.creator_url} target="_blank" sx={{ ml: 1 }}>
                        (View profile)
                      </Link>
                    )}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <PermMediaIcon sx={{ mr: 1 }} /> Source:
                      </Typography>
                      <Typography variant="body1">
                        {image.source}
                        {image.foreign_landing_url && (
                          <Link href={image.foreign_landing_url} target="_blank" sx={{ ml: 1 }}>
                            (View original)
                          </Link>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <CopyrightIcon sx={{ mr: 1 }} /> License:
                      </Typography>
                      <Typography variant="body1">
                        {image.license}
                        {image.license_version && ` (${image.license_version})`}
                        {image.license_url && (
                          <Link href={image.license_url} target="_blank" sx={{ ml: 1 }}>
                            (View details)
                          </Link>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {image.tags && image.tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {image.tags.map((tag, index) => (
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
                    href={image.url} 
                    target="_blank"
                    fullWidth
                  >
                    Download Image
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
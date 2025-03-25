'use client';

import { Box, Container, Typography, Paper, Button, Stack } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome!
          </Typography>

          {isAuthenticated && user ? (
            <>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Hello, {user.firstName}!
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button 
                  component={Link}
                  href="/profile" 
                  variant="contained" 
                  size="large"
                  fullWidth
                >
                  View Profile
                </Button>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Button 
                    component={Link}
                    href="/images" 
                    variant="outlined" 
                    size="large"
                    fullWidth
                  >
                    Search Images
                  </Button>
                  <Button 
                    component={Link}
                    href="/audio" 
                    variant="outlined" 
                    size="large"
                    fullWidth
                  >
                    Search Audio
                  </Button>
                </Stack>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Please login or register to continue
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                <Button 
                  component={Link}
                  href="/login" 
                  variant="contained" 
                  size="large"
                  sx={{ px: 4 }}
                >
                  Login
                </Button>
                <Button 
                  component={Link}
                  href="/register" 
                  variant="outlined" 
                  size="large"
                  sx={{ px: 4 }}
                >
                  Register
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

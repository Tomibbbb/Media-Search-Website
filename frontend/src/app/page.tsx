'use client';

import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Material UI Hello World
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Hello World!
        </Typography>
        <Typography variant="body1" paragraph>
          This is a simple Material UI application created with Next.js.
        </Typography>
        <Button variant="contained" color="primary">
          Click Me
        </Button>
      </Container>
    </Box>
  );
}

# Openverse Media Explorer Frontend

A modern Next.js application for exploring and searching openly licensed media from Openverse. This frontend interfaces with the NestJS backend API.

## Features

- User authentication (register/login)
- User profile management
- Search for openly licensed images and audio
- View detailed media information
- Save favorite searches
- Responsive design using Material UI
- App Router-based routing with Next.js 15

## Architecture

This application follows modern React best practices with a clean, maintainable architecture:

- **Next.js App Router**: Organized page structure with route groups
- **Context API**: For state management (authentication)
- **Service Layer**: API interactions abstracted in service modules
- **Component-Based Design**: Reusable UI components
- **TypeScript**: Type-safe codebase

## Project Setup

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with required variables
```

### Environment Variables

Create a `.env.local` file with these variables:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Running the Application

```bash
# Development mode with hot-reload (uses Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Docker Setup

The frontend can be containerized using the root Dockerfile:

```bash
# Build the frontend Docker image
docker build -t openverse-frontend .

# Run the container
docker run -p 3000:3000 openverse-frontend
```

## Pages and Routes

The application includes the following pages:

- `/` - Home page with featured media
- `/login` - User login
- `/register` - User registration
- `/profile` - User profile and saved searches
- `/images` - Search and browse images
- `/images/[id]` - View detailed image information
- `/audio` - Search and browse audio
- `/audio/[id]` - View detailed audio information

## Testing

To implement tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Technology Stack

- **Framework**: Next.js 15
- **UI Library**: Material UI 6
- **State Management**: React Context API
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Fetch API
- **Authentication**: JWT

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── app/          # App Router pages
│   │   ├── audio/    # Audio routes
│   │   ├── images/   # Image routes
│   │   ├── login/    # Login page
│   │   ├── profile/  # User profile
│   │   └── register/ # Registration page
│   ├── contexts/     # React contexts
│   ├── services/     # API services
│   └── theme.ts      # UI theme configuration
├── next.config.ts    # Next.js configuration
└── tsconfig.json     # TypeScript configuration
```

## Best Practices

This project follows these best practices:

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: ARIA attributes and keyboard navigation
- **Type Safety**: Full TypeScript implementation
- **Code Organization**: Logical folder structure
- **Error Handling**: Graceful error states
- **Loading States**: Feedback during async operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests to make sure everything works (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is MIT licensed
# Openverse Media Explorer

A full-stack web application for exploring openly licensed media from Openverse. Built with Next.js for the frontend and NestJS for the backend, containerized with Docker.

## Project Overview

This application allows users to:
- Register and login to personal accounts
- Search for openly licensed images and audio from Openverse
- View detailed information about media
- Save favorite searches for later reference

## Architecture

This project follows modern software engineering best practices:

### Modular and Scalable Architecture
- **Frontend**: Component-based architecture with Next.js
- **Backend**: Modular design with NestJS
- **Data**: MongoDB for flexible document storage

### Containerization with Docker
- Docker Compose for orchestrating multi-container setup
- Dockerfile for each service
- Volume management for data persistence

### Automated Testing Strategy
- Jest for unit and integration testing
- End-to-end testing configuration
- Coverage reporting


## Project Structure

```
/
├── UML_diagrams/       # UML diagrams for architecture
├── backend/            # NestJS API server
│   ├── src/            # Source code
│   ├── test/           # Test files
│   ├── Dockerfile      # Backend container configuration
│   └── docker-compose.yml # Container orchestration
├── frontend/           # Next.js web application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── Dockerfile      # Frontend container configuration
└── Dockerfile          # Root Dockerfile for combined deployment
```

## Technical Stack

### Frontend
- **Framework**: Next.js 15
- **UI Library**: Material UI 6
- **State Management**: React Context API
- **Styling**: Tailwind CSS 4

### Backend
- **Framework**: NestJS 11
- **Database**: MongoDB
- **Authentication**: JWT
- **API Documentation**: Swagger
- **Testing**: Jest

### DevOps
- **Containerization**: Docker
- **Version Control**: Git
- **Design**: UML diagrams

## Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- MongoDB (or use the containerized version)

### Setting Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp src/openverse/example.env .env
# Edit .env with your credentials

# Start the development server
npm run start:dev

# Or use Docker
docker-compose up
```

### Setting Up the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local

# Start the development server
npm run dev
```

### Running with Docker (Full Stack)

```bash
# Build and start the entire application
docker-compose up

# Access the application at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3000/api
# - API Documentation: http://localhost:3000/api/docs
```

## Testing

### Backend Tests

```bash
cd backend

# Run the test script
./test-script.sh

# Or run specific test types
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Test coverage
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test
```

## Documentation

- **Backend API**: Available at `/api/docs` when the server is running
- **UML Diagrams**: See the `/UML_diagrams` directory
- **Component Documentation**: See individual README files in component directories


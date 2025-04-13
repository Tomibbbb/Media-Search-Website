# Backend API with Openverse Integration

This is a NestJS backend application that provides authentication functionality and integrates with the Openverse API for searching and retrieving openly licensed media.

## Features

- User authentication with JWT
- User profile management
- Saved searches functionality 
- Email notifications
- Openverse API integration for searching images and audio
- Swagger API documentation
- Comprehensive test coverage

## Architecture

This application follows a modular, scalable architecture using established design patterns:

- **Module-based organization**: Each domain area (auth, users, openverse) has its own module
- **Service/Repository pattern**: Business logic isolated in services
- **Dependency Injection**: Used throughout for loose coupling
- **DTO pattern**: For data validation and transformation
- **Schema/Model pattern**: For database entities
- **Guard pattern**: For route protection

## Project Setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
# Copy the example.env file and update with your credentials
$ cp src/openverse/example.env .env
```

### Environment Variables

The application requires the following environment variables:

```
# Openverse API Credentials
OPENVERSE_CLIENT_ID=your_openverse_client_id
OPENVERSE_CLIENT_SECRET=your_openverse_client_secret

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/myapp

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Email Settings (optional for local development)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=no-reply@example.com
```

### Openverse API Credentials

To use the Openverse API integration, you need to register for API credentials:

1. Visit [Openverse API Documentation](https://api.openverse.org/v1/#tag/auth)
2. Register for an account and get your client ID and secret
3. Add these credentials to your `.env` file

## Running the Application

```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Docker Setup

The application can be easily containerized using Docker:

```bash
# Build and start containers (API + MongoDB)
$ docker-compose up

# Run in detached mode
$ docker-compose up -d

# Stop containers
$ docker-compose down
```

## Automated Testing

The application includes a comprehensive test suite:

```bash
# Run all tests
$ ./test-script.sh

# Run unit tests only
$ npm run test

# Run e2e tests
$ npm run test:e2e

# Generate test coverage report
$ npm run test:cov
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password

### Users

- `GET /users/profile` - Get user profile (protected)
- `GET /users/saved-searches` - Get user saved searches (protected)
- `POST /users/saved-searches` - Save a new search (protected)
- `DELETE /users/saved-searches/:index` - Delete a saved search by index (protected)

### Openverse API

#### Images

- `GET /openverse/images` - Search for images
  - Query parameters:
    - `q` (required): Search query
    - `license`: Filter by license type
    - `category`: Filter by image category
    - `source`: Filter by image source
    - `creator`: Filter by creator
    - `tags`: Filter by tags
    - `page_size`: Number of results per page (default: 20)
    - `page`: Page number (default: 1)

- `GET /openverse/images/:id` - Get a specific image by ID

#### Audio

- `GET /openverse/audio` - Search for audio
  - Query parameters:
    - `q` (required): Search query
    - `license`: Filter by license type
    - `source`: Filter by audio source
    - `creator`: Filter by creator
    - `genres`: Filter by genres
    - `duration`: Filter by duration
    - `tags`: Filter by tags
    - `page_size`: Number of results per page (default: 20)
    - `page`: Page number (default: 1)

- `GET /openverse/audio/:id` - Get a specific audio file by ID

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests to make sure everything works (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is [MIT licensed](LICENSE)
#!/bin/bash
set -e

echo "🧪 Starting test script for frontend..."

# Make sure the script is executable
chmod +x ./test-script.sh

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linting checks..."
npm run lint

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage

echo "✅ All tests completed successfully!"
#!/bin/bash
set -e

echo "🧪 Starting test script for backend..."

# Make sure the script is executable
chmod +x ./test-script.sh

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linting checks..."
npm run lint

# Run unit tests
echo "🧪 Running unit tests..."
npm run test

# Run test coverage
echo "📊 Generating test coverage report..."
npm run test:cov

# Run e2e tests
echo "🚀 Running end-to-end tests..."
npm run test:e2e

echo "✅ All tests completed successfully!"
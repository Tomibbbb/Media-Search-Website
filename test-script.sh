
set -e

echo " Starting test script for entire project..."

# Make sure the script is executable
chmod +x ./test-script.sh
chmod +x ./frontend/test-script.sh
chmod +x ./backend/test-script.sh

# Run backend tests
echo "Running backend tests..."
cd backend
./test-script.sh
cd ..

# Run frontend tests
echo "Running frontend tests..."
cd frontend
./test-script.sh
cd ..

echo "✅ All tests completed successfully!"
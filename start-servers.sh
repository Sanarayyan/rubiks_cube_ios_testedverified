#!/bin/bash

# Start both frontend and backend servers
echo "🚀 Starting Rubik's Cube Solver servers..."

# Set Node.js path
# export PATH="/usr/local/Cellar/node@18/18.20.8/bin:$PATH"

# Start backend (Flutter/Dart) on port 8081
echo "📡 Starting Flutter backend on port 8081..."
cd backend
dart run bin/server.dart &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend (React) on port 3000
echo "🌐 Starting React frontend on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Go back to root directory
cd ..

echo "✅ Servers started!"
echo "📡 Backend: http://localhost:8081"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

# Wait for user to stop
wait

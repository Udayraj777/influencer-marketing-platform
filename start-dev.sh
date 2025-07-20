#!/bin/bash

echo "🚀 Starting Influencer Marketing Platform Development Servers..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if netstat -tln | grep -q ":$port "; then
        echo "⚠️  Port $port is already in use"
        return 1
    fi
    return 0
}

# Check if required ports are available
check_port 5000
check_port 5173

echo "📋 Starting backend server on port 5000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "📋 Starting frontend server on port 5173..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo "✅ Development servers started successfully!"
echo ""
echo "🔗 Frontend (React): http://localhost:5173"
echo "🔗 Backend (API): http://localhost:5000"
echo "🔗 API Health Check: http://localhost:5000/health"
echo ""
echo "📖 Quick Test Steps:"
echo "1. Go to http://localhost:5173"
echo "2. Click 'Register' and create an account"
echo "3. Complete the onboarding flow"
echo "4. Access your role-specific dashboard"
echo ""
echo "🛑 To stop both servers, press Ctrl+C"

# Function to cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Wait for user to stop the script
wait
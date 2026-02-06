#!/bin/bash

# Space Shooter Game - Local Server Startup Script
# Runs the game on localhost:8000

PORT=8000

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Space Shooter on localhost:$PORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Game will be available at: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""

# Change to game directory
cd "$(dirname "$0")"

# Start Python HTTP server
python3 -m http.server $PORT --bind 127.0.0.1

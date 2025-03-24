#!/bin/bash

git pull

# Kill process using port 3000
PORT=3000
PID=$(lsof -ti:$PORT)

if [ -n "$PID" ]; then
  echo "Killing process on port $PORT (PID: $PID)..."
  kill -9 $PID
  sleep 2 # Give it a moment to release the port
else
  echo "No process found on port $PORT."
fi

# Pull latest changes
git pull

# Start the application
npm run start
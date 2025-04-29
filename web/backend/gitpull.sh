#!/bin/bash

cd ~/shuffleboard-camera/web

# Pull latest changes
git fetch
git reset --hard origin/main

pm2 restart camera || pm2 start backend/start_camera.sh --name "camera"

# Start the application
pm2 restart backend || pm2 start npm --name "backend" -- start

pm2 save
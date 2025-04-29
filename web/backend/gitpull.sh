#!/bin/bash

cd ~/shuffleboard-camera/web

# Pull latest changes
git fetch
git reset --hard origin/main

pm2 restart camera || pm2 start backend/start_camera.sh --name "camera"

pm2 restart backend || pm2 start npm --name "backend" -- start
export DISPLAY=:0
pm2 restart browser || pm2 start backend/start_browser.sh --name "browser"

pm2 save
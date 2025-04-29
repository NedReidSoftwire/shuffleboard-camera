#!/bin/bash

cd ~/shuffleboard-camera/camera
poetry install
poetry env activate
poetry run python shuffleboard/sockets.py

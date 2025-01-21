# Camera

This is a python backend service which manages the camera.

## Set up

You need poetry installed to run the service.
If you don't already have it installed, instructions can be found [here](https://python-poetry.org/docs/#:~:text=Poetry%20is%20a%20tool%20for,build%20your%20project%20for%20distribution).

1. Start the web server first, see [the README here](../web/README.md).
1. Open a terminal at the root of the camera service.
1. Run `poetry install`.
1. Run `poetry run python shuffleboard/sockets.py`. (The first time you should get a pop up asking for camera permissions - click yes - this requires using a camera)


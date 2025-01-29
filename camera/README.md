# Camera

This is a python backend service which manages the camera.

## Set up

Poetry is required to run this service.

If you don't already have it installed, instructions can be found [here](https://python-poetry.org/docs/#:~:text=Poetry%20is%20a%20tool%20for,build%20your%20project%20for%20distribution).

1. Start the web server first, see [the web README here](../web/README.md).
2. Open a terminal at the root of the camera service.
3. Run `poetry install`.
4. Run `poetry run python -m shuffleboard.sockets`.
    - When running for the first time, a popup will appear requesting camera permissions - accept this to enable camera access

## Running tests

1. Open a terminal at the root of the camera service.
2. Run `poetry run python -m unittest discover test -b`.

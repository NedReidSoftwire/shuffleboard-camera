# Web

The web module contains two services:
- The frontend which contains a React App ui
- The backend which connects to the [camera](../camera/) and provides the frontend with data for the display.

Both services run together using [ViteExpress](https://github.com/szymmis/vite-express).

## Set up

You need node (and npm) installed.
If you don't have node installed it is recommended you use a version manager such as nvm.

1. Open a terminal in the `web` folder
1. Run `npm install`
1. Run `npm run start`
1. Navigate to localhost:3000 to see it running locally

You will then need to start the `camera` service, see [here](../camera/README.md).


import express, { Express } from "express";
import dotenv from "dotenv";
import ViteExpress from "vite-express";
import { createSocket } from "./websocket/websocket";

dotenv.config();
ViteExpress.config({});

const app: Express = express();
const port = 3000;

const server = ViteExpress.listen(app, port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

createSocket(server);

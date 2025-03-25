import express, { Express } from "express";
import dotenv from "dotenv";
import ViteExpress from "vite-express";
import { createSocket } from "./websocket/websocket";
import { setGameMode } from "./controllers/game-mode";
import { GAME_MODE } from "../types/game-modes";
import { GameModeService } from "./services/game-mode-service";

dotenv.config();
ViteExpress.config({});

const app: Express = express();

const port = 3000;

app.use(express.json());

const server = ViteExpress.listen(app, port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const gameModeService = new GameModeService(GAME_MODE.SHORT_CIRCUIT);

app.put("/game-mode", setGameMode(gameModeService));

createSocket(server, gameModeService);

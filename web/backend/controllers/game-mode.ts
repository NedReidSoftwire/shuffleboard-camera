import { Request, Response } from "express";
import { GameModeService } from "../services/game-mode-service";

export const setGameMode =
  (gameModeService: GameModeService) => (req: Request, res: Response) => {
    console.info("Setting game mode to", req.body.gameMode);
    gameModeService.setGameMode(req.body.gameMode);
    res.status(200).send("Game mode set");
  };

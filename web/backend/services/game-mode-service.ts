import { GAME_MODE } from "../../types/game-modes";

export class GameModeService {
  private gameMode: GAME_MODE;

  constructor(initialGameMode: GAME_MODE) {
    this.gameMode = initialGameMode;
  }

  public setGameMode(newGameMode: GAME_MODE) {
    this.gameMode = newGameMode;
  }

  public getGameMode() {
    return this.gameMode;
  }
}

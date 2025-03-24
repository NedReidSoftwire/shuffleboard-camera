import { GAME_MODE } from "../../../types/game-modes";

export const updateGameMode = async (newGameMode: GAME_MODE, setGameMode: (gm: GAME_MODE) => void) => {
  setGameMode(newGameMode)
  await fetch("/game-mode", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newGameMode }),
  });
};

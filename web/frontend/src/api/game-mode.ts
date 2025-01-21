import { GAME_MODE } from "../../../types/game-modes";

export const setGameMode = async (gameMode: GAME_MODE) => {
  await fetch("/game-mode", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameMode }),
  });
};

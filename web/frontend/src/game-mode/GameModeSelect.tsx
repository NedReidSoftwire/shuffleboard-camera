import { GAME_MODE } from "../../../types/game-modes";
import { setGameMode } from "../api/game-mode";

const GameModeSelect = () => {
  return (
    <div>
      <button
        className="w-full bg-green-600 text-white hover:bg-green-800 text-2xl p-4 text-center"
        onClick={async () => {
          await setGameMode(GAME_MODE.SHORT_CIRCUIT);
        }}
      >
        SHORT CIRCUIT
      </button>
      <button
        className="w-full bg-blue-600 text-white hover:bg-blue-800 text-2xl p-4 text-center"
        onClick={async () => {
          await setGameMode(GAME_MODE.ZONE_OF_CONTROL);
        }}
      >
        ZONE OF CONTROL
      </button>
    </div>
  );
};

export default GameModeSelect;

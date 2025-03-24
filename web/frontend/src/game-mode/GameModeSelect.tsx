import { GAME_MODE } from "../../../types/game-modes";
import {updateGameMode} from "../api/game-mode";

const GameModeSelect = ({gameMode, setGameMode}: {gameMode: string, setGameMode: (gm: GAME_MODE) => void}) => {
  return (
    <div className="flex flex-1 h-full">
      <button
          className={`w-1/6 flex-1 text-white text-l px-4 h-full text-center ${
              gameMode === GAME_MODE.SHORT_CIRCUIT
                  ? "bg-green-800 font-bold" // Active state
                  : "bg-green-600 hover:bg-green-800"
          }`}
        onClick={async () => {
          await updateGameMode(GAME_MODE.SHORT_CIRCUIT, setGameMode);
        }}
      >SHORT CIRCUIT
      </button>
      <button
        className={`w-1/6 flex-1 text-white text-l px-4 h-full text-center ${
          gameMode === GAME_MODE.ZONE_OF_CONTROL
              ? "bg-blue-800 font-bold" // Active state
              : "bg-blue-600 hover:bg-blue-800"
        }`}
        onClick={async () => {
          await updateGameMode(GAME_MODE.ZONE_OF_CONTROL, setGameMode);
        }}
      >
        ZONE OF CONTROL
      </button>
    </div>
  );
};

export default GameModeSelect;

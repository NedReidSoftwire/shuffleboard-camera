import BoardView from "./visualisation/BoardView.tsx";
import { io } from "socket.io-client";
import { useEffect, useMemo, useState } from "react";
import {
  Disc,
  ShortCircuitGameState,
  ShortCircuitState,
  ZoneOfControlState,
} from "../../types/types.ts";
import Calibrate from "./calibration/Calibrate.tsx";
import GameModeSelect from "./game-mode/GameModeSelect.tsx";
import { GAME_MODE } from "../../types/game-modes.ts";

function App() {
  const socket = useMemo(
    () =>
      io({
        autoConnect: false,
      }),
    [],
  );

  const [testDiscs, setTestDiscs] = useState([] as Disc[]);
  const [gameMode, setGameMode] = useState(GAME_MODE.SHORT_CIRCUIT);
  const [shortCircuit, setShortCircuit] = useState<ShortCircuitState>();
  const [zoneOfControl, setZoneOfControl] = useState<ZoneOfControlState>();
  const [calibrationImage, setCalibrationImage] = useState<string>();
  const [cameraPort, setCameraPort] = useState<number>();
  const calibrating = !!calibrationImage;

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      socket.emit("frontend-connect");
      //socket.emit('send-state', testDiscs);// true
    });
    // socket.onAny((eventName, ...args) => {
    //     console.log(eventName)
    // })
    socket.on("new-state", (gameState: ShortCircuitGameState) => {
      setTestDiscs(gameState.discs);
      if (gameState.gameMode === GAME_MODE.SHORT_CIRCUIT) {
        setShortCircuit(gameState.shortCircuit);
        setZoneOfControl(undefined)
      } else {
        setZoneOfControl(gameState.zoneOfControl);
        setShortCircuit(undefined)
      }
    });

    socket.on(
      "calibration-image",
      (calibrationImageData: string, port: number) => {
        console.log("calibrationImage", calibrationImageData);
        setCalibrationImage(calibrationImageData);
        setCameraPort(port);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calibrate = () => {
    console.log("getting cal");
    socket.emit("request-calibration-image");
  };

  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between h-[10vh]">
        <GameModeSelect gameMode={gameMode} setGameMode={setGameMode} />
        <div className="w-1/3 h-full flex-1 flex items-center justify-center font-bold text-2xl p-2 text-center">
          Shuffleboard Camera
        </div>
        <button
          className="w-1/6 h-full bg-purple-600 text-white hover:bg-purple-800 text-2xl  text-center"
          onClick={calibrate}
        >
          Calibrate
        </button>
        <button
          className="w-1/6 h-full  bg-red-500 text-white hover:bg-red-700 text-xl  text-center"
          onClick={() => socket.emit("update-code")}
        >
          Refresh Code
        </button>
      </div>

      {calibrating ? (
        <Calibrate
          image={calibrationImage}
          cameraPort={cameraPort}
          socket={socket}
          onComplete={() => setCalibrationImage(undefined)}
        />
      ) : (
        <>
          <BoardView
            discs={testDiscs}
            shortCircuit={shortCircuit}
            zoneOfControl={zoneOfControl}
            gameMode={gameMode}
          />
          {shortCircuit && gameMode === GAME_MODE.SHORT_CIRCUIT && (
            <div className="w-full grid grid-cols-12 h-[15vh] bg-purple-500 border-t-8 border-amber-200">
              <div className="col-span-3 bg-blue-600 h-full p-4">
                <div className="text-lg font-semibold text-white">
                  Blue Distance:
                </div>
                <div className="text-4xl font-semibold text-white">
                  {shortCircuit.blueDistance?.distance !== undefined
                    ? Math.round(shortCircuit?.blueDistance?.distance / 10) +
                      "cm"
                    : "😢"}
                </div>
              </div>
              <div className="col-span-6 bg-purple-300 h-full text-center">
                <div className="text-lg font-semibold text-white">
                  current winner:
                </div>
                <div className="text-5xl font-semibold text-white">
                  {shortCircuit.winner ?? "No-one ⚖️"}
                </div>
              </div>
              <div className="col-span-3 bg-red-500 h-full p-4 text-right">
                <div className="text-lg font-semibold text-white">
                  Red Distance:
                </div>
                <div className="text-4xl font-semibold text-white">
                  {shortCircuit.redDistance?.distance !== undefined
                    ? Math.round(shortCircuit?.redDistance?.distance / 10) +
                      "cm"
                    : "😢"}
                </div>
              </div>
            </div>
          )}
          {zoneOfControl && gameMode === GAME_MODE.ZONE_OF_CONTROL && (
            <div className="w-full grid grid-cols-12 h-[15vh] bg-purple-500 border-t-8 border-amber-200">
              <div className="col-span-3 bg-blue-600 h-full p-4">
                <div className="text-lg font-semibold text-white">
                  Blue territory:
                </div>
                <div className="text-4xl font-semibold text-white">
                  {zoneOfControl.bluePercentage ?? 0}%
                </div>
              </div>
              <div className="col-span-6 bg-purple-300 h-full text-center">
                <div className="text-lg font-semibold text-white">
                  current winner:
                </div>
                <div className="text-5xl font-semibold text-white">
                  {(zoneOfControl.bluePercentage ?? 0) > (zoneOfControl.redPercentage?? 0) ? 'Blue': (zoneOfControl.bluePercentage ?? 0) == (zoneOfControl.redPercentage?? 0) ? "Tie" : 'Red'}
                </div>
              </div>
              <div className="col-span-3 bg-red-500 h-full p-4 text-right">
                <div className="text-lg font-semibold text-white">
                  Red Territory:
                </div>
                <div className="text-4xl font-semibold text-white">
                  {zoneOfControl.redPercentage ?? 0}%
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

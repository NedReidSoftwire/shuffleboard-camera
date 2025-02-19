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

function App() {
  const socket = useMemo(
    () =>
      io({
        autoConnect: false,
      }),
    []
  );

  const [testDiscs, setTestDiscs] = useState([] as Disc[]);
  const [shortCircuit, setShortCircuit] = useState<ShortCircuitState>();
  const [zoneOfControl, setZoneOfControl] = useState<ZoneOfControlState>();
  const [calibrationImage, setCalibrationImage] = useState<string>();
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
      // setShortCircuit(gameState.shortCircuit);
      setZoneOfControl(gameState.zoneOfControl)
    });

    socket.on("calibration-image", (calibrationImageData: string) => {
      console.log("calibrationImage", calibrationImageData);
      setCalibrationImage(calibrationImageData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calibrate = () => {
    console.log("getting cal");
    socket.emit("request-calibration-image");
  };

  return (
    <div className="w-full">
      <div className="font-bold text-4xl p-4 text-center">
        Shuffleboard Camera
      </div>
      {calibrating ? (
        <Calibrate
          image={calibrationImage}
          socket={socket}
          onComplete={() => setCalibrationImage(undefined)}
        />
      ) : (
        <>
          <GameModeSelect />
          <BoardView discs={testDiscs} shortCircuit={shortCircuit} zoneOfControl={zoneOfControl} />
          {shortCircuit && (
            <div className="w-full grid grid-cols-12 h-32 bg-purple-500 border-t-8 border-amber-200">
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
          <button
            className="w-full bg-purple-600 text-white hover:bg-purple-800 text-2xl p-4 text-center"
            onClick={calibrate}
          >
            Calibrate
          </button>
        </>
      )}
    </div>
  );
}

export default App;

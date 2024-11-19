import BoardView from "./visualisation/BoardView.tsx";
import { io } from "socket.io-client";
import {useEffect, useState} from "react";
import {Disc, ShortCircuitGameState, ShortCircuitState, TeamColour} from "../../types/types.ts";

function App() {
  const socket = io({
    autoConnect: false,
  });

  const [testDiscs, setTestDiscs] = useState([] as Disc[])
  const [shortCircuit, setShortCircuit] = useState<ShortCircuitState>()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
      socket.connect()
      socket.on("connect", () => {
          socket.emit('frontend-connect');
          //socket.emit('send-state', testDiscs);// true
      });
      socket.on("short-circuit", (gameState: ShortCircuitGameState) => {
          setTestDiscs(gameState.discs)
          setShortCircuit(gameState.shortCircuit)
      })
  }, []);


  return (
    <div className="w-full">
      <div className="font-bold text-4xl p-4 text-center">
        Shuffleboard Camera
      </div>
      <BoardView discs={testDiscs} shortCircuit={shortCircuit} />
        {shortCircuit && (
            <div className="w-full grid grid-cols-12 h-32 bg-purple-500 border-t-8 border-amber-200">
                <div className="col-span-3 bg-blue-600 h-full p-4">
                    <div className="text-lg font-semibold text-white">Blue Distance:</div>
                    <div
                        className="text-4xl font-semibold text-white">{shortCircuit.blueDistance?.distance? Math.round(shortCircuit?.blueDistance?.distance / 10) + "cm" : "😢"}</div>
                </div>
                <div className="col-span-6 bg-purple-300 h-full text-center">
                    <div className="text-lg font-semibold text-white">current winner:</div>
                    <div className="text-5xl font-semibold text-white">{shortCircuit.winner ?? "No-one ⚖️"}</div>

                </div>
                <div className="col-span-3 bg-red-500 h-full p-4 text-right">
                <div className="text-lg font-semibold text-white">Red Distance:</div>
                    <div
                        className="text-4xl font-semibold text-white">{shortCircuit.redDistance?.distance? Math.round(shortCircuit?.redDistance?.distance / 10) + "cm" : "😢"}</div>

                </div>
            </div>
        )}
    </div>
  );
}

export default App;
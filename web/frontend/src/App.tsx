import BoardView from "./visualisation/BoardView.tsx";
import { io } from "socket.io-client";
import {useEffect, useState} from "react";
import {Disc, ShortCircuitGameState, TeamColour} from "../../types/types.ts";

function App() {
  const socket = io({
    autoConnect: false,
  });

  const [testDiscs, setTestDiscs] = useState([] as Disc[])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
      socket.connect()
      socket.on("connect", () => {
          socket.emit('frontend-connect');
          //socket.emit('send-state', testDiscs);// true
      });
      socket.on("short-circuit", (gameState: ShortCircuitGameState) => {
          setTestDiscs(gameState.discs)
      })
  }, []);


  return (
    <div className="w-full">
      <div className="font-bold text-4xl p-4 text-center">
        Shuffleboard Camera
      </div>
      <BoardView discs={testDiscs} />
        <div className="w-full grid grid-cols-12 h-32 bg-purple-500 border-t-8 border-amber-200">
            <div className="col-span-3 bg-blue-600 h-full p-4">
                <div className="text-lg font-semibold text-white">Blue Distance:</div>
                <div className="text-4xl font-semibold text-white">{}</div>
            </div>
            <div className="col-span-6 bg-purple-300 h-full"></div>
            <div className="col-span-3 bg-red-500 h-full"></div>
        </div>
    </div>
  );
}

export default App;
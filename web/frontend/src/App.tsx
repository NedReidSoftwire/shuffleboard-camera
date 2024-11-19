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
    </div>
  );
}

export default App;

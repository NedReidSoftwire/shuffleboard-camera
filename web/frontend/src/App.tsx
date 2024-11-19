import BoardView from "./visualisation/BoardView.tsx";
import { io } from "socket.io-client";
import { useEffect } from "react";
import {Disc, ShortCircuitGameState, TeamColour} from "../../types/types.ts";

function App() {
  const socket = io({
    autoConnect: false,
  });

  const testDiscs: Disc[] = [
      {x: 28, y: 600, colour: TeamColour.BLUE},
      {x: 28 + 56, y: 600, colour: TeamColour.BLUE},
      {x: 400, y: 1200, colour: TeamColour.BLUE},
      {x: 0, y: 0, colour: TeamColour.RED},
  ]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
      socket.connect()
      socket.on("connect", () => {
          socket.emit('frontend-connect');
          socket.emit('send-state', testDiscs);// true
      });
      socket.on("short-circuit", (gameState: ShortCircuitGameState) => {
          console.log(gameState)
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

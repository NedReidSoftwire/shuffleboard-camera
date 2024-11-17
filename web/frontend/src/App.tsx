import BoardView from "./visualisation/BoardView.tsx";
import { io } from "socket.io-client";
import { useEffect } from "react";

function App() {
  const socket = io({
    autoConnect: false,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void socket.connect(), []);

  return (
    <div className="w-full">
      <div className="font-bold text-4xl p-4 text-center">
        Shuffleboard Camera
      </div>
      <BoardView />
    </div>
  );
}

export default App;

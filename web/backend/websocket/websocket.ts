import {Server} from "socket.io";
import {Server as HttpServer} from "http";
import {Coordinate, Disc, ShortCircuitGameState} from "../../types/types";
import {DISC_DIAMETER} from "../../constants/constants"
import {calculateAverageDiscStates, updateLastXDiscStates} from "./calculateDiscPosition";
import {getShortCircuitState} from "./shortCircuit";

const discState: ShortCircuitGameState = {
  discs: [],
  shortCircuit: {
    blueDistance: undefined,
    redDistance: undefined,
    winner: undefined
  },
}

export const createSocket = (server: HttpServer) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("send-state",
        (newDiscJson: string[]) => sendState(newDiscJson, io)
    )

    socket.on("request-calibration-image",
        () => {
          console.log("getting calibration image");

          io.emit("get-calibration-image");
        }
    )

    socket.on("send-calibration-image",
        (calibrationData: string) => io.emit('calibration-image', calibrationData))
    socket.on("send-calibration-coordinates",
        (calibrationData: Coordinate[]) => io.emit('update-calibration-coordinates', calibrationData))
  });
};

export const distBetweenTwoDiscCenters = (disc1: Disc, disc2: Disc) => {
  return Math.sqrt(Math.pow(disc1.x - disc2.x, 2) + Math.pow(disc1.y - disc2.y, 2))
}

export const distBetweenTwoDiscs = (disc1: Disc, disc2: Disc) => {
  return Math.max(distBetweenTwoDiscCenters(disc1, disc2) - DISC_DIAMETER, 0)
}

function sendState(newDiscsJson: string[], io: Server) {
  try {
    const newDiscs: Disc[] = newDiscsJson.map((jsonString) => JSON.parse(jsonString))
    updateLastXDiscStates(newDiscs)
    discState.discs = calculateAverageDiscStates(discState.discs)
    discState.shortCircuit = getShortCircuitState(discState.discs)
    io.emit("short-circuit", discState)
  }
  catch (e) {
    console.log(e)
  }
}




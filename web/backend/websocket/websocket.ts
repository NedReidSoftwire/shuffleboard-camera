import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Coordinate, Disc, ShortCircuitGameState } from "../../types/types";
import { DISC_DIAMETER } from "../../constants/constants";
import {
  calculateAverageDiscStates,
  updateLastXDiscStates,
} from "./calculateDiscPosition";
import { getShortCircuitState } from "./shortCircuit";
import { GameModeService } from "../services/game-mode-service";
import { getZoneOfControl } from "./zoneOfControl";
import { GAME_MODE } from "../../types/game-modes";
import { spawn } from "child_process";

const discState: ShortCircuitGameState = {
  discs: [],
  shortCircuit: {
    blueDistance: undefined,
    redDistance: undefined,
    winner: undefined,
  },
  zoneOfControl: {
    redPercentage: undefined,
    bluePercentage: undefined,
    polygons: [],
  },
};

export const createSocket = (
  server: HttpServer,
  gameModeService: GameModeService,
) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");
    io.emit("new-state", discState);

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("send-state", (newDiscJson: string[]) =>
      sendState(newDiscJson, io, gameModeService),
    );

    socket.on("request-calibration-image", (newCameraPort?: number) => {
      console.log("getting calibration image");

      io.emit("get-calibration-image", newCameraPort);
    });

    socket.on(
      "send-calibration-image",
      (calibrationData: string, cameraPort: number) =>
        io.emit("calibration-image", calibrationData, cameraPort),
    );

    socket.on("send-calibration-coordinates", (calibrationData: Coordinate[]) =>
      io.emit("update-calibration-coordinates", calibrationData),
    );

    socket.on("update-code", async () => {
      spawn("bash", ["backend/gitpull.sh"], {
        detached: true,
        stdio: "inherit",
      });
    });
  });
};

export const distBetweenTwoDiscCenters = (disc1: Disc, disc2: Disc) => {
  return Math.sqrt(
    Math.pow(disc1.x - disc2.x, 2) + Math.pow(disc1.y - disc2.y, 2),
  );
};

export const distBetweenTwoDiscs = (disc1: Disc, disc2: Disc) => {
  return Math.max(distBetweenTwoDiscCenters(disc1, disc2) - DISC_DIAMETER, 0);
};

function sendState(
  newDiscsJson: string[],
  io: Server,
  gameModeService: GameModeService,
) {
  try {
    const newDiscs: Disc[] = newDiscsJson.map((jsonString) =>
      JSON.parse(jsonString),
    );
    updateLastXDiscStates(newDiscs);
    discState.gameMode = gameModeService.getGameMode();
    discState.discs = calculateAverageDiscStates(discState.discs);
    if (discState.gameMode == GAME_MODE.SHORT_CIRCUIT) {
      discState.shortCircuit = getShortCircuitState(discState.discs);
    } else {
      discState.zoneOfControl = getZoneOfControl(discState.discs);
    }
    io.emit("new-state", discState);
  } catch (e) {
    console.log(e);
  }
}

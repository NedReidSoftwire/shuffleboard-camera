import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Coordinate, Disc, ShortCircuitGameState, TeamColour } from "../../types/types";
import { DISC_DIAMETER } from "../../constants/constants";
import {
  calculateAverageDiscStates,
  updateLastXDiscStates,
} from "./calculateDiscPosition";
import { getShortCircuitState } from "./shortCircuit";
import { GameModeService } from "../services/game-mode-service";
import { getZoneOfControl, testDiscPositions } from "./zoneOfControl";
import { GAME_MODE } from "../../types/game-modes";

const discState: ShortCircuitGameState = {
  discs: [
    {x: 123, y: 57, colour: TeamColour.BLUE},
    {x: 200, y: 323, colour: TeamColour.BLUE},
    {x: 240, y: 1100, colour: TeamColour.BLUE},
    {x: 380, y: 90, colour: TeamColour.BLUE},
    {x: 150, y: 220, colour: TeamColour.RED},
    {x: 90, y: 600, colour: TeamColour.RED},
    {x: 313, y: 1010, colour: TeamColour.RED},
    {x: 370, y: 400, colour: TeamColour.RED},
  ],
  shortCircuit: {
    blueDistance: undefined,
    redDistance: undefined,
    winner: undefined,
  },
  zoneOfControl: {
    redPercentage: undefined,
    bluePercentage: undefined,
    polygons: []
  }
}

export const createSocket = (server: HttpServer, gameModeService: GameModeService) => {
  const io = new Server(server);
  

  discState.zoneOfControl = getZoneOfControl(discState.discs)
  console.log(discState.zoneOfControl)

  io.on("connection", (socket) => {
    console.log("a user connected");
    io.emit("new-state", discState);

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("send-state", (newDiscJson: string[]) =>
      sendState(newDiscJson, io, gameModeService),
    );

    socket.on("request-calibration-image", () => {
      console.log("getting calibration image");

      io.emit("get-calibration-image");
    });

    socket.on("send-calibration-image", (calibrationData: string) =>
      io.emit("calibration-image", calibrationData),
    );
    socket.on("send-calibration-coordinates", (calibrationData: Coordinate[]) =>
      io.emit("update-calibration-coordinates", calibrationData),
    );
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

function sendState(newDiscsJson: string[], io: Server, gameModeService: GameModeService) {
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

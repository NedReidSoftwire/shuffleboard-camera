import {Server, Socket} from "socket.io";
import {Server as HttpServer} from "http";
import {Disc, DiscWithIndex, Distance, ShortCircuitGameState, TeamColour} from "../../types/types";

const discState: ShortCircuitGameState = {
  discs: [],
  shortCircuit: {
    blueDistance: undefined,
    redDistance: undefined,
    winner: undefined
  }
}

export const createSocket = (server: HttpServer) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("frontend-connect", () => {
      console.log("FRONTEND CONNECTED")
    })

    socket.on("send-state",
        (newDiscJson: string[]) => sendState(newDiscJson, io)
    )
  });
};

function sendState(newDiscsJson: string[], io: Server) {
  console.log(newDiscsJson)
  try {
    console.log("hi")
    const newDiscs = newDiscsJson.map((jsonString) => JSON.parse(jsonString))
    updateShortCircuitGameState(newDiscs)
    console.log(discState)
    io.emit("short-circuit", discState)
  }
  catch (e) {
    console.log(e)
  }
}

const distBetweenTwoDiscs = (disc1: Disc, disc2: Disc) => {
  return Math.sqrt(Math.pow(disc1.x - disc2.x, 2) + Math.pow(disc1.y - disc2.y, 2))
}

const calculateDistance = (discs: DiscWithIndex[])  => {
  return discs.reduce((smallestDist: Distance | undefined, currentDisc) => {
    const minDistFromCurrentDisc = discs.reduce((smallestDist: Distance | undefined, discToCompare) => {
      if (currentDisc.index >= discToCompare.index) {
        return smallestDist
      }
      const compDist = distBetweenTwoDiscs(currentDisc, discToCompare)
      if (!smallestDist || compDist < smallestDist.distance) {
        return {
          distance: compDist,
          disc1: currentDisc.index,
          disc2: discToCompare.index
        }
      }
    }, undefined)

    if (minDistFromCurrentDisc && (!smallestDist || minDistFromCurrentDisc.distance < smallestDist.distance)) {
      return minDistFromCurrentDisc
    }
    return smallestDist
  }, undefined)
}

const calculateWinner = (blueDistance: Distance | undefined, redDistance: Distance | undefined) =>{
  if (!blueDistance && !redDistance) {
    return undefined
  }
  if (!blueDistance) {
    return TeamColour.RED
  }
  if (!redDistance) {
    return TeamColour.BLUE
  }
  if (blueDistance.distance === redDistance.distance) {
    return undefined
  }
  if (blueDistance.distance < redDistance.distance) {
    return TeamColour.BLUE
  }
  return TeamColour.RED
}

function updateShortCircuitGameState(newDiscs: Disc[]): ShortCircuitGameState {
  discState.discs = newDiscs
  const redDiscs = newDiscs
      .map((disc, index): DiscWithIndex => ({...disc, index}))
      .filter((disc) => disc.colour === TeamColour.RED)
  const blueDiscs = newDiscs
      .map((disc, index): DiscWithIndex => ({...disc, index}))
      .filter((disc) => disc.colour === TeamColour.BLUE)
  const blueDistance = calculateDistance(blueDiscs)
  const redDistance = calculateDistance(redDiscs)
  discState.shortCircuit = {
    blueDistance,
    redDistance,
    winner: calculateWinner(blueDistance, redDistance)
  }
  return discState
}




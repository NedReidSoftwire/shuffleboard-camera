import {Server} from "socket.io";
import {Server as HttpServer} from "http";
import {Disc, DiscWithIndex, Distance, ShortCircuitGameState, TeamColour} from "../../types/types";
import {DISC_DIAMETER} from "../../constants/constants"

const discState: ShortCircuitGameState = {
  discs: [],
  shortCircuit: {
    blueDistance: undefined,
    redDistance: undefined,
    winner: undefined
  }
}

const last5DiscStates: Disc[][] = []

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
  });
};

const distBetweenTwoDiscCenters = (disc1: Disc, disc2: Disc) => {
  return Math.sqrt(Math.pow(disc1.x - disc2.x, 2) + Math.pow(disc1.y - disc2.y, 2))
}

const distBetweenTwoDiscs = (disc1: Disc, disc2: Disc) => {
  return Math.max(distBetweenTwoDiscCenters(disc1, disc2) - DISC_DIAMETER, 0)
}

function updateLast5DiscStates(newDiscs: Disc[]) {
  last5DiscStates.push(newDiscs)
  if (last5DiscStates.length > 5) {
    last5DiscStates.shift()
  }
}

function calculateAverageDiscStates(): Disc[] {
  const mostRecentDiscPositions = last5DiscStates[last5DiscStates.length - 1]
  return mostRecentDiscPositions.map((disc) => {
    const correspondingDiscInAverage = mapDiscInPreviousDiscPositions(disc, discState.discs, 3)
    if (correspondingDiscInAverage) {
      return correspondingDiscInAverage
    }
    const correspondingDiscs = last5DiscStates
        .slice(0,last5DiscStates.length - 1)
        .map((discPositions: Disc[]) => mapDiscInPreviousDiscPositions(disc, discPositions, 20))
        .filter(d => !!d)
    const sumOfDiscs = correspondingDiscs.reduce((total: Disc, disc: Disc) => {
      return {
        x: disc.x + total.x,
        y: disc.y + total.y,
        colour: disc.colour
      }
    }, disc)
    if (!correspondingDiscs.length) {
      return disc
    }
    return {
      x: sumOfDiscs.x / (correspondingDiscs.length+1),
      y: sumOfDiscs.y / (correspondingDiscs.length+1),
      colour: disc.colour
    }
  })
}

function mapDiscInPreviousDiscPositions(disc: Disc, previousDiscState: Disc[], threshold: number): Disc | null {
  const prevDiscStatesOfSameColour = previousDiscState
      .filter((prevDisc) => prevDisc.colour === disc.colour)
  const distances = prevDiscStatesOfSameColour
      .map((prevDisc) => distBetweenTwoDiscCenters(disc, prevDisc))
  if (!distances.length) {
    return null
  }
  const minDistance = Math.min(...distances)
  if (minDistance > threshold) {
    return null
  }
  const minIndex = distances.indexOf(minDistance)
  return prevDiscStatesOfSameColour[minIndex]
}

function sendState(newDiscsJson: string[], io: Server) {
  try {
    const newDiscs: Disc[] = newDiscsJson.map((jsonString) => JSON.parse(jsonString))
    updateLast5DiscStates(newDiscs)
    discState.discs = calculateAverageDiscStates()
    updateShortCircuitGameState()
    io.emit("short-circuit", discState)
  }
  catch (e) {
    console.log(e)
  }
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
      return smallestDist
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

function updateShortCircuitGameState(): ShortCircuitGameState {
  const redDiscs = discState.discs
      .map((disc, index): DiscWithIndex => ({...disc, index}))
      .filter((disc) => disc.colour === TeamColour.RED)
  const blueDiscs = discState.discs
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



import { Disc } from "../../types/types";
import { distBetweenTwoDiscCenters } from "./websocket";

const lastXDiscStates: Disc[][] = [];

/*
    Algorithm Description:
    > For each disc in a frame, if there exists a disc in the last used "average" that is <= 3mm away just use that one
    > Average over the last 5 frames all discs that are <= 20mm away from that disc
*/

export function updateLastXDiscStates(newDiscs: Disc[], x = 5) {
  lastXDiscStates.push(newDiscs);
  if (lastXDiscStates.length > x) {
    lastXDiscStates.shift();
  }
}

export function calculateAverageDiscStates(
  previousAverageDiscState: Disc[],
): Disc[] {
  const mostRecentDiscPositions = lastXDiscStates[lastXDiscStates.length - 1];
  return mostRecentDiscPositions.map((disc) => {
    const correspondingDiscInAverage = mapDiscInPreviousDiscPositions(
      disc,
      previousAverageDiscState,
      5,
    );
    if (correspondingDiscInAverage) {
      return correspondingDiscInAverage;
    }
    const correspondingDiscs = lastXDiscStates
      .slice(0, lastXDiscStates.length - 1)
      .map((discPositions: Disc[]) =>
        mapDiscInPreviousDiscPositions(disc, discPositions, 20),
      )
      .filter((d) => !!d);
    const sumOfDiscs = correspondingDiscs.reduce((total: Disc, disc: Disc) => {
      return {
        x: disc.x + total.x,
        y: disc.y + total.y,
        colour: disc.colour,
      };
    }, disc);
    if (!correspondingDiscs.length) {
      return disc;
    }
    return {
      x: sumOfDiscs.x / (correspondingDiscs.length + 1),
      y: sumOfDiscs.y / (correspondingDiscs.length + 1),
      colour: disc.colour,
    };
  });
}

function mapDiscInPreviousDiscPositions(
  disc: Disc,
  previousDiscState: Disc[],
  threshold: number,
): Disc | null {
  const prevDiscStatesOfSameColour = previousDiscState.filter(
    (prevDisc) => prevDisc.colour === disc.colour,
  );
  const distances = prevDiscStatesOfSameColour.map((prevDisc) =>
    distBetweenTwoDiscCenters(disc, prevDisc),
  );
  if (!distances.length) {
    return null;
  }
  const minDistance = Math.min(...distances);
  if (minDistance > threshold) {
    return null;
  }
  const minIndex = distances.indexOf(minDistance);
  return prevDiscStatesOfSameColour[minIndex];
}

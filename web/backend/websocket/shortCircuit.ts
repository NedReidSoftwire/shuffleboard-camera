import {Disc, DiscWithIndex, Distance,  ShortCircuitState, TeamColour} from "../../types/types";
import {distBetweenTwoDiscs} from "./websocket";

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

export function getShortCircuitState(discPositions: Disc[]): ShortCircuitState {
    const redDiscs = discPositions
        .map((disc, index): DiscWithIndex => ({...disc, index}))
        .filter((disc) => disc.colour === TeamColour.RED)
    const blueDiscs = discPositions
        .map((disc, index): DiscWithIndex => ({...disc, index}))
        .filter((disc) => disc.colour === TeamColour.BLUE)
    const blueDistance = calculateDistance(blueDiscs)
    const redDistance = calculateDistance(redDiscs)
    return {
        blueDistance,
        redDistance,
        winner: calculateWinner(blueDistance, redDistance)
    }
}

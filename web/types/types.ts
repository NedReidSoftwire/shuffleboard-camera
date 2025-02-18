import { GAME_MODE } from "./game-modes"

export enum TeamColour {
    BLUE = "Blue",
    RED = "Red"
}

export type Disc = {
    x: number
    y: number
    colour: TeamColour
}

export type DiscWithIndex = Disc & {index: number}

export type SendStateBody = Disc[]

export type GameState = {
    discs: Disc[]
    gameMode?: GAME_MODE
}

export type Distance = {
    distance: number
    disc1: number
    disc2: number
}

export type ShortCircuitState = {
    blueDistance?: Distance
    redDistance?: Distance
    winner?: TeamColour
}

export type ShortCircuitGameState = GameState & {
    shortCircuit: ShortCircuitState
    zoneOfControl: ZoneOfControlState
}

export type ZoneOfControlState = {
    redPercentage?: number
    bluePercentage?: number
    polygons: Polygon[]
}

export type Polygon = {
    coordinates: Coordinate[]
    colour: TeamColour | undefined
}

export type Coordinate = {
    x: number
    y: number
}


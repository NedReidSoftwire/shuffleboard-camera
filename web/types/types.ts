export enum TeamColour {
    BLUE = "blue",
    RED = "red"
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
}

export type Distance = {
    distance: number
    disc1: number
    disc2: number
}

export type ShortCircuitGameState = GameState & {
    shortCircuit: {
        blueDistance?: Distance
        redDistance?: Distance
        winner?: TeamColour
    }
}
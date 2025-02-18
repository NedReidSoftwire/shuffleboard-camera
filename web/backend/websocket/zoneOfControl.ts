import { Coordinate, Disc, DiscWithIndex, Polygon, TeamColour, ZoneOfControlState } from "../../types/types";

export const testDiscPositions: Disc[] = [
    {x: 20, y: 20, colour: TeamColour.RED},
    {x: 40, y: 40, colour: TeamColour.BLUE},
    {x: 123, y: 57, colour: TeamColour.RED},
    {x: 40, y: 45, colour: TeamColour.BLUE},
    {x: 200, y: 589, colour: TeamColour.RED},
    {x: 300, y: 1097, colour: TeamColour.RED},
    {x: 350, y: 10, colour: TeamColour.BLUE},
    {x: 60, y: 86, colour: TeamColour.BLUE},
]

export const getZoneOfControl = (discPositions: Disc[]): ZoneOfControlState => {
    const discsWithIndices = discPositions.map((disc, index): DiscWithIndex => ({...disc, index}))
    const midpointsAndPpdVectors = getDiscComparisonMidpointsAndVectors(discsWithIndices)
    const boundaryPoints = getLineSegments(midpointsAndPpdVectors, discsWithIndices)
    const polygons = getPolygons(boundaryPoints)
    return {
        polygons: polygons
    }
}

type MidpointAndPpdVector = PointAndPpdVector & IndexPair

type PointAndPpdVector = {
    x: number,
    y: number,
    vx: number,
    vy: number,
}

type IndexPair = {
    redIndex: number,
    blueIndex: number
}


export const getDiscComparisonMidpointsAndVectors = (discPositions: DiscWithIndex[]): MidpointAndPpdVector[] => {
    let midpoints: MidpointAndPpdVector[] = []
    const redDiscs = discPositions.filter((disc) => disc.colour === TeamColour.RED)
    const blueDiscs = discPositions.filter((disc) => disc.colour === TeamColour.BLUE)
    
    redDiscs.forEach((redDisc) => {
        blueDiscs.forEach((blueDisc) => {
            midpoints.push({
                x: (redDisc.x + blueDisc.x)/ 2, 
                y: (redDisc.y + blueDisc.y) / 2,
                vx: -(redDisc.y - blueDisc.y),
                vy: (redDisc.x - blueDisc.x),
                blueIndex: blueDisc.index,
                redIndex: redDisc.index,
            })
        })
    })

    return midpoints
}

const distanceBetweenPointAndDisc = (point: Coordinate, disc: Disc) => {
    return Math.sqrt(Math.pow(point.x - disc.x, 2) + Math.pow(point.y - disc.y, 2))
}


type DistanceWithDiscIndices = {
    distance: number,
    indices: number[]
}

const getClosestDiscsWithIndices = (point: Coordinate, discs: DiscWithIndex[]) => {
    return discs.reduce((bestDiscsAndDistance: DistanceWithDiscIndices, disc: DiscWithIndex) => {
        const distance = Math.round(distanceBetweenPointAndDisc(point, disc) * 1000)/1000
        if (distance < bestDiscsAndDistance.distance) {
            return {
                distance,
                indices: [disc.index]
            }
        }
        if (distance === bestDiscsAndDistance.distance) {
            bestDiscsAndDistance.indices.push(disc.index)
        }
        return bestDiscsAndDistance
    }, {distance: 100000, indices: []})
}


const width = 400
const height = 1200

type Corner = PointAndPpdVector & {wallType: string}

const cornersOfTheBoard: Corner[] = [
    {x: 0, y: 0, vx: 1, vy: 0, wallType: "Bottom"},
    {x: width, y: 0, vx: 0, vy: 1, wallType: "Right"},
    {x: width, y: height, vx: -1, vy: 0, wallType: "Top"},
    {x: 0, y: height, vx: 0, vy: -1, wallType: "Left"}
]

type BoundaryPoint = {
    x: number
    y: number
    connectsTo: string,
    scf: number
}


const getLineSegments = (midpointsAndPpdVectors: MidpointAndPpdVector[], discs: DiscWithIndex[] ) => {
    const midpointPairToCoordinateMap: Record<string, BoundaryPoint[]> = {}
    

    // Boundaries with each other
    midpointsAndPpdVectors.forEach((midpointA: MidpointAndPpdVector, indexA) => {
        midpointsAndPpdVectors.forEach((midpointB: MidpointAndPpdVector, indexB) => {
            if (indexA <= indexB) {
                return
            }


            const collisionPoint = calculateCollisionPoint(midpointA, midpointB)
            const closestDiscsToCollisionPoint = getClosestDiscsWithIndices(collisionPoint, discs)
            
            if (
                closestDiscsToCollisionPoint.indices.includes(midpointA.redIndex) && closestDiscsToCollisionPoint.indices.includes(midpointA.blueIndex) 
                && closestDiscsToCollisionPoint.indices.includes(midpointB.redIndex) && closestDiscsToCollisionPoint.indices.includes(midpointB.blueIndex)
                && !isPointOutsideBoundary(collisionPoint)
            ) {
                if (midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`]) {
                    midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`].push({x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: `${midpointB.redIndex}-${midpointB.blueIndex}`, scf: collisionPoint.lambda})
                    midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`] = midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`].sort(sortByScf)
                } 
                else {
                    midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`] = [{x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: `${midpointB.redIndex}-${midpointB.blueIndex}`, scf: collisionPoint.lambda}]
                }
                if (midpointPairToCoordinateMap[`${midpointB.redIndex}-${midpointB.blueIndex}`]) {
                    midpointPairToCoordinateMap[`${midpointB.redIndex}-${midpointB.blueIndex}`].push({x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: `${midpointA.redIndex}-${midpointA.blueIndex}`, scf: collisionPoint.mu})
                    midpointPairToCoordinateMap[`${midpointB.redIndex}-${midpointB.blueIndex}`] =  midpointPairToCoordinateMap[`${midpointB.redIndex}-${midpointB.blueIndex}`].sort(sortByScf)
                } 
                else {
                    midpointPairToCoordinateMap[`${midpointB.redIndex}-${midpointB.blueIndex}`] = [{x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: `${midpointA.redIndex}-${midpointA.blueIndex}`, scf: collisionPoint.mu}]
                }
            }
        });
    })

    // Boundaries with the corners
    midpointsAndPpdVectors.forEach((midpointA: MidpointAndPpdVector) => {
        cornersOfTheBoard.forEach((corner: Corner) =>  {
            const collisionPoint = calculateCollisionPoint(midpointA, corner)
            const closestDiscsToCollisionPoint = getClosestDiscsWithIndices(collisionPoint, discs)
            if (closestDiscsToCollisionPoint.indices.includes(midpointA.redIndex) && closestDiscsToCollisionPoint.indices.includes(midpointA.blueIndex) && !isPointOutsideBoundary(collisionPoint)) {
                
                if (midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`]) {
                    midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`].push({x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: corner.wallType, scf: collisionPoint.lambda})
                    midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`] = midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`].sort(sortByScf)
                } 
                else {
                    midpointPairToCoordinateMap[`${midpointA.redIndex}-${midpointA.blueIndex}`] = [{x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: corner.wallType, scf: collisionPoint.lambda}]
                }
                if (midpointPairToCoordinateMap[corner.wallType]) {
                    midpointPairToCoordinateMap[corner.wallType].push({x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: `${midpointA.redIndex}-${midpointA.blueIndex}`, scf: collisionPoint.mu})
                    midpointPairToCoordinateMap[corner.wallType] = midpointPairToCoordinateMap[corner.wallType].sort(sortByScf)
                } 
                else {
                    midpointPairToCoordinateMap[corner.wallType] = [{x: Math.round(collisionPoint.x), y: Math.round(collisionPoint.y), connectsTo: `${midpointA.redIndex}-${midpointA.blueIndex}`, scf: collisionPoint.mu}]
                }
            }
        })
    })

    return midpointPairToCoordinateMap
}

const isPointOutsideBoundary = (point: Coordinate) => point.x < -0.01 || point.y < -0.01 || point.y > height + 0.01 || point.x > width + 0.01

const sortByScf = (a: {scf: number}, b: {scf: number}) => a.scf - b.scf 

const calculateCollisionPoint = (pointWithVectorA: PointAndPpdVector, pointWithVectorB: PointAndPpdVector) => {
    const equation1 = [pointWithVectorA.vx, -pointWithVectorB.vx, pointWithVectorB.x - pointWithVectorA.x] //ax + by = c
    const equation2 = [pointWithVectorA.vy, -pointWithVectorB.vy, pointWithVectorB.y - pointWithVectorA.y] //cx + dy = e

    const lambda = (equation1[2] * equation2[1] - equation1[1] * equation2[2]) / (equation1[0] * equation2[1] - equation1[1] * equation2[0])
    const mu = (equation1[2] * equation2[0] - equation1[0] * equation2[2]) / (equation1[1] * equation2[0] - equation1[0] * equation2[1])

    return {x: pointWithVectorA.x + lambda * pointWithVectorA.vx, y: pointWithVectorA.y + lambda * pointWithVectorA.vy, lambda, mu}
}


const getPolygons = (segmentNameToBoundaryMap: Record<string, BoundaryPoint[]>) => {
    const polygons: Polygon[] = []

    const outerWalls = cornersOfTheBoard.map((corner) => corner.wallType)

    let lineSegmentsToCoverTwice = Object.keys(segmentNameToBoundaryMap).filter(name => !outerWalls.includes(name))
    let lineSegmentsCovered: string[] = []

    let remainingCorners = [...cornersOfTheBoard]

    while (remainingCorners.length > 0 || lineSegmentsToCoverTwice.length > 0) {
        let polygon: Coordinate[] = []
        let colour: TeamColour | undefined 

        let currentSegmentName: string;
        let currentPoint: BoundaryPoint | (Coordinate & {scf: number});

        if (remainingCorners.length > 0) {
            currentSegmentName = remainingCorners[0].wallType
            currentPoint = {...remainingCorners[0], scf: 0}
            remainingCorners = remainingCorners.filter(remCorner => remCorner.wallType !== currentSegmentName)
        } else {
            currentSegmentName = lineSegmentsToCoverTwice[0]
            currentPoint = segmentNameToBoundaryMap[currentSegmentName][0]   
            if (lineSegmentsCovered.includes(currentSegmentName)) {
                lineSegmentsToCoverTwice = lineSegmentsToCoverTwice.filter(seg => seg !== currentSegmentName)
            } else {
                lineSegmentsCovered.push(currentSegmentName)
            }
        }
        
        while ((!polygon.length || currentPoint.x !== polygon[0].x || currentPoint.y !== polygon[0].y) && polygon.length < 15) {
            polygon.push({x: currentPoint.x, y: currentPoint.y})
            
            if (outerWalls.includes(currentSegmentName)) {
                const nextPointOnWall = segmentNameToBoundaryMap[currentSegmentName]?.find((segmentBoundary) => segmentBoundary.scf > currentPoint.scf)
                if (nextPointOnWall) {
                    const index = segmentNameToBoundaryMap[nextPointOnWall.connectsTo].findIndex(seg => seg.connectsTo === currentSegmentName)
                    if (!colour) {
                        colour = index == 0 ? TeamColour.BLUE : TeamColour.RED
                    }
                    currentPoint = segmentNameToBoundaryMap[nextPointOnWall.connectsTo][index]
                    currentSegmentName = nextPointOnWall.connectsTo
                }
                else {
                    const nextCorner = cornersOfTheBoard[(outerWalls.findIndex((wall) => wall == currentSegmentName) + 1) % 4]
                    currentPoint = {...nextCorner, scf: 0}
                    currentSegmentName = nextCorner.wallType
                    remainingCorners = remainingCorners.filter(remCorner => remCorner.wallType !== currentSegmentName)
                }
            }

            else {
                if (lineSegmentsCovered.includes(currentSegmentName)) {
                    lineSegmentsToCoverTwice = lineSegmentsToCoverTwice.filter(seg => seg !== currentSegmentName)
                } else {
                    lineSegmentsCovered.push(currentSegmentName)
                }

                const segmentEnd = segmentNameToBoundaryMap[currentSegmentName].find((segmentBoundary) => segmentBoundary.scf !== currentPoint.scf)
                if (!segmentEnd) {
                    console.log("uh oh")
                    throw new Error("BAD")
                }
                const nextSegmentBeginning = segmentNameToBoundaryMap[segmentEnd.connectsTo].find((segmentBoundary) => segmentBoundary.connectsTo == currentSegmentName)
                if (!nextSegmentBeginning) {
                    console.log("uh oh 2")
                    throw new Error("Bad 2")
                }
                currentPoint = nextSegmentBeginning
                currentSegmentName = segmentEnd.connectsTo
            }
        }

        polygons.push({coordinates: polygon, colour})
    
    }
    return polygons
}


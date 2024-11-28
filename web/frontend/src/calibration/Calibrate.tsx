import {Circle, Image, Layer, Stage} from "react-konva";
import {CAMERA_HEIGHT, CAMERA_WIDTH} from "../../../constants/constants.ts";
import {useState} from "react";
import useImage from "use-image";


type CalibrateProps = {
    image: string
}
type Coordinate = [number, number]

function Calibrate({image }: CalibrateProps) {
    const calibrationSteps = ["Bottom left", "Top left", "Top right", "Bottom right"]
    const [corners, setCorners] = useState<Coordinate[]>([])
    const currentStep = corners.length
    const [currentCorner, setCurrentCorner] = useState<Coordinate>([0, 0])
    const width = window.innerWidth
    const height = (CAMERA_HEIGHT / CAMERA_WIDTH) * width

    const [reactImage] = useImage("data:image/jpeg;base64," + image)

    return (
        <div className="w-full">
            <div className="font-bold text-4xl p-4 text-center">
                Calibrate me pls!
            </div>
            <Stage
                width={width}
                height={height}
                onClick={(event) => {
                    // console.log([event.target.getStage()?.getPointerPosition()?.x ?? 0, event.target.getStage()?.getPointerPosition()?.y ?? 0])
                    setCurrentCorner([event.target.getStage()?.getPointerPosition()?.x ?? 0, event.target.getStage()?.getPointerPosition()?.y ?? 0])
                }
            }>
                <Layer>
                    <Circle x={currentCorner[0]} y={currentCorner[1]} stroke="black" radius={50}  />

                </Layer>
                <Layer >
                    <Image image={reactImage} scaleX={width / CAMERA_WIDTH} scaleY={height / CAMERA_HEIGHT}/>


                </Layer>
            </Stage>
        </div>
    );
}

export default Calibrate;
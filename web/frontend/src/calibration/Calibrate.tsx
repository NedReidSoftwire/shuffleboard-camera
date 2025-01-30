import { Circle, Image, Layer, Stage } from "react-konva";
import { CAMERA_HEIGHT, CAMERA_WIDTH } from "../../../constants/constants.ts";
import { useEffect, useRef, useState } from "react";
import useImage from "use-image";
import { Socket } from "socket.io-client";
import { Coordinate } from "../../../types/types.ts";

type CalibrateProps = {
  image: string;
  socket: Socket;
  onComplete: () => void;
};

const clamp = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(value, min));

function Calibrate({ image, socket, onComplete }: CalibrateProps) {
  const calibrationSteps = [
    "Bottom left",
    "Top left",
    "Top right",
    "Bottom right",
  ];
  const [corners, setCorners] = useState<Coordinate[]>([]);
  const currentStep = corners.length;
  const [currentCorner, setCurrentCorner] = useState<Coordinate>([0, 0]);
  const mouseDown = useRef(false);

  const width = window.innerWidth;
  const height = (CAMERA_HEIGHT / CAMERA_WIDTH) * width;

  const scaleX = CAMERA_WIDTH / width
  const scaleY = CAMERA_HEIGHT / height

  const [reactImage] = useImage("data:image/jpeg;base64," + image);
  useEffect(() => {
    console.log(currentCorner);
  }, [currentCorner]);

  /**
   * Transform coordinates from stage (display) space to camera space.
   * Since the stage is scaled to fit the window width while maintaining aspect ratio,
   * we need to scale the coordinates back to match the actual camera resolution.
   */
  const transformStageCoordinatesToCameraCoordinates = (stageCoordinates: Coordinate[]): Coordinate[] => 
    stageCoordinates.map(([x, y]) => [
      x * scaleX,
      y * scaleY
    ]);

  const submitCalibration = async (stageCoordinates: Coordinate[]) => {
    if (stageCoordinates.length !== 4) {
      throw new Error("4 corner coordinates required for calibration.");
    }

    const cameraCoordinates = transformStageCoordinatesToCameraCoordinates(stageCoordinates);

    socket.emit("send-calibration-coordinates", cameraCoordinates);

    onComplete();
  };

  const addCorner = () => {
    const newCorners = [...corners, currentCorner];
    setCurrentCorner([0, 0]);
    if (newCorners.length === 4) {
      void submitCalibration(newCorners);
    } else {
      setCorners(newCorners);
    }
  };

  return (
    <div className="w-full">
      <div className="flex">
        <div className="font-bold text-2xl p-4 text-center">
          Calibrate the {calibrationSteps[currentStep]} corner
        </div>
        <button
          className="font-bold text-2xl p-4 text-center bg-purple-300 hover:bg-purple-500"
          onClick={addCorner}
        >
          Confirm
        </button>
      </div>
      <Stage
        width={width}
        height={height}
        onClick={(event) => {
          const stage = event.target.getStage();
          const pointer = stage?.getPointerPosition();

          if (stage && pointer) {
            // stop default scrolling
            event.evt.preventDefault();

            const oldScale = stage.scaleX();

            setCurrentCorner([
              (pointer.x - stage.x()) / oldScale,
              (pointer.y - stage.y()) / oldScale,
            ]);
          }
        }}
        onMouseMove={(event) => {
          if (mouseDown.current) {
            const stage = event.target.getStage();
            const pointer = stage?.getPointerPosition();

            if (stage && pointer) {
              // stop default scrolling
              event.evt.preventDefault();

              const oldScale = stage.scaleX();

              setCurrentCorner([
                (pointer.x - stage.x()) / oldScale,
                (pointer.y - stage.y()) / oldScale,
              ]);
            }
          }
        }}
        onMouseUp={() => (mouseDown.current = false)}
        onMouseDown={() => (mouseDown.current = true)}
        onWheel={(event) => {
          const stage = event.target.getStage();
          const pointer = stage?.getPointerPosition();

          if (stage && pointer) {
            // stop default scrolling
            event.evt.preventDefault();
            const scaleBy = 1.05;

            const oldScale = stage.scaleX();

            const mousePointTo = {
              x: (pointer.x - stage.x()) / oldScale,
              y: (pointer.y - stage.y()) / oldScale,
            };

            // console.log(mousePointTo)

            // how to scale? Zoom in? Or zoom out?
            let direction = event.evt.deltaY > 0 ? 1 : -1;

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (event.evt.ctrlKey) {
              direction = -direction;
            }

            const newScale = Math.max(
              direction > 0 ? oldScale * scaleBy : oldScale / scaleBy,
              1,
            );

            stage.scale({ x: newScale, y: newScale });

            // console.log(stage.x(), stage.y())
            const maxX = stage.width() * newScale - stage.width();
            const maxY = stage.height() * newScale - stage.height();

            const newPos = {
              x: clamp(-maxX, 0, pointer.x - mousePointTo.x * newScale),
              y: clamp(-maxY, 0, pointer.y - mousePointTo.y * newScale),
            };
            stage.position(newPos);
          }
        }}
      >
        <Layer>
          <Image
            image={reactImage}
            scaleX={width / CAMERA_WIDTH}
            scaleY={height / CAMERA_HEIGHT}
          />
        </Layer>
        <Layer>
          <Circle
            x={currentCorner[0]}
            y={currentCorner[1]}
            stroke="red"
            radius={1}
            strokeWidth={0.5}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default Calibrate;

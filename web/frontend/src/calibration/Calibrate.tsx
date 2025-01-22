import { Circle, Image, Layer, Stage } from "react-konva";
import {
  BOARD_DIMENSIONS,
  CAMERA_HEIGHT,
  CAMERA_WIDTH,
  DISC_INNER_RADIUS,
} from "../../../constants/constants.ts";
import { useEffect, useRef, useState } from "react";
import useImage from "use-image";
import { Socket } from "socket.io-client";
import { Coordinate } from "../../../types/types.ts";

type CalibrateProps = {
  image: string;
  socket: Socket;
  onComplete: () => void;
};

const pixelDistanceBetween = (a: Coordinate, b: Coordinate) => {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
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

  const [reactImage] = useImage("data:image/jpeg;base64," + image);
  useEffect(() => {
    console.log(currentCorner);
  }, [currentCorner]);

  const submitCalibration = async (allCorners: Coordinate[]) => {
    socket.emit("send-calibration-coordinates", allCorners);
    onComplete();
  };

  const addCorner = () => {
    const scaledCorner: Coordinate = [
      (currentCorner[0] * CAMERA_WIDTH) / width,
      (currentCorner[1] * CAMERA_HEIGHT) / height,
    ];
    const newCorners = [...corners, scaledCorner];
    setCurrentCorner([0, 0]);
    if (newCorners.length === 4) {
      const discPaddingTop =
        (pixelDistanceBetween(newCorners[1], newCorners[2]) *
          DISC_INNER_RADIUS) /
        BOARD_DIMENSIONS.y;
      const discPaddingRight =
        (pixelDistanceBetween(newCorners[2], newCorners[3]) *
          DISC_INNER_RADIUS) /
        BOARD_DIMENSIONS.x;
      const discPaddingLeft =
        (pixelDistanceBetween(newCorners[0], newCorners[1]) *
          DISC_INNER_RADIUS) /
        BOARD_DIMENSIONS.x;
      const discPaddingBottom =
        (pixelDistanceBetween(newCorners[0], newCorners[3]) *
          DISC_INNER_RADIUS) /
        BOARD_DIMENSIONS.y;

      const paddedCorners: Coordinate[] = [
        [
          newCorners[0][0] + discPaddingLeft,
          newCorners[0][1] + discPaddingBottom,
        ],
        [newCorners[1][0] + discPaddingLeft, newCorners[1][1] - discPaddingTop],
        [
          newCorners[2][0] + discPaddingRight,
          newCorners[2][1] - discPaddingTop,
        ],
        [
          newCorners[3][0] + discPaddingRight,
          newCorners[3][1] + discPaddingBottom,
        ],
      ];
      void submitCalibration(paddedCorners);
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

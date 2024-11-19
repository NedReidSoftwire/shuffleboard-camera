import {Canvas, useLoader, useThree} from "@react-three/fiber";

import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {Suspense} from "react";
import {Environment} from "@react-three/drei";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";
import {Disc, TeamColour} from "../../../types/types.ts";
import {BOARD_DIMENSIONS, DISC_DIAMETER} from "../../../constants/constants.ts";

const BOARD_MODEL_LENGTH = 2.25
const BOARD_MODEL_HEIGHT = 0.7
const DISC_MODEL_DIAMETER= 1.6
const GLOBAL_SCALE = 0.1

const boardScale = [BOARD_DIMENSIONS.x * GLOBAL_SCALE / BOARD_MODEL_HEIGHT, BOARD_DIMENSIONS.x * GLOBAL_SCALE / BOARD_MODEL_HEIGHT, BOARD_DIMENSIONS.y * GLOBAL_SCALE / BOARD_MODEL_LENGTH ]
const discScale = DISC_DIAMETER * GLOBAL_SCALE / DISC_MODEL_DIAMETER

const realToGameWorldMapping = (disc: Disc): Disc => {
  return {
    colour: disc.colour,
    y: (disc.x - BOARD_DIMENSIONS.x / 2) * GLOBAL_SCALE,
    x: (BOARD_DIMENSIONS.y - disc.y) * GLOBAL_SCALE
  }
}
const discPos = (disc: Disc) => [disc.x, 0, disc.y]

const FixedCamera = () => {
  useThree(({ camera }) => {
    // camera.position.set(0, 12, -12);
    // camera.lookAt(0, 0, -2)
    camera.position.set(22, 200, 7);
    camera.lookAt(22, 0, 7);
  });
  return null;
};


const useObj = (src: string) => {
  const materials = useLoader(MTLLoader, `${src}.mtl`);
  return useLoader(OBJLoader, `${src}.obj`, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
};

type BoardViewProps = {
  discs: Disc[]
}

const BoardView = ({ discs }: BoardViewProps) => {
  const redDisc = useObj("/models/red_disc");
  const blueDisc = useObj("/models/blue_disc");
  const board = useObj("/models/board");

  const gameWorldDiscs = discs.map(realToGameWorldMapping)

  return (
    <div className="h-96 w-[144]">
      <Canvas>
        <FixedCamera />
        <Suspense fallback={null}>
          {gameWorldDiscs.map((disc, index) => (
              <primitive object={disc.colour === TeamColour.RED? redDisc.clone(): blueDisc.clone()} position={discPos(disc)} scale={discScale}/>
          ))}
          <primitive object={board} position={[0, 0, 0]} scale={boardScale} />

          <Environment files="/textures/sky.exr" background />
          <ambientLight intensity={0.5} />
          <directionalLight intensity={1} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BoardView;

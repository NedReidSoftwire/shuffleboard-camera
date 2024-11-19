import {Canvas, useLoader, useThree} from "@react-three/fiber";

import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {Suspense} from "react";
import {Environment} from "@react-three/drei";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";
import {Disc, TeamColour} from "../../../types/types.ts";
import {BOARD_DIMENSIONS, DISC_DIAMETER} from "../../../constants/constants.ts";

const BOARD_MODEL_LENGTH = 2.25
const BOARD_MODEL_HEIGHT = 0.7
const DISC_MODEL_DIAMETER= 0.7
const GLOBAL_SCALE = 0.1

const boardScale = [BOARD_DIMENSIONS.y * GLOBAL_SCALE / BOARD_MODEL_LENGTH, BOARD_DIMENSIONS.y * GLOBAL_SCALE / BOARD_MODEL_LENGTH, BOARD_DIMENSIONS.x * GLOBAL_SCALE / BOARD_MODEL_HEIGHT ]
const discScale = DISC_DIAMETER * GLOBAL_SCALE / DISC_MODEL_DIAMETER

const realToGameWorldMapping = (disc: Disc): Disc => {
  return {
    colour: disc.colour,
    y: ((BOARD_DIMENSIONS.x / 2 - disc.x) * 2) * GLOBAL_SCALE,
    x: (BOARD_DIMENSIONS.y - disc.y) * GLOBAL_SCALE
  }
}
const discPos = (disc: Disc) => [disc.x, 0, disc.y]

const FixedCamera = () => {
  useThree(({ camera }) => {
    camera.position.set(20, 100, 0);
    camera.lookAt(50, 0, 0)
    // camera.position.set(140, 100, 40);
    // camera.lookAt(140, 0, 40);
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
          {gameWorldDiscs.map((disc) => (
              <primitive object={disc.colour === TeamColour.RED? redDisc.clone(): blueDisc.clone()} position={discPos(disc)} scale={6.8}/>
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

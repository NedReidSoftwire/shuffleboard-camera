import { Canvas, useLoader, useThree } from "@react-three/fiber";

import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Suspense } from "react";
import { Environment } from "@react-three/drei";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

const FixedCamera = () => {
  useThree(({ camera }) => {
    camera.position.set(0, 12, -12);
    camera.lookAt(0, 0, -2);
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

const BoardView = () => {
  const redDisc = useObj("/models/red_disc");
  const blueDisc = useObj("/models/blue_disc");
  const board = useObj("/models/board");
  return (
    <div className="h-96 w-[144]">
      <Canvas>
        <FixedCamera />
        <Suspense fallback={null}>
          <primitive object={redDisc.clone()} position={[5, 0, 3]} scale={1} />
          <primitive object={redDisc.clone()} position={[0, 0, 4]} scale={1} />
          <primitive object={blueDisc} position={[3, 0, -2]} scale={1} />
          <primitive object={board} position={[0, 0, 0]} scale={10} />
          {/*/!*<primitive object={board} position={[0, -12, 0]} scale={10} />*!/*/}

          <Environment files="/textures/sky.exr" background />
          <ambientLight intensity={0.5} />
          <directionalLight intensity={1} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BoardView;

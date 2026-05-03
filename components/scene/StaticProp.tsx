import { Entity } from './types';
import { GLTFModel } from './GLTFModel';
import { RigidBody } from '@react-three/rapier';

interface StaticPropProps {
  entity: Entity;
}

export function StaticProp({ entity }: StaticPropProps) {
  const { initialPosition, modelPath, modelRotationOffset } = entity;

  return (
    <RigidBody type="fixed" colliders={entity.category === 'road' ? false : 'cuboid'}>
      <group 
        position={[initialPosition[0], initialPosition[1], initialPosition[2]]} 
        rotation={[modelRotationOffset?.[0] || 0, modelRotationOffset?.[1] || 0, modelRotationOffset?.[2] || 0]}
        scale={entity.category === 'road' ? [4, 4, 4] : [1, 1, 1]}
      >
        {modelPath && <GLTFModel path={modelPath} />}
      </group>
    </RigidBody>
  );
}

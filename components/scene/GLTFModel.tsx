'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export function GLTFModel({ path, visualRotationOffset }: { path: string; visualRotationOffset?: number[] }) {
  const { scene } = useGLTF(path);
  
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const rot = visualRotationOffset ? new THREE.Euler(visualRotationOffset[0], visualRotationOffset[1], visualRotationOffset[2], 'XYZ') : new THREE.Euler(0, 0, 0);

  return (
    <group rotation={rot}>
      <primitive object={clonedScene} />
    </group>
  );
}


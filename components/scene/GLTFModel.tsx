'use client';

import { useGLTF, Clone } from '@react-three/drei';

export function GLTFModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  return <Clone object={scene} castShadow receiveShadow />;
}

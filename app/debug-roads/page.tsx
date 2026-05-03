'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GLTFModel } from '@/components/scene';

export default function DebugAlignPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100, color: '#fff', fontSize: 12, background: 'rgba(0,0,0,0.9)', padding: 16, borderRadius: 8, fontFamily: 'monospace' }}>
        <h3 style={{ margin: '0 0 8px' }}>Alignment Test</h3>
        <p style={{ margin: 0 }}>Row 1: Curve + offset 1.0 | Row 2: Curve + offset 1.5</p>
        <p style={{ margin: 0 }}>Row 3: Split + Z±0.5 | Row 4: Split + Z±1.0</p>
      </div>
      <Canvas camera={{ position: [0, 15, 8], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={0.5} />

        {/* === ROW 1: Curve with offset 1.0 === */}
        <group position={[-8, 0, -4]}>
          <GLTFModel path="/models/road/road-curve.glb" />
          {/* Left exit: tiles at X=-1, -2, -3 */}
          <group position={[-1, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-2, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-3, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          {/* Down exit: tiles at Z=1, 2, 3 */}
          <group position={[0, 0, 1]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[0, 0, 2]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[0, 0, 3]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <Html position={[0, 1, 0]} center><div style={{ background: '#ff0', color: '#000', padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }}>offset=1.0</div></Html>
        </group>

        {/* === ROW 2: Curve with offset 1.5 === */}
        <group position={[4, 0, -4]}>
          <GLTFModel path="/models/road/road-curve.glb" />
          {/* Left exit: tiles at X=-1.5, -2.5, -3.5 */}
          <group position={[-1.5, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-2.5, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-3.5, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          {/* Down exit: tiles at Z=1.5, 2.5, 3.5 */}
          <group position={[0, 0, 1.5]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[0, 0, 2.5]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[0, 0, 3.5]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <Html position={[0, 1, 0]} center><div style={{ background: '#ff0', color: '#000', padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }}>offset=1.5</div></Html>
        </group>

        {/* === ROW 3: Split with Z=±0.5 === */}
        <group position={[-8, 0, 6]}>
          <GLTFModel path="/models/road/road-split.glb" />
          <group position={[-1, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-2, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[1, 0, -0.5]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[2, 0, -0.5]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[1, 0, 0.5]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[2, 0, 0.5]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <Html position={[0, 1, 0]} center><div style={{ background: '#0ff', color: '#000', padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }}>Z=±0.5</div></Html>
        </group>

        {/* === ROW 4: Split with Z=±1.0 === */}
        <group position={[4, 0, 6]}>
          <GLTFModel path="/models/road/road-split.glb" />
          <group position={[-1, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-2, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[1, 0, -1]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[2, 0, -1]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[1, 0, 1]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[2, 0, 1]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <Html position={[0, 1, 0]} center><div style={{ background: '#0ff', color: '#000', padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }}>Z=±1.0</div></Html>
        </group>

        {/* === REFERENCE: Working Crossroad === */}
        <group position={[-2, 0, 0]}>
          <GLTFModel path="/models/road/road-crossroad-path.glb" />
          <group position={[1, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[2, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-1, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[-2, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[0, 0, 1]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <group position={[0, 0, -1]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
          <Html position={[0, 1, 0]} center><div style={{ background: '#0f0', color: '#000', padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }}>CROSSROAD ref</div></Html>
        </group>

        <gridHelper args={[40, 40, '#444', '#222']} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

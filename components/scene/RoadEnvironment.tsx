'use client';

import { Grid } from '@react-three/drei';
import { GLTFModel } from './GLTFModel';

// Nền cỏ
function GrassGround() {
  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#3a6b3f" />
    </mesh>
  );
}

// Đoạn đường thẳng trục X
function StraightRoadX({ count, startOffset = 1, direction = 1 }: { count: number; startOffset?: number; direction?: 1 | -1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <group key={`rx-${direction}-${i}`} position={[direction * (i + startOffset), 0, 0]}>
          <GLTFModel path="/models/road/road-straight.glb" />
        </group>
      ))}
    </>
  );
}

// Đoạn đường thẳng trục Z
function StraightRoadZ({ count, startOffset = 1, direction = 1 }: { count: number; startOffset?: number; direction?: 1 | -1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <group key={`rz-${direction}-${i}`} position={[0, 0, direction * (i + startOffset)]} rotation={[0, Math.PI / 2, 0]}>
          <GLTFModel path="/models/road/road-straight.glb" />
        </group>
      ))}
    </>
  );
}

export function RoadEnvironment({ type }: { type?: string }) {
  const S = 4;
  const N = 14;

  if (type === 'custom') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        {/* Custom road pieces are rendered as entities via Scene3D */}
      </group>
    );
  }

  // 1. Ngã tư (Crossroad)
  if (type === 'crossroad') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-crossroad-path.glb" />
        <StraightRoadX count={N} direction={1} />
        <StraightRoadX count={N} direction={-1} />
        <StraightRoadZ count={N} direction={1} />
        <StraightRoadZ count={N} direction={-1} />
        <group position={[0.8, 0, -0.8]} scale={[0.4, 0.4, 0.4]}>
          <GLTFModel path="/models/road/light-square-cross.glb" />
        </group>
      </group>
    );
  }

  // 2. Ngã ba (T-junction)
  if (type === 'intersection') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-intersection-path.glb" />
        <StraightRoadX count={N} direction={1} />
        <StraightRoadX count={N} direction={-1} />
        <StraightRoadZ count={N} direction={1} />
        <group position={[0.8, 0, -0.6]} scale={[0.35, 0.35, 0.35]}>
          <GLTFModel path="/models/road/light-square.glb" />
        </group>
      </group>
    );
  }

  // 3. Đường thẳng
  if (type === 'straight') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-straight.glb" />
        <StraightRoadX count={N} direction={1} />
        <StraightRoadX count={N} direction={-1} />
        <group position={[0, 0, 0]}>
          <GLTFModel path="/models/road/road-crossing.glb" />
        </group>
      </group>
    );
  }

  // 4. Khúc cua — 2×2 model, offset=1.5
  if (type === 'curve') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        {/* Rotate curve by -90 degrees so it connects -X (left) to -Z (top) */}
        <group rotation={[0, -Math.PI / 2, 0]}>
          <GLTFModel path="/models/road/road-curve.glb" />
        </group>
        {/* LEFT exit (-X) */}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`cv-x-${i}`} position={[-(i + 1.5), 1.5, 0]}>
            <GLTFModel path="/models/road/road-straight.glb" />
          </group>
        ))}
        {/* UP exit (-Z) */}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`cv-z-${i}`} position={[0, 0, -(i + 1.5)]} rotation={[0, Math.PI / 2, 0]}>
            <GLTFModel path="/models/road/road-straight.glb" />
          </group>
        ))}
        <group position={[0.5, 0, -0.5]} scale={[0.4, 0.4, 0.4]}>
          <GLTFModel path="/models/road/construction-cone.glb" />
        </group>
      </group>
    );
  }

  // 5. Cua gấp
  if (type === 'bend') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-bend-sidewalk.glb" />
        <StraightRoadX count={N} direction={-1} />
        <StraightRoadZ count={N} direction={-1} />
      </group>
    );
  }

  // 6. Vòng xoay
  if (type === 'roundabout') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-roundabout.glb" />
        {Array.from({ length: N }).map((_, i) => (
          <group key={`rb-e-${i}`} position={[i + 2, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
        ))}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`rb-w-${i}`} position={[-(i + 2), 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
        ))}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`rb-s-${i}`} position={[0, 0, i + 2]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
        ))}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`rb-n-${i}`} position={[0, 0, -(i + 2)]} rotation={[0, Math.PI / 2, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
        ))}
      </group>
    );
  }

  // 7. Đường chia nhánh — model is 1×2 units, centered at origin
  // Branches are separated by a median, so centers are at Z=±1.0
  if (type === 'split') {
    return (
      <group scale={[S, S, S]}>
        <GLTFModel path="/models/road/road-split.glb" />
        {/* Single-lane road entering from left (-X) */}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`sp-l-${i}`} position={[-(i + 1.5), 0, 0]}>
            <GLTFModel path="/models/road/road-straight.glb" />
          </group>
        ))}
        {/* Upper branch: lane center at Z=-1.0 */}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`sp-r1-${i}`} position={[i + 1.5, 0, -1.0]}>
            <GLTFModel path="/models/road/road-straight.glb" />
          </group>
        ))}
        {/* Lower branch: lane center at Z=+1.0 */}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`sp-r2-${i}`} position={[i + 1.5, 0, 1.0]}>
            <GLTFModel path="/models/road/road-straight.glb" />
          </group>
        ))}
        <group position={[-1, 0, 0]} scale={[0.4, 0.4, 0.4]}>
          <GLTFModel path="/models/road/sign-highway.glb" />
        </group>
      </group>
    );
  }

  // 8. Cầu
  if (type === 'bridge') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-bridge.glb" />
        <group position={[0, -0.5, -0.6]}><GLTFModel path="/models/road/bridge-pillar.glb" /></group>
        <group position={[0, -0.5, 0.6]}><GLTFModel path="/models/road/bridge-pillar.glb" /></group>
        {Array.from({ length: 3 }).map((_, i) => (
          <group key={`br-sl-${i}`} position={[-(i + 1), 0, 0]}><GLTFModel path="/models/road/road-slant.glb" /></group>
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <group key={`br-sr-${i}`} position={[i + 1, 0, 0]} rotation={[0, Math.PI, 0]}><GLTFModel path="/models/road/road-slant.glb" /></group>
        ))}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`br-l-${i}`} position={[-(i + 4), 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
        ))}
        {Array.from({ length: N }).map((_, i) => (
          <group key={`br-r-${i}`} position={[i + 4, 0, 0]}><GLTFModel path="/models/road/road-straight.glb" /></group>
        ))}
      </group>
    );
  }

  // 9. Cao tốc
  if (type === 'highway') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        {Array.from({ length: N * 2 + 1 }).map((_, i) => (
          <group key={`hw-${i}`} position={[i - N, 0, 0]}><GLTFModel path="/models/road/road-straight-barrier.glb" /></group>
        ))}
        <group position={[-N + 1, 0, -0.8]} scale={[0.5, 0.5, 0.5]}><GLTFModel path="/models/road/sign-highway-detailed.glb" /></group>
        <group position={[N - 1, 0, -0.8]} scale={[0.5, 0.5, 0.5]}><GLTFModel path="/models/road/sign-highway.glb" /></group>
      </group>
    );
  }

  // 10. Khúc cua + ngã tư
  if (type === 'curve-intersection') {
    return (
      <group scale={[S, S, S]}>
        <GrassGround />
        <GLTFModel path="/models/road/road-curve-intersection.glb" />
        <StraightRoadX count={N} direction={-1} />
        <StraightRoadZ count={N} direction={1} />
        <StraightRoadZ count={N} direction={-1} />
        <group position={[0.6, 0, -0.6]} scale={[0.35, 0.35, 0.35]}>
          <GLTFModel path="/models/road/light-curved.glb" />
        </group>
      </group>
    );
  }

  // Fallback
  return <Grid infiniteGrid fadeDistance={100} sectionColor="#4285F4" cellColor="#e0e0e0" />;
}

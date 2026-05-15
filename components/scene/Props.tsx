'use client';

import { Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// Cây (có vật lý — rất nặng, bám rễ)
export function SimpleTree({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody
      position={position}
      colliders={false}
      mass={800}
      restitution={0.05}
      friction={0.8}
      linearDamping={8}
      angularDamping={8}
    >
      <CuboidCollider args={[0.25, 1.8, 0.25]} position={[0, 1.8, 0]} />
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2.4, 6]} />
        <meshStandardMaterial color="#5c3a1e" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[1.2, 8, 6]} />
        <meshStandardMaterial color="#2d6b3f" />
      </mesh>
    </RigidBody>
  );
}

// Cột đèn đường (có vật lý — rất nặng, bắt vít bê tông)
export function StreetLight({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={rotation || [0, 0, 0]}
      colliders={false}
      mass={500}
      restitution={0.05}
      friction={0.8}
      linearDamping={10}
      angularDamping={10}
    >
      <CuboidCollider args={[0.15, 3, 0.15]} position={[0, 3, 0]} />
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 6, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, 5.8, 0.8]} castShadow>
        <boxGeometry args={[0.06, 0.06, 1.6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, 5.7, 1.5]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#ffdd44" emissive="#ffaa00" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 5.5, 1.5]} intensity={8} distance={20} color="#ffd080" />
    </RigidBody>
  );
}

// Biển tên đường
export function RoadSign({ position, rotation, text }: { position: [number, number, number]; rotation?: [number, number, number]; text: string }) {
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      <Html center distanceFactor={40} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(30,64,175,0.95)',
          color: 'white',
          padding: '5px 16px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          border: '2px solid white',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          {text}
        </div>
      </Html>
    </group>
  );
}

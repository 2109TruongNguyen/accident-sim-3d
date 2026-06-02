'use client';

import * as THREE from 'three';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CollisionPayload } from '@react-three/rapier';
import { Entity, VehicleProps } from './types';
import { GLTFModel } from './GLTFModel';

function SpeedLabel({ rigidBodyRef, entity, isPlaying }: { rigidBodyRef: React.RefObject<RapierRigidBody | null>; entity: Entity; isPlaying: boolean }) {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (rigidBodyRef.current && groupRef.current) {
      const pos = rigidBodyRef.current.translation();
      groupRef.current.position.set(pos.x, pos.y + 4, pos.z);

      if (isPlaying) {
        const vel = rigidBodyRef.current.linvel();
        const speedMs = Math.sqrt(vel.x ** 2 + vel.z ** 2);
        const speedKmh = speedMs * 3.6;
        setCurrentSpeed(Math.round(speedKmh));
      }
    }
  });

  const baseSpeed = entity.speedKmh || 0;
  const displaySpeed = isPlaying ? currentSpeed : baseSpeed;
  const bgColor = entity.type === 'motorcycle' ? 'rgba(239,68,68,0.9)' : 'rgba(37,99,235,0.9)';

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={30} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: bgColor,
          color: 'white',
          padding: '6px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
          lineHeight: 1.4,
        }}>
          <div style={{ fontSize: '10px', opacity: 0.85, marginBottom: 2 }}>
            {entity.label || entity.id} • {entity.licensePlate}
          </div>
          <div style={{ fontSize: '18px' }}>
            {displaySpeed} <span style={{ fontSize: '11px' }}>km/h</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function Vehicle({ entity, isPlaying, resetTrigger }: VehicleProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const phase = useRef<'idle' | 'driving' | 'crashed' | 'finished'>('idle');
  const crashFrames = useRef(0);
  const savedVel = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const savedAngVel = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const wasPaused = useRef(false);

  const getDirectionQuaternion = useCallback(() => {
    const q = new THREE.Quaternion();
    const euler = new THREE.Euler(
      entity.modelRotationOffset?.[0] || 0,
      entity.modelRotationOffset?.[1] || 0,
      entity.modelRotationOffset?.[2] || 0,
      'XYZ'
    );
    q.setFromEuler(euler);
    return q;
  }, [entity.modelRotationOffset]);

  const getComputedVelocity = useCallback(() => {
    const speedMs = (entity.speedKmh || 0) / 3.6;
    const yaw = entity.modelRotationOffset?.[1] || 0;
    return {
      x: speedMs * Math.sin(yaw),
      y: 0,
      z: speedMs * Math.cos(yaw)
    };
  }, [entity.speedKmh, entity.modelRotationOffset]);

  // Reset
  useEffect(() => {
    phase.current = 'idle';
    crashFrames.current = 0;
    wasPaused.current = false;

    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        { x: entity.initialPosition[0], y: entity.initialPosition[1], z: entity.initialPosition[2] },
        true
      );
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      rigidBodyRef.current.setRotation(getDirectionQuaternion(), true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  // Play / Pause
  useEffect(() => {
    if (isPlaying) {
      if (phase.current === 'idle') {
        phase.current = 'driving';
        crashFrames.current = 0;
      }
    }
  }, [isPlaying]);

  // Va chạm
  const handleCollision = useCallback(({ other }: CollisionPayload) => {
    if (phase.current === 'driving' && other.rigidBody) {
      phase.current = 'crashed';
      crashFrames.current = 0;
    }
  }, []);

  // Physics loop
  useFrame(() => {
    if (!rigidBodyRef.current) return;

    if (!isPlaying && phase.current !== 'idle') {
      if (!wasPaused.current) {
        savedVel.current = { ...rigidBodyRef.current.linvel() };
        savedAngVel.current = { ...rigidBodyRef.current.angvel() };
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        wasPaused.current = true;
      }
      return;
    }

    if (isPlaying && wasPaused.current) {
      wasPaused.current = false;
      if (phase.current === 'driving') {
        const vel = getComputedVelocity();
        rigidBodyRef.current.setLinvel(
          { x: vel.x, y: savedVel.current.y, z: vel.z },
          true
        );
      } else if (phase.current === 'crashed') {
        rigidBodyRef.current.setLinvel(savedVel.current, true);
        rigidBodyRef.current.setAngvel(savedAngVel.current, true);
      }
    }

    if (phase.current === 'driving') {
      const currentVel = rigidBodyRef.current.linvel();
      const vel = getComputedVelocity();
      rigidBodyRef.current.setLinvel(
        { x: vel.x, y: currentVel.y, z: vel.z },
        true
      );

      // Giữ cho xe luôn đứng thẳng khi đang chạy (không bị đổ ngang)
      const currentRot = rigidBodyRef.current.rotation();
      const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(currentRot.x, currentRot.y, currentRot.z, currentRot.w));
      euler.x = 0;
      euler.z = 0;
      rigidBodyRef.current.setRotation(new THREE.Quaternion().setFromEuler(euler), true);
    }

    if (phase.current === 'crashed') {
      crashFrames.current++;
      const vel = rigidBodyRef.current.linvel();
      const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2);

      if (crashFrames.current < 40) return;

      if (speed > 0.3) {
        const damping = 0.97;
        rigidBodyRef.current.setLinvel({ x: vel.x * damping, y: vel.y, z: vel.z * damping }, true);
        const angVel = rigidBodyRef.current.angvel();
        rigidBodyRef.current.setAngvel({ x: angVel.x * 0.97, y: angVel.y * 0.97, z: angVel.z * 0.97 }, true);
      } else {
        rigidBodyRef.current.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        phase.current = 'finished';
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders="cuboid"
        mass={entity.mass}
        position={[entity.initialPosition[0], entity.initialPosition[1], entity.initialPosition[2]]}
        restitution={0.6}
        friction={0.3}
        linearDamping={0}
        angularDamping={0}
        onCollisionEnter={handleCollision}
      >
        {entity.modelPath ? (
          <GLTFModel path={entity.modelPath} visualRotationOffset={entity.visualRotationOffset} />
        ) : (
          <mesh>
            <boxGeometry args={[2, 1.5, 4]} />
            <meshStandardMaterial color={entity.color} />
          </mesh>
        )}
      </RigidBody>
      <SpeedLabel rigidBodyRef={rigidBodyRef} entity={entity} isPlaying={isPlaying} />
    </>
  );
}

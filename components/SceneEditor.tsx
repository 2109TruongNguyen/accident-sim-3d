'use client';

import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '@/store/editorStore';
import { RoadEnvironment, GLTFModel } from './scene';
import { Entity } from './scene/types';

// Fallback Box for vehicles without models
const BoxVehicle = ({ color }: { color: string }) => (
  <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
    <boxGeometry args={[1.8, 1.2, 4]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const EditableVehicle = ({ entity }: { entity: Entity }) => {
  const [group, setGroup] = useState<THREE.Group | null>(null);
  const { selectedEntityId, setSelectedEntityId, updateEntityTransform, setOrbitEnabled, transformMode } = useEditorStore();
  
  const isSelected = selectedEntityId === entity.id;

  const handlePointerDown = (e: import('@react-three/fiber').ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setSelectedEntityId(entity.id);
  };

  const handleMouseUp = () => {
    if (group) {
      const position = group.position;
      const rotation = group.rotation;
      
      const round = (n: number) => Math.round(n * 100) / 100;
      
      updateEntityTransform(
        entity.id,
        [round(position.x), round(position.y), round(position.z)],
        [round(rotation.x), round(rotation.y), round(rotation.z)]
      );
    }
  };

  return (
    <>
      {isSelected && group && (
        <TransformControls
          object={group}
          mode={transformMode}
          showY={transformMode === 'translate' ? false : true} // Lock Y translation
          {...(entity.isStatic ? { translationSnap: 4, rotationSnap: Math.PI / 4 } : {})}
          // @ts-ignore
          onChange={() => {
            if (group) {
              const position = group.position;
              const rotation = group.rotation;
              const round = (n: number) => Math.round(n * 100) / 100;
              updateEntityTransform(
                entity.id,
                [round(position.x), round(position.y), round(position.z)],
                [round(rotation.x), round(rotation.y), round(rotation.z)]
              );
            }
          }}
          // @ts-ignore
          onDraggingChanged={(e: any) => {
            setOrbitEnabled(!e?.value);
          }}
        />
      )}
      <group 
        ref={setGroup} 
        position={entity.initialPosition as [number, number, number]}
        rotation={(entity.modelRotationOffset as [number, number, number]) || [0, 0, 0]}
        scale={entity.category === 'road' ? [4, 4, 4] : [1, 1, 1]}
      >
        {/* Invisible Hit Box for Raycasting */}
        <mesh 
          onPointerDown={handlePointerDown} 
          position={[0, entity.category === 'road' ? 0.1 : 1, 0]}
        >
          <boxGeometry args={entity.category === 'road' ? [2, 0.2, 2] : [3, 2, 6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* Selection Highlight */}
        {isSelected && (
          <mesh position={[0, 0.1, 0]}>
            <ringGeometry args={[2.5, 2.8, 32]} />
            <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} transparent opacity={0.8} />
            <lineSegments rotation={[-Math.PI / 2, 0, 0]} />
          </mesh>
        )}
        
        {/* Render Model or Fallback */}
        {entity.modelPath ? (
          <GLTFModel path={entity.modelPath} />
        ) : (
          <BoxVehicle color={entity.color} />
        )}

        {/* Direction Indicator */}
        <mesh position={[0, 0.2, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.3, 1, 16]} />
          <meshStandardMaterial color={entity.color} />
        </mesh>
      </group>
    </>
  );
};

export default function SceneEditor() {
  const { sceneData, orbitEnabled, setSelectedEntityId } = useEditorStore();

  const timeOfDay = sceneData.environment.timeOfDay || 'noon';
  const weather = sceneData.environment.weather || 'clear';

  // Determine lighting based on timeOfDay
  let ambientIntensity = 1.0;
  let directionalIntensity = 1.5;
  let sunPosition: [number, number, number] = [100, 100, 50];

  if (timeOfDay === 'dusk' || timeOfDay === 'dawn') {
    ambientIntensity = 0.5;
    directionalIntensity = 0.8;
    sunPosition = [100, 10, -50];
  } else if (timeOfDay === 'night') {
    ambientIntensity = 0.1;
    directionalIntensity = 0.2;
    sunPosition = [0, -100, 0]; // Sun is below horizon
  }

  // Handle deselecting clicking on empty space
  const handlePointerMissed = () => {
    setSelectedEntityId(null);
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 30, 30], fov: 45 }}
      onPointerMissed={handlePointerMissed}
      style={{ background: timeOfDay === 'night' ? '#0f172a' : '#87CEEB' }}
    >
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        castShadow
        position={sunPosition}
        intensity={directionalIntensity}
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 1, 200]} />
      </directionalLight>

      {timeOfDay !== 'night' && <Sky sunPosition={sunPosition} />}
      
      {/* Dynamic fog based on weather */}
      {weather === 'fog' && <fog attach="fog" args={['#d4d4d8', 10, 80]} />}
      {weather === 'rain' && <fog attach="fog" args={['#64748b', 20, 100]} />}

      <Suspense fallback={null}>
        {/* Road Environment */}
        <RoadEnvironment 
          type={sceneData.environment.type || 'crossroad'} 
        />

        {/* Entities */}
        {sceneData.entities.map((entity) => (
          <EditableVehicle key={entity.id} entity={entity} />
        ))}


      </Suspense>

      <OrbitControls 
        enabled={orbitEnabled}
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going below ground
        maxDistance={150}
      />
      
      <gridHelper args={[200, 200, '#ffffff', '#555555']} position={[0, 0.01, 0]} />
    </Canvas>
  );
}

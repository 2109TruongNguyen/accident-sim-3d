'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { Physics, CuboidCollider } from '@react-three/rapier';
import mockData from '../public/data/mock.json';
import { SceneData } from '@/components/scene/types';

import { Entity, Vehicle, RoadEnvironment, SimpleTree, StreetLight, RoadSign, PrioritySign, StaticProp } from './scene';

import { Suspense } from 'react';

interface Scene3DProps {
  isPlaying: boolean;
  resetTrigger: number;
  sceneData?: SceneData;
}

export default function Scene3D({ isPlaying, resetTrigger, sceneData }: Scene3DProps) {
  const activeData = sceneData || (mockData as SceneData);
  const envType = activeData.environment?.type;
  const roadNames = activeData.environment?.roadNames || [];
  const entitiesToRender = activeData.entities || [];

  const timeOfDay = activeData.environment?.timeOfDay || 'noon';
  const weather = activeData.environment?.weather || 'clear';

  let ambientIntensity = 1.0;
  let directionalIntensity = 1.5;
  let sunPosition: [number, number, number] = [100, 100, 50];
  let bgColor = '#87CEEB';

  if (timeOfDay === 'dusk' || timeOfDay === 'dawn') {
    ambientIntensity = 0.5;
    directionalIntensity = 0.8;
    sunPosition = [100, 10, -50];
  } else if (timeOfDay === 'night') {
    ambientIntensity = 0.1;
    directionalIntensity = 0.2;
    sunPosition = [0, -100, 0];
    bgColor = '#0f172a';
  }

  return (
    <Canvas camera={{ position: [30, 25, 35], fov: 50 }} shadows style={{ background: bgColor }}>
      <Suspense fallback={null}>
        <ambientLight intensity={ambientIntensity} />
        <directionalLight
          position={sunPosition}
          intensity={directionalIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {timeOfDay !== 'night' && <Sky sunPosition={sunPosition} />}
        
        {/* Bầu trời & sương mù động */}
        {weather === 'fog' && <fog attach="fog" args={['#d4d4d8', 10, 80]} />}
        {weather === 'rain' && <fog attach="fog" args={['#64748b', 20, 100]} />}

        <Physics>
          <RoadEnvironment type={envType} />

          {/* Biển tên đường & Biển báo giao thông */}
          {roadNames[0] && <RoadSign position={[-20, 6, -3]} text={roadNames[0]} />}
          {roadNames[1] && (
            <>
              <RoadSign position={[3, 6, -20]} text={roadNames[1]} rotation={[0, Math.PI / 2, 0]} />
              <PrioritySign position={[-3.5, 0, -6]} rotation={[0, 0, 0]} />
            </>
          )}

          {/* Cây xanh dọc 2 bên đường */}
          <SimpleTree key={`t1-${resetTrigger}`} position={[-8, 0, 6]} />
          <SimpleTree key={`t2-${resetTrigger}`} position={[-16, 0, 6]} />
          <SimpleTree key={`t3-${resetTrigger}`} position={[-24, 0, 6]} />
          <SimpleTree key={`t4-${resetTrigger}`} position={[-32, 0, 6]} />
          <SimpleTree key={`t5-${resetTrigger}`} position={[8, 0, -6]} />
          <SimpleTree key={`t6-${resetTrigger}`} position={[16, 0, -6]} />
          <SimpleTree key={`t7-${resetTrigger}`} position={[24, 0, -6]} />
          <SimpleTree key={`t8-${resetTrigger}`} position={[32, 0, -6]} />
          <SimpleTree key={`t9-${resetTrigger}`} position={[6, 0, 8]} />
          <SimpleTree key={`t10-${resetTrigger}`} position={[6, 0, 16]} />
          <SimpleTree key={`t11-${resetTrigger}`} position={[6, 0, 24]} />
          <SimpleTree key={`t12-${resetTrigger}`} position={[-6, 0, -8]} />
          <SimpleTree key={`t13-${resetTrigger}`} position={[-6, 0, -16]} />
          <SimpleTree key={`t14-${resetTrigger}`} position={[-6, 0, -24]} />

          {/* Đèn đường */}
          <StreetLight key={`l1-${resetTrigger}`} position={[-6, 0, -3]} rotation={[0, Math.PI / 2, 0]} />
          <StreetLight key={`l2-${resetTrigger}`} position={[6, 0, 3]} rotation={[0, -Math.PI / 2, 0]} />
          <StreetLight key={`l3-${resetTrigger}`} position={[3, 0, 6]} rotation={[0, 0, 0]} />
          <StreetLight key={`l4-${resetTrigger}`} position={[-3, 0, -6]} rotation={[0, Math.PI, 0]} />

          {/* Sàn cố định */}
          <CuboidCollider position={[0, -0.5, 0]} args={[200, 0.5, 200]} friction={0} />

          {entitiesToRender.map((entity: Entity) => {
            if (entity.category === 'road' || entity.category === 'prop' || entity.isStatic) {
              return <StaticProp key={entity.id} entity={entity} />;
            }
            return (
              <Vehicle
                key={entity.id}
                entity={entity}
                isPlaying={isPlaying}
                resetTrigger={resetTrigger}
              />
            );
          })}
        </Physics>

        <OrbitControls makeDefault />
      </Suspense>
    </Canvas>
  );
}
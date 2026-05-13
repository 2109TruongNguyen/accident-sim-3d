'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, useGLTF, Box, Html } from '@react-three/drei';
import * as THREE from 'three';

function ModelInspector({ onInfo }: { onInfo: (info: object) => void }) {
  const { scene } = useGLTF('/models/vehicle/motorbike.glb');
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;

    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Collect all mesh names
    const meshNames: string[] = [];
    clone.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) meshNames.push(obj.name);
    });

    onInfo({
      size: { x: size.x.toFixed(3), y: size.y.toFixed(3), z: size.z.toFixed(3) },
      center: { x: center.x.toFixed(3), y: center.y.toFixed(3), z: center.z.toFixed(3) },
      min: { x: box.min.x.toFixed(3), y: box.min.y.toFixed(3), z: box.min.z.toFixed(3) },
      max: { x: box.max.x.toFixed(3), y: box.max.y.toFixed(3), z: box.max.z.toFixed(3) },
      meshCount: meshNames.length,
      meshNames,
    });
  }, [scene, onInfo]);

  return <primitive object={scene.clone(true)} ref={groupRef} />;
}

function AxesLabels() {
  return (
    <>
      {/* X axis label - RED = right */}
      <Html position={[5, 0.2, 0]} style={{ color: '#ff4444', fontWeight: 800, fontSize: 14, pointerEvents: 'none' }}>+X (Red)</Html>
      {/* Z axis label - BLUE = forward */}
      <Html position={[0, 0.2, 5]} style={{ color: '#4444ff', fontWeight: 800, fontSize: 14, pointerEvents: 'none' }}>+Z (Blue)</Html>
      {/* Y axis label - GREEN = up */}
      <Html position={[0, 5, 0]} style={{ color: '#44ff44', fontWeight: 800, fontSize: 14, pointerEvents: 'none' }}>+Y (Green)</Html>
    </>
  );
}

export default function DebugMotorbike() {
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [rotY, setRotY] = useState(0);
  const [notes, setNotes] = useState('');

  const commonOffsets = [
    { label: 'Mặc định (0°)', value: 0 },
    { label: '90° (π/2)', value: Math.PI / 2 },
    { label: '-90° (-π/2)', value: -Math.PI / 2 },
    { label: '180° (π)', value: Math.PI },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#0f172a', color: '#f1f5f9' }}>
      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [6, 5, 8], fov: 50 }} style={{ background: '#1e293b' }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 8, -5]} intensity={0.5} />
          <Grid infiniteGrid fadeDistance={50} cellColor="#334155" sectionColor="#475569" />
          <axesHelper args={[5]} />
          <AxesLabels />

          {/* Model with rotation applied */}
          <group rotation={[0, rotY, 0]}>
            <ModelInspector onInfo={setInfo} />
          </group>

          {/* Reference box - same size as a car (~4.5m long) */}
          <Box args={[1.8, 1.4, 4.5]} position={[6, 0.7, 0]}>
            <meshStandardMaterial color="#22c55e" wireframe />
          </Box>
          <Html position={[6, 2.5, 0]} center style={{ color: '#22c55e', fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            📦 Ref: Sedan (~4.5m)
          </Html>

          {/* Forward direction arrow */}
          <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 4, 0x4444ff, 0.5, 0.3]} />
          <Html position={[0.3, 0.5, 4.5]} style={{ color: '#6699ff', fontSize: 12, pointerEvents: 'none' }}>Forward (+Z)</Html>

          <OrbitControls />
        </Canvas>

        {/* Overlay instructions */}
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🔍 Kiểm tra hướng mô hình</div>
          <div style={{ color: '#94a3b8' }}>→ Mũi tên xanh (+Z) = hướng xe cần đi về phía trước</div>
          <div style={{ color: '#94a3b8' }}>→ Xoay model bằng slider để tìm góc đúng</div>
          <div style={{ color: '#94a3b8' }}>→ Box xanh lá = tham chiếu kích thước sedan</div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: 380, overflowY: 'auto', padding: 20, background: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>🏍️ Motorbike GLB Inspector</div>

        {/* Model info */}
        {info && (
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: '#818cf8' }}>📐 Kích thước & Bounds</div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Chiều rộng (X)', `${info.size?.x} m`],
                  ['Chiều cao (Y)', `${info.size?.y} m`],
                  ['Chiều dài (Z)', `${info.size?.z} m`],
                  ['Center X', info.center?.x],
                  ['Center Y', info.center?.y],
                  ['Center Z', info.center?.z],
                  ['Min Y', info.min?.y],
                  ['Max Y', info.max?.y],
                  ['Số mesh', info.meshCount],
                ].map(([k, v]) => (
                  <tr key={String(k)}>
                    <td style={{ color: '#94a3b8', paddingBottom: 4, paddingRight: 12 }}>{k}</td>
                    <td style={{ fontFamily: 'monospace', color: '#f1f5f9', fontWeight: 600 }}>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rotation tester */}
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: '#818cf8' }}>🔄 Xoay Y (modelRotationOffset[1])</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {commonOffsets.map(o => (
              <button key={o.label} onClick={() => setRotY(o.value)} style={{
                padding: '8px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600,
                border: Math.abs(rotY - o.value) < 0.01 ? '2px solid #818cf8' : '1px solid #334155',
                background: Math.abs(rotY - o.value) < 0.01 ? '#312e81' : '#1e293b',
                color: Math.abs(rotY - o.value) < 0.01 ? '#c7d2fe' : '#94a3b8',
              }}>
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input type="range" min={-Math.PI} max={Math.PI} step={0.01}
              value={rotY} onChange={e => setRotY(Number(e.target.value))}
              style={{ flex: 1 }} />
            <span style={{ fontFamily: 'monospace', fontSize: 12, minWidth: 50, color: '#f1f5f9' }}>
              {rotY.toFixed(4)}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            ≈ {(rotY * 180 / Math.PI).toFixed(1)}°
          </div>
        </div>

        {/* Recommended config */}
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: '#818cf8' }}>⚙️ Cấu hình gợi ý (JSON)</div>
          <pre style={{
            background: '#0f172a', borderRadius: 6, padding: 12, fontSize: 11,
            color: '#86efac', overflow: 'auto', margin: 0, fontFamily: 'monospace',
            border: '1px solid #1e293b',
          }}>
{`{
  "type": "motorcycle",
  "category": "vehicle",
  "mass": 150,
  "modelPath": "/models/vehicle/motorbike.glb",
  "modelRotationOffset": [
    0,
    ${rotY.toFixed(4)},
    0
  ],
  "initialPosition": [0, ${info ? Math.abs(Number(info.min?.y)).toFixed(2) : '0.30'}, 0],
  "speedKmh": 40
}`}
          </pre>
          <button
            onClick={() => {
              const txt = `motorbike.glb analysis:\nSize: ${JSON.stringify(info?.size)}\nRecommended rotY: ${rotY.toFixed(4)} (${(rotY * 180 / Math.PI).toFixed(1)}°)\nMin Y (ground offset): ${info?.min?.y}\nNotes: ${notes}`;
              navigator.clipboard.writeText(txt);
              alert('Đã copy vào clipboard!');
            }}
            style={{ marginTop: 10, width: '100%', padding: '8px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
          >
            📋 Copy kết quả phân tích
          </button>
        </div>

        {/* Notes */}
        <div style={{ background: '#1e293b', borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#818cf8' }}>📝 Ghi chú quan sát</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="VD: Mô hình mặc định quay về -Z, cần xoay 180°. Bánh xe nằm ở Y=0..."
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: 10, color: '#f1f5f9', fontSize: 12, resize: 'vertical', minHeight: 80, boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>
    </div>
  );
}

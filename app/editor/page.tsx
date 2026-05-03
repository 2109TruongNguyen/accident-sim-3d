'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SceneEditor from '@/components/SceneEditor';
import { useEditorStore } from '@/store/editorStore';
import { Cloud, Sun, CloudRain, CloudFog, Map, Download, Plus, Trash2, Car, Bike, Info, PlayCircle } from 'lucide-react';

const ROAD_TYPES = [
  { value: 'crossroad', label: 'Ngã tư' },
  { value: 'intersection', label: 'Ngã ba chữ T' },
  { value: 'straight', label: 'Đường thẳng' },
  { value: 'curve', label: 'Khúc cua' },
  { value: 'roundabout', label: 'Vòng xoay' },
  { value: 'split', label: 'Đường nhánh' },
  { value: 'highway', label: 'Đường cao tốc' },
  { value: 'custom', label: 'Bãi trống (Tự lắp ráp)' },
];

const WEATHER_TYPES = [
  { value: 'clear', label: 'Trời trong', icon: <Sun size={16} /> },
  { value: 'rain', label: 'Mưa', icon: <CloudRain size={16} /> },
  { value: 'fog', label: 'Sương mù', icon: <CloudFog size={16} /> },
];

const TIME_OF_DAY = [
  { value: 'morning', label: 'Sáng' },
  { value: 'noon', label: 'Trưa' },
  { value: 'afternoon', label: 'Chiều' },
  { value: 'dusk', label: 'Chạng vạng' },
  { value: 'night', label: 'Đêm' },
];

const VEHICLE_MODELS = [
  { path: '/models/vehicle/sedan.glb', label: 'Sedan', type: 'car' },
  { path: '/models/vehicle/suv.glb', label: 'SUV', type: 'car' },
  { path: '/models/vehicle/taxi.glb', label: 'Taxi', type: 'car' },
  { path: '/models/vehicle/police.glb', label: 'Cảnh sát', type: 'car' },
  { path: '/models/vehicle/ambulance.glb', label: 'Cứu thương', type: 'car' },
  { path: '/models/vehicle/firetruck.glb', label: 'Cứu hỏa', type: 'car' },
  { path: '/models/vehicle/truck.glb', label: 'Xe tải', type: 'car' },
  { path: '/models/vehicle/van.glb', label: 'Xe Van', type: 'car' },
  { path: '/models/vehicle/bus.glb', label: 'Xe Buýt', type: 'car' },
  { path: '/models/vehicle/garbage-truck.glb', label: 'Xe rác', type: 'car' },
];

const ROAD_MODELS = [
  { path: '/models/road/road-straight.glb', label: 'Đường thẳng' },
  { path: '/models/road/road-curve.glb', label: 'Khúc cua' },
  { path: '/models/road/road-intersection.glb', label: 'Ngã ba' },
  { path: '/models/road/road-crossroad.glb', label: 'Ngã tư' },
  { path: '/models/road/road-split.glb', label: 'Đường nhánh' },
  { path: '/models/road/road-roundabout.glb', label: 'Vòng xoay' },
];

export default function EditorPage() {
  const { 
    sceneData, 
    updateEnvironment, 
    addEntity, 
    removeEntity,
    updateEntityProps,
    selectedEntityId,
    setSelectedEntityId,
    transformMode,
    setTransformMode
  } = useEditorStore();
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'env' | 'library' | 'entities'>('env');

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(sceneData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'scene_export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSimulateNow = () => {
    const latestSceneData = useEditorStore.getState().sceneData;
    localStorage.setItem('editorScene', JSON.stringify(latestSceneData));
    router.push('/');
  };

  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* LEFT: Editor Control Panel */}
      <aside style={{
        width: 380, background: '#fafaf8', borderRight: '2px solid #1a1a1a',
        display: 'flex', flexDirection: 'column', zIndex: 10
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Map size={24} color="#2563eb" />
            Scene Editor
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>Trình thiết kế và giả lập hiện trường 3D</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <button 
            onClick={() => setActiveTab('env')}
            style={{ 
              flex: 1, padding: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, borderBottom: activeTab === 'env' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'env' ? '#2563eb' : '#666'
            }}
          >
            Cấu hình
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            style={{ 
              flex: 1, padding: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, borderBottom: activeTab === 'library' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'library' ? '#2563eb' : '#666'
            }}
          >
            Thư viện
          </button>
          <button 
            onClick={() => setActiveTab('entities')}
            style={{ 
              flex: 1, padding: 12, border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, borderBottom: activeTab === 'entities' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'entities' ? '#2563eb' : '#666'
            }}
          >
            Thực thể ({sceneData.entities.length})
          </button>
        </div>

        {/* Content Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {activeTab === 'env' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Road Type */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>LOẠI ĐƯỜNG</label>
                <select 
                  value={sceneData.environment.type || 'crossroad'}
                  onChange={(e) => updateEnvironment({ type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
                >
                  {ROAD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Time of Day */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>THỜI GIAN TRONG NGÀY</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TIME_OF_DAY.map(t => (
                    <button
                      key={t.value}
                      onClick={() => updateEnvironment({ timeOfDay: t.value })}
                      style={{
                        padding: '8px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                        border: sceneData.environment.timeOfDay === t.value ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: sceneData.environment.timeOfDay === t.value ? '#eff6ff' : '#fff',
                        fontWeight: sceneData.environment.timeOfDay === t.value ? 600 : 400
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>THỜI TIẾT</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {WEATHER_TYPES.map(w => (
                    <button
                      key={w.value}
                      onClick={() => updateEnvironment({ weather: w.value })}
                      style={{
                        padding: '8px 4px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        border: sceneData.environment.weather === w.value ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: sceneData.environment.weather === w.value ? '#eff6ff' : '#fff',
                        fontWeight: sceneData.environment.weather === w.value ? 600 : 400
                      }}
                    >
                      {w.icon}
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>THƯ VIỆN ĐƯỜNG</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROAD_MODELS.map(road => (
                    <button
                      key={road.path}
                      onClick={() => addEntity({ category: 'road', isStatic: true, modelPath: road.path, label: road.label })}
                      style={{
                        padding: '8px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: '1px solid #d1d5db', background: '#fff', textAlign: 'center'
                      }}
                    >
                      + {road.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>THƯ VIỆN XE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {VEHICLE_MODELS.map(vehicle => (
                    <button
                      key={vehicle.path}
                      onClick={() => addEntity({ category: 'vehicle', type: vehicle.type, modelPath: vehicle.path, label: vehicle.label })}
                      style={{
                        padding: '8px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: '1px solid #d1d5db', background: '#fff', textAlign: 'center'
                      }}
                    >
                      + {vehicle.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => addEntity({ type: 'car' })}
                  style={{ flex: 1, padding: 8, background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
                >
                  <Car size={16} /> + Ô tô
                </button>
                <button 
                  onClick={() => addEntity({ type: 'motorcycle' })}
                  style={{ flex: 1, padding: 8, background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
                >
                  <Bike size={16} /> + Xe máy
                </button>
              </div>

              <div style={{ background: '#eff6ff', padding: 12, borderRadius: 8, display: 'flex', gap: 8, fontSize: 12, color: '#1e40af', border: '1px solid #bfdbfe' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Bạn có thể click vào xe bên màn hình 3D và dùng hệ trục tọa độ để điều chỉnh.</span>
              </div>

              {selectedEntityId && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>CHẾ ĐỘ ĐIỀU KHIỂN</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setTransformMode('translate')}
                      style={{
                        flex: 1, padding: 8, borderRadius: 6, fontSize: 13, cursor: 'pointer',
                        border: transformMode === 'translate' ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: transformMode === 'translate' ? '#eff6ff' : '#fff',
                        fontWeight: transformMode === 'translate' ? 600 : 400
                      }}
                    >
                      Dịch chuyển
                    </button>
                    <button
                      onClick={() => setTransformMode('rotate')}
                      style={{
                        flex: 1, padding: 8, borderRadius: 6, fontSize: 13, cursor: 'pointer',
                        border: transformMode === 'rotate' ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: transformMode === 'rotate' ? '#eff6ff' : '#fff',
                        fontWeight: transformMode === 'rotate' ? 600 : 400
                      }}
                    >
                      Xoay hướng
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {sceneData.entities.map((ent, idx) => (
                  <div 
                    key={ent.id} 
                    onClick={() => setSelectedEntityId(ent.id)}
                    style={{ 
                      padding: 12, borderRadius: 8, background: '#fff', 
                      border: selectedEntityId === ent.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{ent.label || `Xe ${idx + 1}`}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeEntity(ent.id); }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Entity Properties Edit - context-aware based on category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {/* Label */}
                      <div style={{ gridColumn: ent.category === 'road' || ent.category === 'prop' ? '1 / -1' : undefined }}>
                        <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>TÊN</label>
                        <input 
                          type="text" 
                          value={ent.label || ''} 
                          onChange={(e) => updateEntityProps(ent.id, { label: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4 }}
                        />
                      </div>

                      {/* Color - only for vehicles */}
                      {ent.category !== 'road' && ent.category !== 'prop' && (
                        <div>
                          <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>MÀU SẮC</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input 
                              type="color" 
                              value={ent.color} 
                              onChange={(e) => updateEntityProps(ent.id, { color: e.target.value })}
                              style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            />
                            <input 
                              type="text" 
                              value={ent.color} 
                              onChange={(e) => updateEntityProps(ent.id, { color: e.target.value })}
                              style={{ width: '100%', padding: '4px 6px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Speed - only for vehicles */}
                      {ent.category !== 'road' && ent.category !== 'prop' && (
                        <div>
                          <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>VẬN TỐC (KM/H)</label>
                          <input 
                            type="number" 
                            value={ent.speedKmh} 
                            onChange={(e) => updateEntityProps(ent.id, { speedKmh: Number(e.target.value) })}
                            style={{ width: '100%', padding: '4px 6px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4 }}
                          />
                        </div>
                      )}

                      {/* Mass - only for vehicles */}
                      {ent.category !== 'road' && ent.category !== 'prop' && (
                        <div>
                          <label style={{ fontSize: 10, color: '#666', display: 'block', marginBottom: 2 }}>KHỐI LƯỢNG (KG)</label>
                          <input 
                            type="number" 
                            value={ent.mass} 
                            onChange={(e) => updateEntityProps(ent.id, { mass: Number(e.target.value) })}
                            style={{ width: '100%', padding: '4px 6px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4 }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 10, color: '#666', fontFamily: "monospace" }}>
                      <div>Pos: [{ent.initialPosition.map(p => p.toFixed(1)).join(', ')}]</div>
                      <div>Rot Y: {((ent.modelRotationOffset?.[1] || 0) * (180 / Math.PI)).toFixed(0)}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: 24, borderTop: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button 
            onClick={handleSimulateNow}
            style={{ 
              width: '100%', padding: '12px', background: '#2563eb', color: '#fff', 
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.3)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            <PlayCircle size={18} />
            Mô phỏng ngay
          </button>
          <button 
            onClick={handleExportJSON}
            style={{ 
              width: '100%', padding: '10px', background: '#fff', color: '#374151', 
              border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            Export JSON
          </button>
        </div>
      </aside>

      {/* RIGHT: R3F Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <SceneEditor />
      </div>

    </main>
  );
}

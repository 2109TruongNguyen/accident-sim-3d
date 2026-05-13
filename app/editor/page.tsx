'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SceneEditor from '@/components/SceneEditor';
import { useEditorStore } from '@/store/editorStore';
import { Cloud, Sun, CloudRain, CloudFog, Map, Download, Plus, Trash2, Car, Bike, Info, PlayCircle, FileText, MapPin, Clock, User, AlertTriangle, Package, DollarSign, Scale } from 'lucide-react';

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
  { path: '/models/vehicle/sedan.glb', label: 'Sedan', type: 'car', mass: 1500, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/suv.glb', label: 'SUV', type: 'car', mass: 1800, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/taxi.glb', label: 'Taxi', type: 'car', mass: 1400, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/police.glb', label: 'Cảnh sát', type: 'car', mass: 1600, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/ambulance.glb', label: 'Cứu thương', type: 'car', mass: 2500, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/firetruck.glb', label: 'Cứu hỏa', type: 'car', mass: 8000, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/truck.glb', label: 'Xe tải', type: 'car', mass: 5000, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/van.glb', label: 'Xe Van', type: 'car', mass: 2000, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/bus.glb', label: 'Xe Buýt', type: 'car', mass: 8000, rotY: Math.PI / 2, groundY: 0.5 },
  { path: '/models/vehicle/garbage-truck.glb', label: 'Xe rác', type: 'car', mass: 6000, rotY: Math.PI / 2, groundY: 0.5 },
  // 🏍️ Xe mô tô
  { path: '/models/vehicle/motorbike.glb', label: '🏍️ Mô tô', type: 'motorcycle', mass: 150, rotY: 0, visualRotY: Math.PI, groundY: 0.17 },
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
    updateCaseInfo,
    addEntity, 
    removeEntity,
    updateEntityProps,
    selectedEntityId,
    setSelectedEntityId,
    transformMode,
    setTransformMode
  } = useEditorStore();
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'case' | 'env' | 'library' | 'entities'>('case');

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
    router.push('/simulate');
  };

  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* LEFT: Editor Control Panel */}
      <aside style={{
        width: 380, background: '#fafaf8', borderRight: '2px solid #1a1a1a',
        display: 'flex', flexDirection: 'column', zIndex: 10
      }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Map size={24} color="#2563eb" />
              Scene Editor
            </h1>
            <button
              onClick={() => router.push('/')}
              style={{ display:'flex', alignItems:'center', gap:5, background:'#f1f5f9', color:'#475569', border:'1px solid #cbd5e1', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}
            >
              ← Trang chủ
            </button>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>Trình thiết kế và giả lập hiện trường 3D</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fff', overflowX: 'auto' }}>
          {[
            { key: 'case', label: 'Vụ án', icon: <FileText size={14} /> },
            { key: 'env', label: 'Đường', icon: <MapPin size={14} /> },
            { key: 'library', label: 'Thư viện', icon: <Package size={14} /> },
            { key: 'entities', label: `Thực thể (${sceneData.entities.length})`, icon: <Car size={14} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                flex: 1, padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === tab.key ? '#2563eb' : '#666'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* ══ TAB VỤ ÁN ══ */}
          {activeTab === 'case' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Section icon={<FileText size={16} />} title="Thông tin bản án">
                <Field label="Số bản án / Số vụ">
                  <input
                    type="text" placeholder="VD: 117/2023/DS-ST"
                    value={sceneData.caseInfo?.caseNumber || ''}
                    onChange={e => updateCaseInfo({ caseNumber: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Tên / Tiêu đề vụ án">
                  <input
                    type="text" placeholder="VD: Bồi thường thiệt hại tai nạn giao thông"
                    value={sceneData.caseInfo?.title || ''}
                    onChange={e => updateCaseInfo({ title: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Ngày xảy ra">
                    <input
                      type="text" placeholder="VD: 29/11/2016"
                      value={sceneData.caseInfo?.date || ''}
                      onChange={e => updateCaseInfo({ date: e.target.value })}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Giờ xảy ra">
                    <input
                      type="text" placeholder="VD: 17:40"
                      value={sceneData.caseInfo?.time || ''}
                      onChange={e => updateCaseInfo({ time: e.target.value })}
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </Section>

              <Section icon={<MapPin size={16} />} title="Địa điểm tai nạn">
                <Field label="Địa chỉ đầy đủ">
                  <textarea
                    placeholder="VD: Ngã tư giao nhau Đường Bùi Thị Xuân - Đường Thái Mại, Phường Hòa Mai"
                    value={sceneData.caseInfo?.location || ''}
                    onChange={e => updateCaseInfo({ location: e.target.value })}
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </Field>
                <Field label="Loại khu vực">
                  <select
                    value={sceneData.caseInfo?.area || ''}
                    onChange={e => updateCaseInfo({ area: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">-- Chọn khu vực --</option>
                    <option value="Khu dân cư">Khu dân cư</option>
                    <option value="Khu đô thị">Khu đô thị</option>
                    <option value="Ngoại ô">Ngoại ô</option>
                    <option value="Quốc lộ">Quốc lộ</option>
                    <option value="Cao tốc">Cao tốc</option>
                    <option value="Đường nội bộ">Đường nội bộ</option>
                  </select>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Tên đường 1">
                    <input
                      type="text" placeholder="VD: Đường Bùi Thị Xuân"
                      value={(sceneData.environment?.roadNames || [])[0] || ''}
                      onChange={e => {
                        const names = [...(sceneData.environment?.roadNames || ['', ''])];
                        names[0] = e.target.value;
                        updateEnvironment({ roadNames: names });
                      }}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Tên đường 2">
                    <input
                      type="text" placeholder="VD: Đường Thái Mại"
                      value={(sceneData.environment?.roadNames || [])[1] || ''}
                      onChange={e => {
                        const names = [...(sceneData.environment?.roadNames || ['', ''])];
                        names[1] = e.target.value;
                        updateEnvironment({ roadNames: names });
                      }}
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </Section>

              <Section icon={<Scale size={16} />} title="Phân bổ trách nhiệm (tuỳ chọn)">
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#1e40af', marginBottom: 8 }}>
                  💡 Thông tin này sẽ xuất hiện trong phần phân tích thiệt hại &amp; bồi thường ở màn hình mô phỏng.
                </div>
                {[0, 1].map(i => (
                  <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Bên {i === 0 ? 'A' : 'B'}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, marginBottom: 8 }}>
                      <Field label="Tên phương tiện">
                        <input
                          type="text" placeholder={i === 0 ? 'VD: Ô Tô Toyota' : 'VD: Xe Mô Tô'}
                          value={(i === 0 ? sceneData.caseInfo?.damages?.faultRatio?.entityA?.label : sceneData.caseInfo?.damages?.faultRatio?.entityB?.label) || ''}
                          onChange={e => {
                            const cur = sceneData.caseInfo?.damages?.faultRatio || {};
                            const key = i === 0 ? 'entityA' : 'entityB';
                            updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, faultRatio: { ...cur, [key]: { ...(cur as Record<string,object>)[key], label: e.target.value } } } as SceneData['caseInfo']['damages'] });
                          }}
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="Lỗi (%)">
                        <input
                          type="number" min={0} max={100} placeholder="80"
                          value={(i === 0 ? sceneData.caseInfo?.damages?.faultRatio?.entityA?.percentage : sceneData.caseInfo?.damages?.faultRatio?.entityB?.percentage) || ''}
                          onChange={e => {
                            const cur = sceneData.caseInfo?.damages?.faultRatio || {};
                            const key = i === 0 ? 'entityA' : 'entityB';
                            updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, faultRatio: { ...cur, [key]: { ...(cur as Record<string,object>)[key], percentage: Number(e.target.value) } } } as SceneData['caseInfo']['damages'] });
                          }}
                          style={inputStyle}
                        />
                      </Field>
                    </div>
                    <Field label="Lý do">
                      <input
                        type="text" placeholder="VD: Không nhường đường tại ngã tư"
                        value={(i === 0 ? sceneData.caseInfo?.damages?.faultRatio?.entityA?.reason : sceneData.caseInfo?.damages?.faultRatio?.entityB?.reason) || ''}
                        onChange={e => {
                          const cur = sceneData.caseInfo?.damages?.faultRatio || {};
                          const key = i === 0 ? 'entityA' : 'entityB';
                          updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, faultRatio: { ...cur, [key]: { ...(cur as Record<string,object>)[key], reason: e.target.value } } } as SceneData['caseInfo']['damages'] });
                        }}
                        style={inputStyle}
                      />
                    </Field>
                  </div>
                ))}
              </Section>

              <Section icon={<DollarSign size={16} />} title="Thiệt hại & Bồi thường">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Tổng thiệt hại (VNĐ)">
                    <input
                      type="number" placeholder="VD: 97000000"
                      value={sceneData.caseInfo?.damages?.totalDamage || ''}
                      onChange={e => updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, totalDamage: Number(e.target.value) } as any })}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Thực tế bồi thường (VNĐ)">
                    <input
                      type="number" placeholder="VD: 77600000"
                      value={sceneData.caseInfo?.damages?.actualCompensation || ''}
                      onChange={e => updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, actualCompensation: Number(e.target.value) } as any })}
                      style={inputStyle}
                    />
                  </Field>
                </div>
                <Field label="Ghi chú bồi thường">
                  <textarea
                    placeholder="VD: Người lái mô tô tử vong. Bên A bồi thường 80% tổng thiệt hại cho bên B"
                    value={sceneData.caseInfo?.damages?.compensationNote || ''}
                    onChange={e => updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, compensationNote: e.target.value } as any })}
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </Field>
                
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Danh sách khoản mục</div>
                  {(sceneData.caseInfo?.damages?.items || []).map((item, idx) => (
                    <div key={idx} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8, position: 'relative' }}>
                      <button
                        onClick={() => {
                          const newItems = [...(sceneData.caseInfo?.damages?.items || [])];
                          newItems.splice(idx, 1);
                          updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, items: newItems } as any });
                        }}
                        style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}
                        title="Xóa khoản mục này"
                      >
                        🗑️
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, paddingRight: 24 }}>
                        <Field label="Tên khoản mục">
                          <input
                            type="text" placeholder="VD: Chi phí y tế, cứu chữa"
                            value={item.category || ''}
                            onChange={e => {
                              const newItems = [...(sceneData.caseInfo?.damages?.items || [])];
                              newItems[idx] = { ...newItems[idx], category: e.target.value };
                              updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, items: newItems } as any });
                            }}
                            style={inputStyle}
                          />
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <Field label="Số tiền (VNĐ)">
                            <input
                              type="number" placeholder="VD: 32000000"
                              value={item.amount || ''}
                              onChange={e => {
                                const newItems = [...(sceneData.caseInfo?.damages?.items || [])];
                                newItems[idx] = { ...newItems[idx], amount: Number(e.target.value) };
                                updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, items: newItems } as any });
                              }}
                              style={inputStyle}
                            />
                          </Field>
                          <Field label="Căn cứ pháp lý">
                            <input
                              type="text" placeholder="VD: Điều 590 khoản 1a"
                              value={item.legalBasis || ''}
                              onChange={e => {
                                const newItems = [...(sceneData.caseInfo?.damages?.items || [])];
                                newItems[idx] = { ...newItems[idx], legalBasis: e.target.value };
                                updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, items: newItems } as any });
                              }}
                              style={inputStyle}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newItems = [...(sceneData.caseInfo?.damages?.items || []), { category: '', amount: 0, legalBasis: '' }];
                      updateCaseInfo({ damages: { ...sceneData.caseInfo?.damages, items: newItems } as any });
                    }}
                    style={{ width: '100%', padding: '10px', background: '#eff6ff', color: '#2563eb', border: '1px dashed #93c5fd', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, marginTop: 4 }}
                  >
                    + Thêm khoản bồi thường
                  </button>
                </div>
              </Section>
            </div>
          )}


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
                      onClick={() => addEntity({ 
                        category: 'vehicle', 
                        type: vehicle.type, 
                        modelPath: vehicle.path, 
                        label: vehicle.label,
                        mass: vehicle.mass,
                        modelRotationOffset: [0, vehicle.rotY || 0, 0],
                        visualRotationOffset: vehicle.visualRotY !== undefined ? [0, vehicle.visualRotY, 0] : undefined,
                        initialPosition: [0, vehicle.groundY ?? 0.5, 0]
                      })}
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
                  onClick={() => addEntity({ type: 'car', modelPath: '/models/vehicle/sedan.glb', mass: 1500, modelRotationOffset: [0, Math.PI / 2, 0], initialPosition: [0, 0.5, 0] })}
                  style={{ flex: 1, padding: 8, background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
                >
                  <Car size={16} /> + Ô tô
                </button>
                <button 
                  onClick={() => addEntity({ type: 'motorcycle', modelPath: '/models/vehicle/motorbike.glb', mass: 150, modelRotationOffset: [0, 0, 0], visualRotationOffset: [0, Math.PI, 0], initialPosition: [0, 0.17, 0] })}
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

// ─── Shared style ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6,
  border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif", background: '#fff', color: '#111',
};

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

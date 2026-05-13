'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Scene3D from '@/components/Scene3D';
import { Entity, SceneData, DamageItem } from '@/components/scene/types';
import { Play, Pause, RotateCcw, Car, Bike, Gauge, Zap, ShieldAlert, DollarSign, AlertTriangle, FileText, Clock, MapPin, Scale, BookOpen, Users, Percent, Home, Save } from 'lucide-react';
import mockData from '../../public/data/mock.json';

// Mức độ nghiêm trọng dựa trên Delta-V (chuẩn forensic quốc tế)
function getSeverityByDeltaV(deltaV: number): { level: string; color: string; bg: string; desc: string } {
  if (deltaV < 10) return { level: 'Nhẹ', color: '#16a34a', bg: '#f0fdf4', desc: 'Trầy xước, hư hỏng bề mặt' };
  if (deltaV < 25) return { level: 'Trung bình', color: '#d97706', bg: '#fffbeb', desc: 'Biến dạng khung xe, airbag kích hoạt' };
  if (deltaV < 50) return { level: 'Nghiêm trọng', color: '#ea580c', bg: '#fff7ed', desc: 'Gãy xương, chấn thương nội tạng' };
  return { level: 'Rất nghiêm trọng', color: '#dc2626', bg: '#fef2f2', desc: 'Nguy hiểm tính mạng, tử vong cao' };
}

// Format VNĐ
function formatVND(n: number): string {
  return n.toLocaleString('vi-VN') + ' VNĐ';
}

export default function SimulatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [sceneData, setSceneData] = useState<SceneData>(mockData as SceneData);
  const [speeds, setSpeeds] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [caseInput, setCaseInput] = useState('');
  const [importedFromEditor, setImportedFromEditor] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Check localStorage for editor-imported scene
  useEffect(() => {
    try {
      const editorScene = localStorage.getItem('editorScene');
      if (editorScene) {
        const parsed = JSON.parse(editorScene) as SceneData;
        if (parsed && parsed.entities) {
          setSceneData(parsed);
          setImportedFromEditor(true);
          localStorage.removeItem('editorScene');
        }
      }
    } catch (e) {
      console.error('Failed to load editor scene:', e);
    }
    // Auto-open AI modal if requested
    if (searchParams.get('openAI') === '1') setShowInputModal(true);
  }, [searchParams]);

  useEffect(() => {
    if (sceneData?.entities) {
      setSpeeds(sceneData.entities.map((e: Entity) => e.speedKmh || 0));
      setResetTrigger(prev => prev + 1); // Reset scene on new data
      setIsPlaying(false);
    }
  }, [sceneData]);

  const handleGenerate = async () => {
    if (!caseInput.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseText: caseInput })
      });
      const data = await res.json();
      if (data && data.entities) {
        setSceneData(data);
        setShowInputModal(false);
        setCaseInput('');
      } else {
        alert('Có lỗi xảy ra: Không nhận được dữ liệu hợp lệ từ AI');
        console.error('Invalid response:', data);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi kết nối với máy chủ AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setResetTrigger(prev => prev + 1);
  };

  const handleSaveScene = () => {
    const name = sceneData?.caseInfo?.caseNumber
      ? `Vụ ${sceneData.caseInfo.caseNumber}`
      : `Kịch bản ${new Date().toLocaleDateString('vi-VN')}`;
    const newScene = {
      id: Date.now().toString(),
      name,
      savedAt: new Date().toISOString(),
      caseNumber: sceneData?.caseInfo?.caseNumber,
      location: sceneData?.caseInfo?.location,
      time: sceneData?.caseInfo?.time,
      date: sceneData?.caseInfo?.date,
      entityCount: sceneData?.entities?.filter(e => e.category !== 'road').length || 0,
      environmentType: sceneData?.environment?.type,
      data: sceneData,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('savedScenes') || '[]');
      existing.unshift(newScene);
      localStorage.setItem('savedScenes', JSON.stringify(existing));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch { /* ignore */ }
  };

  // ═══════ PHÂN TÍCH VA CHẠM — Công thức vật lý chính xác ═══════
  const impactAnalysis = useMemo(() => {
    const m1 = sceneData?.entities?.[0]?.mass || 0;
    const m2 = sceneData?.entities?.[1]?.mass || 0;
    const v1 = (speeds[0] || 0) / 3.6; // m/s
    const v2 = (speeds[1] || 0) / 3.6;

    // 1. Động năng (Kinetic Energy) — KE = ½mv²
    const ke1 = 0.5 * m1 * v1 * v1;
    const ke2 = 0.5 * m2 * v2 * v2;
    const totalKE_KJ = (ke1 + ke2) / 1000;

    // 2. Động lượng (Momentum) — p = mv
    const p1 = m1 * v1;
    const p2 = m2 * v2;

    // 3. Lực va chạm — Va chạm vuông góc → cộng vector Pythagoras
    const deltaT = 0.12; // 120ms — thời gian va chạm trung bình ô tô
    const totalMomentum = Math.sqrt(p1 * p1 + p2 * p2);
    const impactForceKN = totalMomentum / deltaT / 1000;

    // 4. Delta-V — Thay đổi vận tốc sau va chạm (va chạm hoàn toàn không đàn hồi)
    const combinedMass = m1 + m2;
    const vfx = combinedMass > 0 ? (m1 * v1) / combinedMass : 0;
    const vfz = combinedMass > 0 ? (m2 * v2) / combinedMass : 0;
    const deltaV1 = Math.abs(v1 - vfx) * 3.6; // km/h — cho xe 1
    const deltaV2 = Math.abs(v2 - vfz) * 3.6; // km/h — cho xe 2

    // 5. G-force — Gia tốc tác động lên cơ thể người
    const gForce1 = deltaT > 0 ? Math.abs(v1 - vfx) / (deltaT * 9.81) : 0;
    const gForce2 = deltaT > 0 ? Math.abs(v2 - vfz) / (deltaT * 9.81) : 0;

    // 6. Severity — dùng Delta-V (chuẩn quốc tế)
    const maxDeltaV = Math.max(deltaV1, deltaV2);
    const severity = getSeverityByDeltaV(maxDeltaV);

    return { totalKE_KJ, p1, p2, impactForceKN, deltaV1, deltaV2, gForce1, gForce2, severity, deltaT };
  }, [speeds, sceneData]);

  const caseInfo = sceneData?.caseInfo;
  const damages = caseInfo?.damages;

  return (
    <main style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* LEFT: 3D Viewport */}
      <div style={{ flex: 1, position: 'relative', background: '#1a1a2e' }}>
        <Scene3D 
          isPlaying={isPlaying} 
          resetTrigger={resetTrigger} 
          sceneData={sceneData ? {
            ...sceneData,
            entities: sceneData.entities.map((e, idx) => ({
              ...e,
              speedKmh: speeds[idx] ?? e.speedKmh
            }))
          } : undefined} 
        />

        {/* Top-left case badge */}
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          background: '#fff', border: '2px solid #1a1a1a', borderRadius: 8,
          padding: '10px 16px', maxWidth: 580,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale style={{ width: 18, height: 18 }} />
              <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>
                LegalTech 3D — Mô phỏng Hiện trường
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => router.push('/')}
                style={{ display:'flex', alignItems:'center', gap:4, background:'#f1f5f9', color:'#475569', border:'1px solid #cbd5e1', borderRadius:4, padding:'4px 10px', fontSize:11, fontWeight:700, cursor:'pointer' }}
              >
                <Home style={{ width: 11, height: 11 }} /> Trang chủ
              </button>
              <button
                onClick={handleSaveScene}
                style={{ display:'flex', alignItems:'center', gap:4, background: savedMsg ? '#16a34a' : '#1a1a1a', color:'white', border:'none', borderRadius:4, padding:'4px 10px', fontSize:11, fontWeight:700, cursor:'pointer', transition:'background 0.3s' }}
              >
                <Save style={{ width: 11, height: 11 }} /> {savedMsg ? 'Đã lưu!' : 'Lưu kịch bản'}
              </button>
              <button
                onClick={() => setShowInputModal(true)}
                style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
              >
                + Nhập bản án (AI)
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#666' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileText style={{ width: 12, height: 12 }} /> {caseInfo?.caseNumber || 'N/A'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 12, height: 12 }} /> {caseInfo?.time} — {caseInfo?.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin style={{ width: 12, height: 12 }} /> {caseInfo?.location || 'Chưa xác định'}
            </span>
          </div>
        </div>

        {/* Bottom controls */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          display: 'flex', gap: 10, alignItems: 'center',
          background: '#fff', border: '2px solid #1a1a1a', borderRadius: 8, padding: '8px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12, fontWeight: 600 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isPlaying ? '#f97316' : '#aaa',
              boxShadow: isPlaying ? '0 0 6px #f97316' : 'none',
              animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
            }} />
            {isPlaying ? 'Đang mô phỏng' : 'Chờ lệnh'}
          </div>

          <div style={{ width: 1, height: 28, background: '#ddd' }} />

          <button onClick={handlePlayPause} className="ctrl-btn" style={{
            background: isPlaying ? '#1a1a1a' : '#fff',
            color: isPlaying ? '#fff' : '#1a1a1a',
          }}>
            {isPlaying ? <><Pause style={{ width: 14, height: 14 }} /> Tạm dừng</> : <><Play style={{ width: 14, height: 14 }} /> Phát mô phỏng</>}
          </button>

          <button onClick={handleReset} className="ctrl-btn" style={{ background: '#fff', color: '#1a1a1a' }}>
            <RotateCcw style={{ width: 14, height: 14 }} /> Đặt lại
          </button>
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <aside style={{
        width: 340, background: '#fafaf8', borderLeft: '2px solid #1a1a1a',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0,
      }}>

        {/* ═══════ ĐIỀU CHỈNH TỐC ĐỘ ═══════ */}
        <div className="card" style={{ margin: 12, marginBottom: 0 }}>
          <div className="card-header">
            <Gauge style={{ width: 15, height: 15 }} />
            Điều chỉnh tốc độ
          </div>
          <div style={{ padding: 12 }}>
            {sceneData?.entities?.map((entity: Entity, idx: number) => (
              <div key={entity.id} style={{ marginBottom: idx < sceneData.entities.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {entity.type === 'car'
                      ? <Car style={{ width: 14, height: 14 }} />
                      : <Bike style={{ width: 14, height: 14 }} />
                    }
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{entity.label}</span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>
                    {speeds[idx]} <span style={{ fontSize: 10, fontWeight: 400, color: '#888' }}>km/h</span>
                  </span>
                </div>
                <input
                  type="range" min="5" max="120"
                  value={speeds[idx]}
                  onChange={(e) => {
                    const s = [...speeds]; s[idx] = Number(e.target.value); setSpeeds(s);
                  }}
                  disabled={isPlaying}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginTop: 2 }}>
                  <span>5 km/h</span>
                  <span style={{ fontWeight: 500, color: '#666' }}>{entity.mass} kg</span>
                  <span>120 km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ PHÂN TÍCH VA CHẠM ═══════ */}
        <div className="card" style={{ margin: 12, marginBottom: 0 }}>
          <div className="card-header">
            <Zap style={{ width: 15, height: 15 }} />
            Phân tích va chạm
          </div>
          <div style={{ padding: 12 }}>
            {/* Severity badge */}
            <div style={{
              background: impactAnalysis.severity.bg,
              border: `2px solid ${impactAnalysis.severity.color}30`,
              borderRadius: 6, padding: '8px 10px', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <ShieldAlert style={{ width: 14, height: 14, color: impactAnalysis.severity.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: impactAnalysis.severity.color }}>
                  {impactAnalysis.severity.level}
                </span>
              </div>
              <p style={{ fontSize: 10, color: '#666', margin: 0 }}>{impactAnalysis.severity.desc}</p>
            </div>

            {/* Delta-V — chỉ số quan trọng nhất */}
            <div style={{
              background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 6,
              padding: '8px 10px', marginBottom: 8,
            }}>
              <div style={{ fontSize: 9, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>
                ΔV — Thay đổi vận tốc sau va chạm
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#888' }}>Xe 1 (Ô tô)</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#4338ca' }}>
                    {impactAnalysis.deltaV1.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400 }}>km/h</span>
                  </div>
                </div>
                <div style={{ width: 1, background: '#c7d2fe' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#888' }}>Xe 2 (Mô tô)</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#4338ca' }}>
                    {impactAnalysis.deltaV2.toFixed(1)} <span style={{ fontSize: 10, fontWeight: 400 }}>km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics grid — 6 ô */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Tổng động năng', value: `${impactAnalysis.totalKE_KJ.toFixed(1)} kJ`, tooltip: 'KE = ½mv²' },
                { label: 'Lực va chạm', value: `${impactAnalysis.impactForceKN.toFixed(1)} kN`, tooltip: `F = √(p₁²+p₂²) / Δt (${(impactAnalysis.deltaT * 1000).toFixed(0)}ms)` },
                { label: 'Động lượng xe 1', value: `${impactAnalysis.p1.toFixed(0)} kg·m/s`, tooltip: 'p = mv' },
                { label: 'Động lượng xe 2', value: `${impactAnalysis.p2.toFixed(0)} kg·m/s`, tooltip: 'p = mv' },
                { label: 'G-force xe 1', value: `${impactAnalysis.gForce1.toFixed(1)} G`, tooltip: 'a / 9.81' },
                { label: 'G-force xe 2', value: `${impactAnalysis.gForce2.toFixed(1)} G`, tooltip: 'a / 9.81' },
              ].map((m, i) => (
                <div key={i} style={{
                  background: '#f5f5f0', border: '1px solid #e5e5e5',
                  borderRadius: 4, padding: '6px 8px',
                }} title={m.tooltip}>
                  <div style={{ fontSize: 9, color: '#888', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{m.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700 }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Ghi chú công thức */}
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#fefce8', borderRadius: 4, border: '1px solid #fde68a' }}>
              <div style={{ fontSize: 9, color: '#92400e', lineHeight: 1.5 }}>
                <strong>Ghi chú:</strong> Lực va chạm tính bằng tổng vector động lượng (vuông góc) chia thời gian va chạm Δt = {(impactAnalysis.deltaT * 1000).toFixed(0)}ms. Delta-V dựa trên mô hình va chạm hoàn toàn không đàn hồi.
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ THIỆT HẠI & BỒI THƯỜNG ═══════ */}
        <div className="card" style={{ margin: 12 }}>
          <div className="card-header">
            <AlertTriangle style={{ width: 15, height: 15 }} />
            Thiệt hại & Bồi thường
          </div>
          <div style={{ padding: 12 }}>
            {damages ? (
              <>
                {/* Tổng thiệt hại */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#fef2f2', border: '2px solid #fecaca', borderRadius: 6,
                  padding: '8px 12px', marginBottom: 10,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                    <DollarSign style={{ width: 14, height: 14, color: '#dc2626' }} />
                    Tổng thiệt hại
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                    {formatVND(damages.totalDamage)}
                  </span>
                </div>

                {/* Chi tiết từng mục + căn cứ pháp lý */}
                <div style={{ marginBottom: 10 }}>
                  {damages.items?.map((item: DamageItem, i: number) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      padding: '7px 0',
                      borderBottom: i < damages.items.length - 1 ? '1px solid #eee' : 'none',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#333' }}>{item.category}</div>
                        <div style={{ fontSize: 9, color: '#999', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                          <BookOpen style={{ width: 9, height: 9 }} />
                          {item.legalBasis}
                        </div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {formatVND(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Phân bổ trách nhiệm (Tỷ lệ lỗi) */}
                {damages.faultRatio && (
                  <div style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6,
                    padding: '10px', marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#334155' }}>
                      <Percent style={{ width: 13, height: 13 }} />
                      Phân bổ trách nhiệm
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{
                        width: `${damages.faultRatio.entityA.percentage}%`,
                        background: '#2563eb',
                        transition: 'width 0.3s',
                      }} />
                      <div style={{
                        width: `${damages.faultRatio.entityB.percentage}%`,
                        background: '#ef4444',
                        transition: 'width 0.3s',
                      }} />
                    </div>

                    {/* Bên A */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb' }} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{damages.faultRatio.entityA.label}</span>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                        {damages.faultRatio.entityA.percentage}%
                      </span>
                    </div>
                    <p style={{ fontSize: 10, color: '#666', margin: '0 0 8px 12px', lineHeight: 1.4 }}>
                      {damages.faultRatio.entityA.reason}
                    </p>

                    {/* Bên B */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{damages.faultRatio.entityB.label}</span>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
                        {damages.faultRatio.entityB.percentage}%
                      </span>
                    </div>
                    <p style={{ fontSize: 10, color: '#666', margin: '0 0 0 12px', lineHeight: 1.4 }}>
                      {damages.faultRatio.entityB.reason}
                    </p>
                  </div>
                )}

                {/* Bồi thường thực tế */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 6,
                  padding: '8px 12px',
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users style={{ width: 13, height: 13 }} />
                      Bồi thường thực tế
                    </div>
                    <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{damages.compensationNote}</div>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                    {formatVND(damages.actualCompensation)}
                  </span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 12, color: '#999' }}>Chưa có dữ liệu thiệt hại.</p>
            )}
          </div>
        </div>
      </aside>
      {/* AI Input Modal */}
      {showInputModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', padding: 24, borderRadius: 12, width: 600, maxWidth: '90vw',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '2px solid #1a1a1a'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap style={{ width: 20, height: 20, color: '#2563eb' }} />
              Phân tích bản án bằng AI (OpenAI)
            </h2>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              Dán nội dung bản án giao thông hoặc thông tin vụ việc vào đây. Hệ thống sẽ tự động trích xuất ngữ cảnh, thông số phương tiện và tính toán mô phỏng 3D vật lý.
            </p>
            <textarea
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              placeholder="Ví dụ: Khoảng 17h40 ngày 29/11/2016, Nguyễn Văn A điều khiển xe ô tô Toyota Vios biển số 97A-04312 lưu thông trên đường Bùi Thị Xuân với vận tốc 36.5km/h. Khi đến ngã tư giao nhau với đường Thái Mại, A không nhường đường nên đã va chạm với xe mô tô do B điều khiển..."
              style={{
                width: '100%', height: 220, padding: 12, borderRadius: 8,
                border: '1px solid #cbd5e1', fontFamily: "'Inter', sans-serif", fontSize: 13,
                resize: 'vertical', marginBottom: 16, boxSizing: 'border-box'
              }}
              disabled={isGenerating}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                onClick={() => setShowInputModal(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#475569' }}
                disabled={isGenerating}
              >
                Hủy
              </button>
              <button 
                onClick={handleGenerate}
                style={{ 
                  padding: '8px 20px', borderRadius: 6, border: 'none', 
                  background: isGenerating ? '#93c5fd' : '#2563eb', color: 'white', 
                  fontWeight: 700, cursor: isGenerating ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Đang xử lý (≈10s)...
                  </>
                ) : (
                  <>Phân tích ngay</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </main>
  );
}
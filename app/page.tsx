'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Trash2, Clock, MapPin, Car, FileText, Zap, Scale, ChevronRight, Edit3, FolderOpen, MonitorPlay } from 'lucide-react';

interface SavedScene {
  id: string;
  name: string;
  savedAt: string;
  caseNumber?: string;
  location?: string;
  time?: string;
  date?: string;
  entityCount: number;
  environmentType?: string;
  data: object;
}

const ENV_LABELS: Record<string, string> = {
  crossroad: 'Ngã tư',
  tjunction: 'Ngã ba',
  straight: 'Đường thẳng',
  roundabout: 'Bùng binh',
  custom: 'Tự lắp ráp',
};

export default function HomePage() {
  const router = useRouter();
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const backgrounds = ['/bg.mp4', '/bg1.mp4'];

  // Load saved scenes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedScenes');
      if (raw) setSavedScenes(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleOpenScene = (scene: SavedScene) => {
    localStorage.setItem('editorScene', JSON.stringify(scene.data));
    router.push('/simulate');
  };

  const handleEditScene = (scene: SavedScene) => {
    localStorage.setItem('editorScene', JSON.stringify(scene.data));
    router.push('/editor');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedScenes.filter(s => s.id !== id);
    setSavedScenes(updated);
    localStorage.setItem('savedScenes', JSON.stringify(updated));
  };

  const handleNewEditor = () => {
    localStorage.removeItem('editorScene');
    router.push('/editor');
  };

  const handleOpenDemo = () => {
    localStorage.removeItem('editorScene');
    router.push('/simulate');
  };

  return (
    <main style={{
      height: '100vh',
      backgroundColor: '#0f0c29',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#fff',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
    }}>
      {/* Background Video */}
      <video key={backgrounds[bgIndex]} autoPlay loop muted playsInline style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.7,
        }}
      >
        <source src={backgrounds[bgIndex]} type="video/mp4" />
      </video>

      {/* Dark gradient overlay to blend with video */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(10,15,25,0.3) 0%, rgba(5,10,20,0.85) 100%)',
      }} />



      
      {/* Background Toggle Button */}
      <button 
        onClick={() => setBgIndex((prev) => (prev + 1) % backgrounds.length)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(34, 211, 238, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          boxShadow: '0 0 15px rgba(34,211,238,0.15)',
          borderRadius: 40,
          padding: '8px 16px',
          color: '#22d3ee',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(34, 211, 238, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(34, 211, 238, 0.1)';
        }}
      >
        <MonitorPlay size={16} /> Đổi nền
      </button>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>


        {/* ══ HEADER ══ */}
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(34, 211, 238, 0.1)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(34, 211, 238, 0.3)', boxShadow: '0 0 15px rgba(34,211,238,0.15)', borderRadius: 40, padding: '6px 18px', marginBottom: 20 }}>
            <Scale size={14} style={{ color: '#22d3ee' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee', letterSpacing: '0.05em' }}>LEGALTECH 3D</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 0 30px rgba(34,211,238,0.3)' }}>
            Mô phỏng Hiện trường
            <br />
            <span style={{ background: 'linear-gradient(90deg, #fff, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tai nạn Giao thông
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
            Hệ thống phân tích vật lý va chạm và mô phỏng 3D phục vụ giám định pháp lý.
          </p>
        </div>

        {/* ══ ACTION CARDS ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 56 }}>
          {/* New Scene */}
          <ActionCard
            icon={<Plus size={24} />}
            iconColor="#06b6d4"
            iconBg="rgba(6, 182, 212, 0.15)"
            title="Tạo hiện trường mới"
            desc="Kéo thả phương tiện, đường xá và cấu hình kịch bản tai nạn tùy chỉnh."
            label="Mở Editor"
            labelColor="#06b6d4"
            onClick={handleNewEditor}
            accent="#06b6d4"
          />
          {/* Demo */}
          <ActionCard
            icon={<Play size={24} />}
            iconColor="#10b981"
            iconBg="rgba(16, 185, 129, 0.15)"
            title="Xem mẫu Demo"
            desc="Mô phỏng vụ án 117/2023/DS-ST — Ngã tư Bùi Thị Xuân, hoàng hôn 17:40."
            label="Xem ngay"
            labelColor="#10b981"
            onClick={handleOpenDemo}
            accent="#10b981"
          />
          {/* AI Import */}
          <ActionCard
            icon={<Zap size={24} />}
            iconColor="#3b82f6"
            iconBg="rgba(59, 130, 246, 0.15)"
            title="Nhập bản án AI"
            desc="Dán văn bản bản án, AI tự động trích xuất và dựng lại hiện trường 3D."
            label="Nhập ngay"
            labelColor="#3b82f6"
            onClick={() => { localStorage.removeItem('editorScene'); router.push('/simulate?openAI=1'); }}
            accent="#3b82f6"
          />
        </div>

        {/* ══ SAVED SCENES ══ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FolderOpen size={18} style={{ color: '#22d3ee' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Kịch bản đã lưu</h2>
              {savedScenes.length > 0 && (
                <span style={{ background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.4)', color: '#22d3ee', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                  {savedScenes.length}
                </span>
              )}
            </div>
          </div>

          {savedScenes.length === 0 ? (
            <EmptyState onNew={handleNewEditor} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {savedScenes.map(scene => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  isHovered={hoveredId === scene.id}
                  onHover={setHoveredId}
                  onOpen={handleOpenScene}
                  onEdit={handleEditScene}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .action-card:hover { transform: translateY(-3px); }
        .scene-card:hover .scene-card-overlay { opacity: 1 !important; }
      `}} />
    </main>
  );
}

// ─── Action Card Component ───────────────────────────────────────────────────
function ActionCard({ icon, iconColor, iconBg, title, desc, label, labelColor, onClick, accent }: {
  icon: React.ReactNode; iconColor: string; iconBg: string;
  title: string; desc: string; label: string; labelColor: string;
  onClick: () => void; accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="action-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${hovered ? accent + '60' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 16, padding: '24px', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.2s ease',
        boxShadow: hovered ? `0 8px 32px ${accent}20` : 'none', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, marginBottom: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#fff' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: labelColor, fontSize: 13, fontWeight: 600 }}>
        {label} <ChevronRight size={14} />
      </div>
    </button>
  );
}

// ─── Scene Card Component ─────────────────────────────────────────────────────
function SceneCard({ scene, isHovered, onHover, onOpen, onEdit, onDelete }: {
  scene: SavedScene; isHovered: boolean;
  onHover: (id: string | null) => void;
  onOpen: (s: SavedScene) => void;
  onEdit: (s: SavedScene) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const saved = new Date(scene.savedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return (
    <div
      className="scene-card"
      onMouseEnter={() => onHover(scene.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: isHovered ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${isHovered ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 16, padding: '20px', cursor: 'pointer',
        transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
        boxShadow: isHovered ? '0 8px 32px rgba(34,211,238,0.15)' : 'none', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={() => onOpen(scene)}
    >
      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isHovered ? 'linear-gradient(90deg, #06b6d4, #10b981)' : 'transparent', transition: 'all 0.3s' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {scene.name}
          </div>
          {scene.caseNumber && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <FileText size={10} /> {scene.caseNumber}
            </div>
          )}
        </div>
        <button
          onClick={(e) => onDelete(scene.id, e)}
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#f87171', flexShrink: 0, marginLeft: 8, transition: 'all 0.15s' }}
          title="Xóa kịch bản"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {scene.location && (
          <Tag icon={<MapPin size={10} />} text={scene.location} />
        )}
        {scene.time && scene.date && (
          <Tag icon={<Clock size={10} />} text={`${scene.time} - ${scene.date}`} />
        )}
        {scene.environmentType && (
          <Tag icon={<Car size={10} />} text={ENV_LABELS[scene.environmentType] || scene.environmentType} />
        )}
        <Tag icon={<Car size={10} />} text={`${scene.entityCount} phương tiện`} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Lưu lúc {saved}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(scene); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#22d3ee', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}
          >
            <Edit3 size={11} /> Chỉnh sửa
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(scene); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#f472b6', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}
          >
            <Play size={11} /> Mô phỏng
          </button>
        </div>
      </div>
    </div>
  );
}

function Tag({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: 'rgba(255,255,255,0.55)', maxWidth: '100%' }}>
      {icon}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{text}</span>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Chưa có kịch bản nào được lưu</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
        Sau khi tạo hiện trường trong Editor, nhấn "Lưu kịch bản" để nó xuất hiện ở đây.
      </div>
      <button onClick={onNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.4)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', color: '#22d3ee', fontSize: 14, fontWeight: 600 }}>
        <Plus size={16} /> Tạo hiện trường đầu tiên
      </button>
    </div>
  );
}
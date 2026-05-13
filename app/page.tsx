'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Trash2, Clock, MapPin, Car, FileText, Zap, Scale, ChevronRight, Edit3, FolderOpen } from 'lucide-react';

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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#fff',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ══ HEADER ══ */}
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 40, padding: '6px 18px', marginBottom: 20 }}>
            <Scale size={14} style={{ color: '#818cf8' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', letterSpacing: '0.05em' }}>LEGALTECH 3D</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Mô phỏng Hiện trường
            <br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Tai nạn Giao thông
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Hệ thống phân tích vật lý va chạm và mô phỏng 3D phục vụ giám định pháp lý.
          </p>
        </div>

        {/* ══ ACTION CARDS ══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 56 }}>
          {/* New Scene */}
          <ActionCard
            icon={<Plus size={24} />}
            iconColor="#6366f1"
            iconBg="rgba(99,102,241,0.15)"
            title="Tạo hiện trường mới"
            desc="Kéo thả phương tiện, đường xá và cấu hình kịch bản tai nạn tùy chỉnh."
            label="Mở Editor"
            labelColor="#6366f1"
            onClick={handleNewEditor}
            accent="#6366f1"
          />
          {/* Demo */}
          <ActionCard
            icon={<Play size={24} />}
            iconColor="#f472b6"
            iconBg="rgba(244,114,182,0.15)"
            title="Xem mẫu Demo"
            desc="Mô phỏng vụ án 117/2023/DS-ST — Ngã tư Bùi Thị Xuân, hoàng hôn 17:40."
            label="Xem ngay"
            labelColor="#f472b6"
            onClick={handleOpenDemo}
            accent="#f472b6"
          />
          {/* AI Import */}
          <ActionCard
            icon={<Zap size={24} />}
            iconColor="#fb923c"
            iconBg="rgba(251,146,60,0.15)"
            title="Nhập bản án AI"
            desc="Dán văn bản bản án, AI tự động trích xuất và dựng lại hiện trường 3D."
            label="Nhập ngay"
            labelColor="#fb923c"
            onClick={() => { localStorage.removeItem('editorScene'); router.push('/simulate?openAI=1'); }}
            accent="#fb923c"
          />
        </div>

        {/* ══ SAVED SCENES ══ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FolderOpen size={18} style={{ color: '#818cf8' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Kịch bản đã lưu</h2>
              {savedScenes.length > 0 && (
                <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
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
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? accent + '50' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, padding: '24px', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.2s ease',
        boxShadow: hovered ? `0 8px 32px ${accent}20` : 'none',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, marginBottom: 16 }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#fff' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>
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
        background: isHovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isHovered ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, padding: '20px', cursor: 'pointer',
        transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
        boxShadow: isHovered ? '0 8px 32px rgba(99,102,241,0.15)' : 'none',
      }}
      onClick={() => onOpen(scene)}
    >
      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: isHovered ? 'linear-gradient(90deg, #6366f1, #f472b6)' : 'transparent', transition: 'all 0.3s' }} />

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
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#818cf8', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}
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
    <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Chưa có kịch bản nào được lưu</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
        Sau khi tạo hiện trường trong Editor, nhấn "Lưu kịch bản" để nó xuất hiện ở đây.
      </div>
      <button onClick={onNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', color: '#818cf8', fontSize: 14, fontWeight: 600 }}>
        <Plus size={16} /> Tạo hiện trường đầu tiên
      </button>
    </div>
  );
}
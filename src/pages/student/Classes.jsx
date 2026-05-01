// ============================================================
//  src/pages/student/Classes.jsx — books grid
//  Routes: /student/classes
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, ProgressRing } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const PALETTE = ['#1E6FD9', '#0891B2', '#16A34A', '#D97706', '#7C3AED', '#DB2777'];
const colorFor = (cls, idx) => cls.color || PALETTE[idx % PALETTE.length];

export default function StudentClasses() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [progressByClass, setProgressByClass] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cd = await authFetch(`${API}/classes`).then(r => r.json());
      const list = cd.classes || [];
      const details = await Promise.all(
        list.map(c => authFetch(`${API}/classes/${c.id}`).then(r => r.json()))
      );
      setClasses(list);

      // Per-class completion %
      const map = {};
      details.forEach((d, i) => {
        const lessons = d.lessons || [];
        const total = lessons.length;
        const done = lessons.filter(l => l.completedSections >= l.totalSections && l.totalSections > 0).length;
        map[list[i].id] = {
          totalLessons: total,
          doneLessons: done,
          pct: total ? Math.round((done / total) * 100) : 0,
        };
      });
      setProgressByClass(map);
    })().finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading classes…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
          My Classes
        </h2>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 'var(--font-small)' }}>
          {classes.length} class{classes.length !== 1 ? 'es' : ''} enrolled · click a book to open
        </p>
      </div>

      {classes.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="book" size={36} color="#94A3B8" />
          <p style={{ color: '#64748B', marginTop: 12 }}>You are not enrolled in any classes yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {classes.map((cls, idx) => {
            const color = colorFor(cls, idx);
            const stats = progressByClass[cls.id] || { totalLessons: 0, doneLessons: 0, pct: 0 };
            return (
              <div
                key={cls.id}
                onClick={() => navigate(`/student/classes/${cls.id}`)}
                style={{
                  borderRadius: 16,
                  border: '1.5px solid #EEF2F7',
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.10)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#EEF2F7';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 4, background: color, borderRadius: '16px 16px 0 0',
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 13,
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}55`,
                  }}>
                    <Icon name="book" size={22} color="#fff" />
                  </div>
                  <div style={{ position: 'relative', width: 48, height: 48 }}>
                    <ProgressRing pct={stats.pct} size={48} stroke={4} color={color} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0F172A' }}>
                      {stats.pct}%
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 'var(--font-h3)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4 }}>
                  {cls.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{cls.teacher_name}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  {stats.doneLessons} of {stats.totalLessons} lessons complete
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

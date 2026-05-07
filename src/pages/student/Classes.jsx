// ============================================================
//  src/pages/student/Classes.jsx — books grid
//  Routes: /student/classes
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const PALETTE = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B', '#FFC800'];
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {classes.map((cls, idx) => {
            const color = colorFor(cls, idx);
            const stats = progressByClass[cls.id] || { totalLessons: 0, doneLessons: 0, pct: 0 };
            return (
              <div
                key={cls.id}
                onClick={() => navigate(`/student/classes/${cls.id}`)}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  border: '2px solid #F0F4FF',
                  cursor: 'pointer',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${color}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,0.06)';
                }}
              >
                {/* Vivid gradient header block */}
                <div style={{
                  height: 148,
                  background: `linear-gradient(145deg, ${color}, ${color}bb)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '0 20px',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 22,
                    background: 'rgba(255,255,255,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Icon name="book" size={36} color="#fff" />
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 900, color: '#fff',
                    textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2,
                  }}>
                    {cls.name}
                  </div>
                </div>

                {/* White body */}
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14, fontWeight: 600 }}>
                    {cls.teacher_name || 'No teacher assigned'}
                  </div>

                  {/* Progress bar + percentage */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 8, background: '#F0F4FF', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${stats.pct}%`, height: '100%',
                        background: color, borderRadius: 4,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color, minWidth: 44, textAlign: 'right' }}>
                      {stats.pct}%
                    </div>
                  </div>

                  <div style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 600 }}>
                    {stats.doneLessons} of {stats.totalLessons} lessons complete
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

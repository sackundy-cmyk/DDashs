// ============================================================
//  src/pages/student/Quizzes.jsx — list of available quizzes
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, Badge, LiftButton } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function statusFor(latest) {
  if (!latest) return { variant: 'not-started', label: 'Not Started' };
  if (latest.pct == null) return { variant: 'in-progress', label: 'In Progress' };
  return { variant: 'complete', label: `Completed ${latest.pct}%` };
}

export default function StudentQuizzes() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API}/quizzes`)
      .then(r => r.json())
      .then(d => setQuizzes(d.quizzes || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
          Quizzes
        </h2>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 'var(--font-small)' }}>
          {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available · unlimited retakes
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div>
      ) : quizzes.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="reports" size={36} color="#94A3B8" />
          <p style={{ color: '#64748B', marginTop: 12 }}>
            No quizzes have been published in your classes yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {quizzes.map((q, idx) => {
            const PALETTE = ['#CE82FF', '#1CB0F6', '#FF9600', '#58CC02', '#FF4B4B', '#FFC800'];
            const color = q.class_color || PALETTE[idx % PALETTE.length];
            const st = statusFor(q.latest_attempt);
            return (
              <div key={q.id} style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '2px solid #F0F4FF',
                boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${color}28`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,0.06)'; }}
              >
                {/* Vivid header */}
                <div style={{
                  height: 100,
                  background: `linear-gradient(145deg, ${color}, ${color}bb)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="reports" size={28} color="#fff" />
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: '14px 18px 18px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4 }}>
                    {q.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 10 }}>{q.class_name}</div>
                  {q.description && (
                    <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 10 }}>{q.description}</div>
                  )}
                  <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
                    <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{q.question_count}</b> questions</div>
                    {q.time_limit_seconds && (
                      <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{Math.round(q.time_limit_seconds / 60)}</b> min</div>
                    )}
                    <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{q.pass_mark}%</b> to pass</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <Badge variant={st.variant} label={st.label} />
                    <LiftButton variant="primary" size="sm" icon="play" onClick={() => navigate(`/student/quiz/${q.id}`)}>
                      {q.latest_attempt ? 'Retake' : 'Start'}
                    </LiftButton>
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

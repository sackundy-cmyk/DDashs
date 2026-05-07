// ============================================================
//  src/pages/teacher/Quizzes.jsx — list / create / manage quizzes
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, Badge, LiftButton } from '../../components/EnhancedUI.jsx';
import QuizBuilderModal from '../../components/modals/QuizBuilderModal.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

export default function TeacherQuizzes() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builder, setBuilder] = useState({ open: false, quizId: null });

  const load = () => {
    setLoading(true);
    authFetch(`${API}/quizzes`)
      .then(r => r.json())
      .then(d => setQuizzes(d.quizzes || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (q) => {
    try {
      const res = await authFetch(`${API}/quizzes/${q.id}/publish`, { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      toast.success(d.published ? 'Published' : 'Unpublished');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const deleteQuiz = async (q) => {
    if (!window.confirm(`Delete quiz "${q.title}"? This cannot be undone.`)) return;
    try {
      const res = await authFetch(`${API}/quizzes/${q.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('Quiz deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
            Quizzes
          </h2>
          <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 'var(--font-small)' }}>
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} · click to edit, "Results" to grade
          </p>
        </div>
        <LiftButton variant="primary" icon="plus" onClick={() => setBuilder({ open: true, quizId: null })}>
          New Quiz
        </LiftButton>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div>
      ) : quizzes.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="reports" size={36} color="#94A3B8" />
          <p style={{ color: '#64748B', marginTop: 12 }}>
            No quizzes yet — click <b>New Quiz</b> to build your first one.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {quizzes.map((q, idx) => {
            const PALETTE = ['#CE82FF', '#1CB0F6', '#FF9600', '#58CC02', '#FF4B4B', '#FFC800'];
            const color = q.class_color || PALETTE[idx % PALETTE.length];
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
                height: 90,
                background: `linear-gradient(145deg, ${color}, ${color}bb)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 18px',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="reports" size={26} color="#fff" />
                </div>
                <Badge
                  variant={q.published ? 'complete' : 'not-started'}
                  label={q.published ? 'Published' : 'Draft'}
                />
              </div>
              {/* Body */}
              <div style={{ padding: '14px 18px 18px' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {q.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 10 }}>{q.class_name}</div>
                {q.description && (
                  <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 10 }}>{q.description}</div>
                )}
                <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
                  <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{q.question_count}</b> questions</div>
                  <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{q.attempt_count || 0}</b> attempts</div>
                  {q.time_limit_seconds && (
                    <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{Math.round(q.time_limit_seconds / 60)}</b> min</div>
                  )}
                  <div><b style={{ color: '#0F172A', fontWeight: 800 }}>{q.pass_mark}%</b> pass</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <LiftButton variant="secondary" size="sm" icon="edit" onClick={() => setBuilder({ open: true, quizId: q.id })}>
                    Edit
                  </LiftButton>
                  <LiftButton variant="secondary" size="sm" icon="chart" onClick={() => navigate(`/teacher/quizzes/${q.id}/results`)}>
                    Results
                  </LiftButton>
                  <LiftButton variant={q.published ? 'ghost' : 'success'} size="sm" onClick={() => togglePublish(q)}>
                    {q.published ? 'Unpublish' : 'Publish'}
                  </LiftButton>
                  <LiftButton variant="danger" size="sm" icon="trash" onClick={() => deleteQuiz(q)} style={{ marginLeft: 'auto' }}>
                    Delete
                  </LiftButton>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      <QuizBuilderModal
        open={builder.open}
        quizId={builder.quizId}
        onClose={() => setBuilder({ open: false, quizId: null })}
        onSaved={load}
      />
    </DashboardLayout>
  );
}

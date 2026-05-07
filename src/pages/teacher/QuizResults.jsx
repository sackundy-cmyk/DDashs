// ============================================================
//  src/pages/teacher/QuizResults.jsx — per-attempt results table
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, Badge, Avatar } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

export default function QuizResults() {
  const { quizId } = useParams();
  const { authFetch } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/quizzes/${quizId}`).then(r => r.json()),
      authFetch(`${API}/quizzes/${quizId}/attempts`).then(r => r.json()),
    ]).then(([quizData, attemptsData]) => {
      setQuiz(quizData.quiz);
      setQuestions(quizData.questions || []);
      setAttempts(attemptsData.attempts || []);
    }).finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return (
    <DashboardLayout><div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div></DashboardLayout>
  );
  if (!quiz) return (
    <DashboardLayout><div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Quiz not found.</div></DashboardLayout>
  );

  const passMark = quiz.pass_mark ?? 60;
  const avg = attempts.length
    ? Math.round(attempts.reduce((a, x) => a + (x.pct || 0), 0) / attempts.length)
    : 0;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 8, fontSize: 13, color: '#64748B' }}>
        <Link to="/teacher/quizzes" style={{ color: '#1E6FD9', fontWeight: 700, textDecoration: 'none' }}>Quizzes</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ fontWeight: 600 }}>{quiz.title}</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
          {quiz.title}
        </h2>
        <div style={{ fontSize: 'var(--font-small)', color: '#64748B', marginTop: 4 }}>
          {quiz.class_name} · {questions.length} questions · pass mark {passMark}%
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Stat label="Total attempts" value={attempts.length} color="#1E6FD9" />
        <Stat label="Class average"  value={`${avg}%`}        color="#0891B2" />
        <Stat label="Pass rate"      value={`${attempts.length ? Math.round(attempts.filter(a => (a.pct || 0) >= passMark).length / attempts.length * 100) : 0}%`} color="#16A34A" />
      </div>

      {attempts.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="reports" size={36} color="#94A3B8" />
          <p style={{ color: '#64748B', marginTop: 12 }}>No submitted attempts yet.</p>
        </div>
      ) : (
        <div className={s.card} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #EEF2F7', fontWeight: 800, color: '#0F172A' }}>
            All attempts ({attempts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {attempts.map((a) => {
              const pass = (a.pct || 0) >= passMark;
              const isOpen = expanded === a.id;
              const responses = (() => { try { return JSON.parse(a.responses || '[]'); } catch { return []; } })();
              return (
                <div key={a.id}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : a.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 18px', borderTop: '1px solid #F1F5F9',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Avatar name={a.student_name} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{a.student_name}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B' }}>{a.student_email}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', minWidth: 120, textAlign: 'right' }}>
                      {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: pass ? '#16A34A' : '#DC2626', minWidth: 60, textAlign: 'right' }}>
                      {a.pct ?? 0}%
                    </div>
                    <Badge variant={pass ? 'complete' : 'needs-help'} label={pass ? 'Pass' : 'Fail'} />
                    <Icon name={isOpen ? 'chevron_up' : 'chevron_down'} size={14} color="#64748B" />
                  </div>
                  {isOpen && (
                    <div style={{ background: '#F8FAFC', padding: '12px 18px', borderTop: '1px solid #EEF2F7' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
                        Per-question breakdown
                      </div>
                      {questions.map((q, idx) => {
                        const r = responses.find(x => Number(x.question_id) === q.id);
                        return (
                          <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: '1px dashed #E2E8F0' }}>
                            <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: '#64748B' }}>Q{idx + 1}</div>
                            <div style={{ flex: 1, fontSize: 12.5, color: '#0F172A' }}>{q.prompt}</div>
                            {r ? (
                              r.correct
                                ? <Badge variant="complete" label="Correct" />
                                : <Badge variant="needs-help" label="Wrong" />
                            ) : (
                              <Badge variant="not-started" label="Skipped" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 140,
      background: '#FFFFFF',
      border: '1px solid #EEF2F7',
      borderRadius: 14,
      padding: '14px 18px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
      <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

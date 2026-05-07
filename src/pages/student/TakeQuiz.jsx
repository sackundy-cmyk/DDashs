// ============================================================
//  src/pages/student/TakeQuiz.jsx — student takes a quiz
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, Badge, LiftButton } from '../../components/EnhancedUI.jsx';
import { LblCircle } from '../../components/SharedComponents.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { DigitDropZone, DigitPalette } from '../../components/interactions/DigitComponents.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function TakeQuiz() {
  const { quizId } = useParams();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});           // { questionId: response }
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittedRef = useRef(false);

  // Load quiz + start an attempt
  useEffect(() => {
    (async () => {
      try {
        const qData = await authFetch(`${API}/quizzes/${quizId}`).then(r => r.json());
        if (qData.error) throw new Error(qData.error);
        setQuiz(qData.quiz);
        setQuestions(qData.questions || []);

        const aData = await authFetch(`${API}/quizzes/${quizId}/attempts`, { method: 'POST' }).then(r => r.json());
        if (aData.error) throw new Error(aData.error);
        setAttemptId(aData.attemptId);

        if (qData.quiz.time_limit_seconds) {
          setSecondsLeft(qData.quiz.time_limit_seconds);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft == null || result) return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, result]);

  const setResponse = (questionId, response) => {
    setResponses(r => ({ ...r, [questionId]: response }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submittedRef.current) return;
    if (!autoSubmit) {
      const unanswered = questions.filter(q => responses[q.id] === undefined).length;
      if (unanswered > 0) {
        if (!window.confirm(`${unanswered} question${unanswered === 1 ? '' : 's'} unanswered. Submit anyway?`)) return;
      }
    }
    submittedRef.current = true;
    setSubmitting(true);
    try {
      // Normalize: digit answers are arrays in UI, but server expects a string.
      const payload = {
        responses: questions.map(q => {
          let r = responses[q.id];
          if (q.type === 'digit' && Array.isArray(r)) r = r.join('');
          return { question_id: q.id, response: r };
        }),
      };
      const res = await authFetch(`${API}/quizzes/${quizId}/attempts/${attemptId}/submit`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setResult(data);
    } catch (err) {
      toast.error(err.message);
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <DashboardLayout><div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div></DashboardLayout>
  );
  if (!quiz) return (
    <DashboardLayout><div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Quiz not found.</div></DashboardLayout>
  );

  // ── Results screen ────────────────────────────────────────
  if (result) {
    const passMark = quiz.pass_mark ?? 60;
    const pass = (result.pct || 0) >= passMark;
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            background: pass ? 'linear-gradient(135deg, #16A34A, #15803D)' : 'linear-gradient(135deg, #DC2626, #B91C1C)',
            color: '#fff', borderRadius: 18, padding: '32px 28px', textAlign: 'center', marginBottom: 18,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
              {pass ? 'Passed' : 'Try again'}
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, marginTop: 6, letterSpacing: '-0.04em' }}>
              {result.pct}%
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              {result.score} / {result.maxScore} points · pass mark {passMark}%
            </div>
          </div>

          <div className={s.card} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A', marginBottom: 10 }}>
              Per-question breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.map((q, idx) => {
                const r = result.graded.find(x => Number(x.question_id) === q.id);
                return (
                  <div key={q.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: r?.correct ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${r?.correct ? '#BBF7D0' : '#FECACA'}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: r?.correct ? '#166534' : '#B91C1C', minWidth: 24 }}>Q{idx + 1}</div>
                    <div style={{ flex: 1, fontSize: 13, color: '#0F172A' }}>{q.prompt}</div>
                    {r?.correct
                      ? <Badge variant="complete" label="Correct" />
                      : <Badge variant="needs-help" label="Wrong" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <LiftButton variant="primary" icon="play" onClick={() => window.location.reload()}>
              Retake
            </LiftButton>
            <LiftButton variant="secondary" icon="arrow_left" onClick={() => navigate('/student/quizzes')}>
              Back to Quizzes
            </LiftButton>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Take screen ───────────────────────────────────────────
  return (
    <DashboardLayout>
      <div style={{ marginBottom: 8, fontSize: 13, color: '#64748B' }}>
        <Link to="/student/quizzes" style={{ color: '#1E6FD9', fontWeight: 700, textDecoration: 'none' }}>Quizzes</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ fontWeight: 600 }}>{quiz.title}</span>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        marginBottom: 18, flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
            {quiz.title}
          </h2>
          <div style={{ fontSize: 'var(--font-small)', color: '#64748B', marginTop: 4 }}>
            {quiz.class_name} · {questions.length} questions · pass mark {quiz.pass_mark}%
          </div>
        </div>
        {secondsLeft != null && (
          <div style={{
            background: secondsLeft < 60 ? '#FEE2E2' : '#EEF2FF',
            color: secondsLeft < 60 ? '#B91C1C' : '#1E40AF',
            padding: '10px 16px', borderRadius: 12, fontWeight: 800, fontSize: 18,
            letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
          }}>
            ⏱ {fmtTime(secondsLeft)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, idx) => (
          <div key={q.id} className={s.card} style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <LblCircle letter={String(idx + 1)} />
              <div style={{ flex: 1, fontSize: 'var(--font-h3)', fontWeight: 700, color: '#0F172A', lineHeight: 1.4 }}>
                {q.prompt}
              </div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {q.points || 1} pt
              </div>
            </div>
            <QuestionInput
              question={q}
              value={responses[q.id]}
              onChange={(v) => setResponse(q.id, v)}
            />
          </div>
        ))}
      </div>

      <div style={{
        position: 'sticky', bottom: 0, background: '#FFFFFF',
        marginTop: 18, padding: '14px 0', borderTop: '1px solid #EEF2F7',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 13, color: '#64748B' }}>
          {Object.keys(responses).length} of {questions.length} answered
        </div>
        <LiftButton variant="success" icon="check" onClick={() => handleSubmit(false)} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Quiz'}
        </LiftButton>
      </div>
    </DashboardLayout>
  );
}

function QuestionInput({ question, value, onChange }) {
  const cfg = question.config || {};

  if (question.type === 'mcq') {
    const opts = (cfg.options || []).map((label, i) => {
      let state = 'default';
      if (value === i) state = 'selected';
      return { id: i, label, state };
    });
    return <MCQOptions options={opts} onSelect={(id) => onChange(id)} />;
  }

  if (question.type === 'digit') {
    const digits = Array.isArray(value) ? value : [];
    const paletteId = `qz-${question.id}`;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
        <DigitDropZone
          digits={digits}
          onDrop={(d) => {
            if (d === '.' || /^\d$/.test(d) || d.startsWith('digit:')) {
              const ch = d.startsWith('digit:') ? d.slice(6) : d;
              onChange([...digits, ch]);
            } else if (d === 'del') {
              onChange(digits.slice(0, -1));
            }
          }}
          onRemove={(i) => onChange(digits.filter((_, idx) => idx !== i))}
          paletteId={paletteId}
          zoneState="default"
        />
        <DigitPalette paletteId={paletteId} decimal={!!cfg.decimal} />
      </div>
    );
  }

  if (question.type === 'fraction') {
    const v = value || { numerator: '', denominator: '' };
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          value={v.numerator}
          onChange={(e) => onChange({ ...v, numerator: e.target.value === '' ? '' : Number(e.target.value) })}
          style={fracInput}
        />
        <div style={{ width: 80, height: 3, background: '#0F172A', borderRadius: 2 }} />
        <input
          type="number"
          value={v.denominator}
          onChange={(e) => onChange({ ...v, denominator: e.target.value === '' ? '' : Number(e.target.value) })}
          style={fracInput}
        />
      </div>
    );
  }

  if (question.type === 'true-false') {
    return (
      <div style={{ display: 'flex', gap: 10 }}>
        {[true, false].map(b => (
          <button
            key={String(b)}
            onClick={() => onChange(b)}
            style={{
              padding: '12px 28px', fontSize: 16, fontWeight: 800,
              borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font)',
              border: '2px solid',
              borderColor: value === b ? (b ? '#16A34A' : '#DC2626') : '#E2E8F0',
              background: value === b ? (b ? '#DCFCE7' : '#FEE2E2') : '#FFFFFF',
              color: value === b ? (b ? '#166534' : '#B91C1C') : '#475569',
            }}
          >
            {b ? 'True' : 'False'}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

const fracInput = {
  width: 80, padding: '8px 10px', fontSize: 22, fontWeight: 800,
  textAlign: 'center', borderRadius: 8, border: '1.5px solid #CBD5E1',
  fontFamily: 'var(--font)', color: '#0F172A', outline: 'none',
};

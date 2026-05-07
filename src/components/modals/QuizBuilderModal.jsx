// ============================================================
//  QuizBuilderModal — create or edit a quiz with question list
// ============================================================

import { useState, useEffect } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import { Icon, LiftButton } from '../EnhancedUI.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

const TYPE_LABEL = {
  'mcq':        'Multiple choice',
  'digit':      'Digit answer',
  'fraction':   'Fraction',
  'true-false': 'True / false',
};

const blankQuestion = (type = 'mcq') => {
  if (type === 'mcq') return { type, prompt: '', config: { options: ['', '', '', ''], correctIndex: 0 }, points: 1 };
  if (type === 'digit') return { type, prompt: '', config: { answer: '', decimal: false }, points: 1 };
  if (type === 'fraction') return { type, prompt: '', config: { numerator: 1, denominator: 2 }, points: 1 };
  if (type === 'true-false') return { type, prompt: '', config: { correct: true }, points: 1 };
  return { type, prompt: '', config: {}, points: 1 };
};

export default function QuizBuilderModal({ open, onClose, quizId, defaultClassId, onSaved }) {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(defaultClassId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');   // minutes
  const [passMark, setPassMark] = useState(60);
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState([blankQuestion('mcq')]);
  const [saving, setSaving] = useState(false);

  // Load class list
  useEffect(() => {
    if (!open) return;
    authFetch(`${API}/classes`).then(r => r.json()).then(d => {
      setClasses(d.classes || []);
      if (!classId && d.classes?.length) setClassId(d.classes[0].id);
    });
  }, [open]);

  // Load quiz when editing
  useEffect(() => {
    if (!open || !quizId) {
      // reset for new
      if (open && !quizId) {
        setTitle(''); setDescription('');
        setTimeLimit(''); setPassMark(60); setPublished(false);
        setQuestions([blankQuestion('mcq')]);
      }
      return;
    }
    authFetch(`${API}/quizzes/${quizId}`).then(r => r.json()).then(d => {
      const q = d.quiz;
      setClassId(q.class_id);
      setTitle(q.title || '');
      setDescription(q.description || '');
      setTimeLimit(q.time_limit_seconds ? Math.round(q.time_limit_seconds / 60) : '');
      setPassMark(q.pass_mark ?? 60);
      setPublished(!!q.published);
      setQuestions((d.questions || []).map(qq => ({
        type: qq.type, prompt: qq.prompt, config: qq.config, points: qq.points || 1,
      })));
    });
  }, [open, quizId]);

  if (!open) return null;

  const addQuestion = (type = 'mcq') => setQuestions(qs => [...qs, blankQuestion(type)]);
  const removeQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));
  const moveQuestion = (i, dir) => setQuestions(qs => {
    const next = [...qs];
    const j = i + dir;
    if (j < 0 || j >= next.length) return next;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const updateQuestion = (i, patch) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  const updateConfig = (i, patch) => setQuestions(qs => qs.map((q, idx) =>
    idx === i ? { ...q, config: { ...q.config, ...patch } } : q
  ));
  const changeType = (i, newType) => setQuestions(qs => qs.map((q, idx) =>
    idx === i ? blankQuestion(newType) : q
  ));

  const handleSave = async (publishOverride) => {
    if (!classId) { toast.error('Pick a class'); return; }
    if (!title.trim()) { toast.error('Title required'); return; }
    if (questions.length === 0) { toast.error('Add at least one question'); return; }
    for (const q of questions) {
      if (!q.prompt?.trim()) { toast.error('Each question needs a prompt'); return; }
      if (q.type === 'mcq' && (!q.config.options?.length || q.config.options.some(o => !o.trim()))) {
        toast.error('Each MCQ option must have text'); return;
      }
      if (q.type === 'digit' && !String(q.config.answer ?? '').trim()) {
        toast.error('Each digit question needs an answer'); return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        classId,
        title: title.trim(),
        description: description.trim() || null,
        timeLimit: timeLimit ? Number(timeLimit) * 60 : null,
        passMark: Number(passMark) || 60,
        published: publishOverride != null ? publishOverride : published,
        questions,
      };
      let res;
      if (quizId) {
        res = await authFetch(`${API}/quizzes/${quizId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        res = await authFetch(`${API}/quizzes`, { method: 'POST', body: JSON.stringify(payload) });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success(quizId ? 'Quiz updated' : 'Quiz created');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title={quizId ? 'Edit quiz' : 'New quiz'}
      width={760}
      footer={
        <>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={() => handleSave(false)} disabled={saving} style={btnSecondary}>Save as draft</button>
          <button onClick={() => handleSave(true)}  disabled={saving} style={btnPrimary}>Save & publish</button>
        </>
      }
    >
      {/* Section 1 — basics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Field label="Title">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Decimals — Unit 1 quiz" style={inputStyle} />
        </Field>
        <Field label="Class">
          <select value={classId || ''} onChange={e => setClassId(Number(e.target.value))} style={inputStyle}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Description (optional)" full>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={2} style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
        </Field>
        <Field label="Time limit (minutes, blank = untimed)">
          <input type="number" min="0" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Pass mark (%)">
          <input type="number" min="0" max="100" value={passMark} onChange={e => setPassMark(e.target.value)} style={inputStyle} />
        </Field>
      </div>

      {/* Section 2 — questions */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
            Questions ({questions.length})
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select onChange={e => { addQuestion(e.target.value); e.target.value = 'add'; }} value="add"
              style={{ ...inputStyle, padding: '6px 10px', fontSize: 12 }}>
              <option value="add">+ Add question…</option>
              <option value="mcq">Multiple choice</option>
              <option value="digit">Digit answer</option>
              <option value="fraction">Fraction</option>
              <option value="true-false">True / false</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q, i) => (
            <QuestionEditor
              key={i}
              index={i}
              question={q}
              onChangeType={(t) => changeType(i, t)}
              onUpdate={(patch) => updateQuestion(i, patch)}
              onUpdateConfig={(patch) => updateConfig(i, patch)}
              onMove={(dir) => moveQuestion(i, dir)}
              onRemove={() => removeQuestion(i)}
              canMoveUp={i > 0}
              canMoveDown={i < questions.length - 1}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / span 2' : 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function QuestionEditor({ index, question, onChangeType, onUpdate, onUpdateConfig, onMove, onRemove, canMoveUp, canMoveDown }) {
  const cfg = question.config || {};
  return (
    <div style={{
      border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 12,
      background: '#fafbfc',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: '#1E6FD9',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800,
        }}>{index + 1}</div>
        <select value={question.type} onChange={e => onChangeType(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12 }}>
          {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input
          type="number" min="1" value={question.points || 1}
          onChange={e => onUpdate({ points: Number(e.target.value) || 1 })}
          style={{ ...inputStyle, width: 70, padding: '6px 10px', fontSize: 12 }}
          title="Points"
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={() => onMove(-1)} disabled={!canMoveUp} style={iconBtn} title="Move up">↑</button>
          <button onClick={() => onMove(1)} disabled={!canMoveDown} style={iconBtn} title="Move down">↓</button>
          <button onClick={onRemove} style={{ ...iconBtn, color: '#b91c1c' }} title="Remove"><Icon name="trash" size={13} color="currentColor"/></button>
        </div>
      </div>

      <textarea
        value={question.prompt}
        onChange={e => onUpdate({ prompt: e.target.value })}
        rows={2}
        placeholder="Question prompt…"
        style={{ ...inputStyle, marginBottom: 10, resize: 'vertical', minHeight: 50 }}
      />

      {question.type === 'mcq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(cfg.options || []).map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="radio"
                checked={cfg.correctIndex === i}
                onChange={() => onUpdateConfig({ correctIndex: i })}
              />
              <input
                value={opt}
                onChange={e => {
                  const opts = [...cfg.options];
                  opts[i] = e.target.value;
                  onUpdateConfig({ options: opts });
                }}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => onUpdateConfig({ options: cfg.options.filter((_, idx) => idx !== i), correctIndex: 0 })}
                style={iconBtn} title="Remove option"
              >×</button>
            </div>
          ))}
          <button
            onClick={() => onUpdateConfig({ options: [...(cfg.options || []), ''] })}
            style={{ ...btnGhost, alignSelf: 'flex-start', padding: '4px 12px', fontSize: 12 }}
          >+ Add option</button>
        </div>
      )}

      {question.type === 'digit' && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={cfg.answer ?? ''}
            onChange={e => onUpdateConfig({ answer: e.target.value })}
            placeholder="Correct answer (e.g. 1234 or 1.25)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
            <input
              type="checkbox" checked={!!cfg.decimal}
              onChange={e => onUpdateConfig({ decimal: e.target.checked })}
            />
            Decimal
          </label>
        </div>
      )}

      {question.type === 'fraction' && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="number" value={cfg.numerator ?? ''} placeholder="Numerator"
            onChange={e => onUpdateConfig({ numerator: Number(e.target.value) })}
            style={{ ...inputStyle, width: 120 }}
          />
          <span style={{ fontSize: 18, fontWeight: 800 }}>/</span>
          <input
            type="number" value={cfg.denominator ?? ''} placeholder="Denominator"
            onChange={e => onUpdateConfig({ denominator: Number(e.target.value) })}
            style={{ ...inputStyle, width: 120 }}
          />
        </div>
      )}

      {question.type === 'true-false' && (
        <div style={{ display: 'flex', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: cfg.correct ? '#16a34a' : '#475569' }}>
            <input type="radio" checked={cfg.correct === true} onChange={() => onUpdateConfig({ correct: true })} />
            True
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: cfg.correct === false ? '#dc2626' : '#475569' }}>
            <input type="radio" checked={cfg.correct === false} onChange={() => onUpdateConfig({ correct: false })} />
            False
          </label>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontFamily: 'var(--font)', fontSize: 13,
  outline: 'none', background: '#fff', color: '#0f172a',
};
const btnPrimary = { padding: '9px 16px', borderRadius: 8, border: 'none', background: '#1E6FD9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' };
const btnSecondary = { padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#0f172a', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' };
const btnGhost = { padding: '9px 16px', borderRadius: 8, border: 'none', background: 'transparent', color: '#475569', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' };
const iconBtn = { padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#475569', fontFamily: 'var(--font)' };

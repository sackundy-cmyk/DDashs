// ============================================================
//  lessons/unit6/L2_AngleTypes.jsx
//  Unit 6 · Lesson 2: Types of Angles
//  S1: Classify 8 angles as acute / right / obtuse (MCQ)
//  S2: Find missing angles in triangles & quadrilaterals (digit drag)
//  S3: Find angles on a straight line (supplementary, digit drag)
// ============================================================

import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, NumChip, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Angle SVG helper ─────────────────────────────────────────
function AngleSVG({ deg, size=140 }) {
  const cx=size/2, cy=size*0.7, r1=size*0.5;
  const toRad = d => d*Math.PI/180;
  const x2=cx+r1*Math.cos(toRad(180)); // baseline left
  const x3=cx+r1*Math.cos(toRad(180-deg)); // second ray
  const y3=cy-r1*Math.sin(toRad(180-deg));
  const arcR=size*0.18;
  const large=deg>180?1:0;
  const ax=cx+arcR*Math.cos(toRad(180-deg/2));
  const ay=cy-arcR*Math.sin(toRad(180-deg/2));
  const isRight=Math.abs(deg-90)<1;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* baseline */}
      <line x1={cx} y1={cy} x2={cx+r1} y2={cy} stroke="#C2410C" strokeWidth={2.5}/>
      {/* second ray */}
      <line x1={cx} y1={cy} x2={x3} y2={y3} stroke="#C2410C" strokeWidth={2.5}/>
      {/* arc or square */}
      {isRight
        ? <rect x={cx} y={cy-18} width={18} height={18} fill="none" stroke="#C2410C" strokeWidth={2}/>
        : <path d={`M${cx+arcR},${cy} A${arcR},${arcR} 0 ${large} 0 ${ax},${ay}`} fill="none" stroke="#C2410C" strokeWidth={2}/>
      }
    </svg>
  );
}

const ANGLE_Q1 = [
  { lbl:'a', deg:130, answer:'obtuse' },
  { lbl:'b', deg:90,  answer:'right angle' },
  { lbl:'c', deg:55,  answer:'acute' },
  { lbl:'d', deg:115, answer:'obtuse' },
  { lbl:'e', deg:40,  answer:'acute' },
  { lbl:'f', deg:105, answer:'obtuse' },
  { lbl:'g', deg:35,  answer:'acute' },
  { lbl:'h', deg:25,  answer:'acute' },
];
const ANGLE_TYPES = ['acute','right angle','obtuse'];

// ── Q2: Missing angles in triangles / quadrilaterals ─────────
const MISSING_ANGLES = [
  { lbl:'a', shape:'triangle',       known:[50,50],    missing:80,  rule:'Angles in a triangle sum to 180°' },
  { lbl:'b', shape:'triangle',       known:[50,40],    missing:90,  rule:'Angles in a triangle sum to 180°' },
  { lbl:'c', shape:'quadrilateral',  known:[38,90,100],missing:132, rule:'Angles in a quadrilateral sum to 360°' },
  { lbl:'d', shape:'triangle',       known:[19,127],   missing:34,  rule:'Angles in a triangle sum to 180°' },
  { lbl:'e', shape:'triangle',       known:[106,32],   missing:42,  rule:'Angles in a triangle sum to 180°' },
  { lbl:'f', shape:'triangle',       known:[37,37],    missing:106, rule:'Angles in a triangle sum to 180°' },
];

function ShapeSVG({ shape, known }) {
  if (shape==='triangle') {
    return (
      <svg viewBox="0 0 140 100" width={140} height={100}>
        <polygon points="70,8 130,90 10,90" fill="#EEF4FF" stroke="#7C3AED" strokeWidth={2}/>
        <text x={70} y={22} textAnchor="middle" fontSize={14} fill="#1E293B" fontWeight={700}>{known[1]}°</text>
        <text x={22} y={88} textAnchor="middle" fontSize={14} fill="#1E293B" fontWeight={700}>{known[0]}°</text>
        <text x={118} y={88} textAnchor="middle" fontSize={16} fill="#DC2626" fontWeight={900}>?</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 140 110" width={140} height={110}>
      <polygon points="25,20 115,20 130,90 10,90" fill="#EEF4FF" stroke="#7C3AED" strokeWidth={2}/>
      <text x={25} y={38} textAnchor="middle" fontSize={13} fill="#1E293B" fontWeight={700}>{known[0]}°</text>
      <text x={115} y={18} textAnchor="middle" fontSize={13} fill="#1E293B" fontWeight={700}>{known[1]}°</text>
      <text x={130} y={88} textAnchor="middle" fontSize={13} fill="#1E293B" fontWeight={700}>{known[2]}°</text>
      <text x={10} y={90} textAnchor="middle" fontSize={16} fill="#DC2626" fontWeight={900}>?</text>
    </svg>
  );
}

// ── Q3: Angles on a straight line ────────────────────────────
const STRAIGHT_ANGLES = [
  { lbl:'a', known:38,  missing:142 },
  { lbl:'b', known:95,  missing:85 },
  { lbl:'c', known:52,  missing:128 },
  { lbl:'d', known:112, missing:68 },
  { lbl:'e', known:139, missing:41 },
];

function StraightLineSVG({ known }) {
  return (
    <svg viewBox="0 0 200 100" width={200} height={100}>
      <line x1={10} y1={68} x2={190} y2={68} stroke="#C2410C" strokeWidth={2.5}/>
      <line x1={100} y1={68} x2={138} y2={18} stroke="#C2410C" strokeWidth={2.5}/>
      <text x={130} y={62} fontSize={15} fontWeight={700} fill="#1E293B">{known}°</text>
      <text x={56} y={55} fontSize={15} fontWeight={700} fill="#DC2626">?</text>
      <path d={`M ${100+28} ${68} A 28 28 0 0 0 ${100+28*Math.cos(known*Math.PI/180)} ${68-28*Math.sin(known*Math.PI/180)}`} fill="none" stroke="#C2410C" strokeWidth={2}/>
    </svg>
  );
}

// ── drop handler factory ──────────────────────────────────────
function makeDropHandler(setter, lbl, locked) {
  return (data) => {
    if (locked) return;
    setter(prev => {
      const cur = prev[lbl] || [];
      if (data === 'del') return { ...prev, [lbl]: cur.slice(0, -1) };
      if (data.startsWith('digit:')) return { ...prev, [lbl]: [...cur, data.slice(6)] };
      return prev;
    });
  };
}

// ── Component ────────────────────────────────────────────────
export default function L2_AngleTypes() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: () => clearDraft?.() });
  const { getAtt, increment } = useAttempts();

  // S1
  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  // S2 — digit arrays per question + zone states
  const s2Ans = state.s2Ans || {}, setS2Ans = setField('s2Ans');
  const s2ZSt = state.s2ZSt || {}, setS2ZSt = setField('s2ZSt');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');
  // S3
  const s3Ans = state.s3Ans || {}, setS3Ans = setField('s3Ans');
  const s3ZSt = state.s3ZSt || {}, setS3ZSt = setField('s3ZSt');
  const s3FB  = state.s3FB  || null, setS3FB  = setField('s3FB');

  const s1Done = prog.isDone('s1');
  const s2Done = prog.isDone('s2');
  const s3Done = prog.isDone('s3');

  function checkS1() {
    increment('s1');
    const att = getAtt('s1') + 1;
    let correct = 0;
    ANGLE_Q1.forEach(q => { if (s1Sel[q.lbl] === q.answer) correct++; });
    const total = ANGLE_Q1.length;
    if (correct === total) {
      setS1FB({ type:'correct', msg:'✓ All correct! Acute < 90°, Right = 90°, Obtuse 90°–180°.' });
      prog.markDone('s1', { correct, total, attempts: att });
    } else if (att >= 3) {
      setS1FB({ type:'hint', msg:'Acute = less than 90°, Right = exactly 90°, Obtuse = between 90° and 180°.' });
      prog.markDone('s1', { correct, total, attempts: att });
    } else {
      setS1FB({ type:'wrong', msg:`${correct}/${total} correct — try again!` });
    }
  }

  function checkS2() {
    increment('s2');
    const att = getAtt('s2') + 1;
    let correct = 0;
    const newZSt = {};
    MISSING_ANGLES.forEach(q => {
      const val = parseInt((s2Ans[q.lbl] || []).join(''));
      const ok = val === q.missing;
      if (ok) correct++;
      newZSt[q.lbl] = ok ? 'correct' : 'wrong';
    });
    const total = MISSING_ANGLES.length;
    if (correct === total) {
      setS2ZSt(newZSt);
      setS2FB({ type:'correct', msg:'✓ All missing angles found! Great use of angle sum rules.' });
      prog.markDone('s2', { correct, total, attempts: att });
    } else if (att >= 3) {
      setS2ZSt(newZSt);
      const hints = MISSING_ANGLES.map(q=>`${q.lbl}) ${q.missing}°`).join(', ');
      setS2FB({ type:'hint', msg:`Answers: ${hints}.` });
      prog.markDone('s2', { correct, total, attempts: att });
    } else {
      setS2ZSt(newZSt);
      setS2FB({ type:'wrong', msg:`${correct}/${total} correct. Triangles sum to 180°, quadrilaterals to 360°.` });
    }
  }

  function checkS3() {
    increment('s3');
    const att = getAtt('s3') + 1;
    let correct = 0;
    const newZSt = {};
    STRAIGHT_ANGLES.forEach(q => {
      const val = parseInt((s3Ans[q.lbl] || []).join(''));
      const ok = val === q.missing;
      if (ok) correct++;
      newZSt[q.lbl] = ok ? 'correct' : 'wrong';
    });
    const total = STRAIGHT_ANGLES.length;
    if (correct === total) {
      setS3ZSt(newZSt);
      setS3FB({ type:'correct', msg:'✓ Correct! Angles on a straight line always sum to 180°.' });
      prog.markDone('s3', { correct, total, attempts: att });
    } else if (att >= 3) {
      setS3ZSt(newZSt);
      const hints = STRAIGHT_ANGLES.map(q=>`${q.lbl}) ${q.missing}°`).join(', ');
      setS3FB({ type:'hint', msg:`Answers: ${hints}. Subtract from 180°.` });
      prog.markDone('s3', { correct, total, attempts: att });
    } else {
      setS3ZSt(newZSt);
      setS3FB({ type:'wrong', msg:`${correct}/${total} correct. Remember: angles on a straight line = 180°.` });
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font)', paddingBottom: 40 }}>
      <Header lessonChip="Unit 6 · Lesson 2" completed={prog.completedCount} total={3} />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px' }}>
        <ObjectiveCard text="Classify angles as acute, right or obtuse. Calculate missing angles in triangles, quadrilaterals and on straight lines." />

        <ExplainPanel title="Angle Rules">
          <RuleBox>
            <strong>Acute</strong> — less than 90° &nbsp;|&nbsp;
            <strong>Right</strong> — exactly 90° &nbsp;|&nbsp;
            <strong>Obtuse</strong> — between 90° and 180°<br/>
            <strong>Triangle</strong> angles sum to <strong>180°</strong><br/>
            <strong>Quadrilateral</strong> angles sum to <strong>360°</strong><br/>
            <strong>Straight line</strong> angles sum to <strong>180°</strong>
          </RuleBox>
        </ExplainPanel>

        <ScoreTrack completed={prog.completedCount} total={3} />

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Classify each angle" tagType="mcq" tagLabel="Tap">
          <QGroup title="Is each angle acute, a right angle, or obtuse?">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))',
              gap: 14, marginBottom: 16,
            }}>
              {ANGLE_Q1.map(q => (
                <div key={q.lbl} style={{
                  background: 'white', border: '2px solid var(--border)',
                  borderRadius: 12, padding: 12, textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <LblCircle letter={q.lbl} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <AngleSVG deg={q.deg} size={140} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {ANGLE_TYPES.map(t => (
                      <button key={t} onClick={() => !s1Done && setS1Sel(p=>({...p,[q.lbl]:t}))} style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                        fontFamily: 'var(--font)', cursor: s1Done ? 'default' : 'pointer',
                        border: `2px solid ${s1Sel[q.lbl]===t ? '#9333EA' : 'var(--border)'}`,
                        background: s1Sel[q.lbl]===t ? '#CE82FF' : 'white',
                        color: s1Sel[q.lbl]===t ? 'white' : 'var(--text)',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <CheckButton disabled={s1Done} onClick={checkS1} />
            {s1FB && <FeedbackBox type={s1FB.type} message={s1FB.msg} />}
          </QGroup>
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={2} title="Missing angles in shapes" tagType="drag" tagLabel="Drag">
          <QGroup title="What is the missing angle? Click a digit, then click the box.">
            <DigitPalette paletteId="s2pal" />
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))',
              gap: 16, marginBottom: 16,
            }}>
              {MISSING_ANGLES.map(q => (
                <div key={q.lbl} style={{
                  background: 'white', border: '2px solid var(--border)',
                  borderRadius: 12, padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <LblCircle letter={q.lbl} />
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{q.rule}</span>
                  </div>
                  <ShapeSVG shape={q.shape} known={q.known} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <span style={{ fontWeight: 700 }}>? =</span>
                    <DigitDropZone
                      paletteId="s2pal"
                      digits={s2Ans[q.lbl] || []}
                      zoneState={s2ZSt[q.lbl] || 'default'}
                      onDrop={makeDropHandler(setS2Ans, q.lbl, s2Done)}
                      onRemove={i => !s2Done && setS2Ans(prev => {
                        const cur = [...(prev[q.lbl] || [])];
                        cur.splice(i, 1);
                        return { ...prev, [q.lbl]: cur };
                      })}
                    />
                    <span style={{ fontWeight: 700 }}>°</span>
                  </div>
                </div>
              ))}
            </div>
            <CheckButton disabled={s2Done} onClick={checkS2} />
            {s2FB && <FeedbackBox type={s2FB.type} message={s2FB.msg} />}
          </QGroup>
        </SectionCard>

        {/* ── Section 3 ── */}
        <SectionCard badge={3} title="Angles on a straight line" tagType="drag" tagLabel="Drag">
          <QGroup title="Calculate the missing angle. Angles on a straight line = 180°.">
            <DigitPalette paletteId="s3pal" />
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
              gap: 16, marginBottom: 16,
            }}>
              {STRAIGHT_ANGLES.map(q => (
                <div key={q.lbl} style={{
                  background: 'white', border: '2px solid var(--border)',
                  borderRadius: 12, padding: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <LblCircle letter={q.lbl} />
                  </div>
                  <StraightLineSVG known={q.known} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <span style={{ fontWeight: 700 }}>? =</span>
                    <DigitDropZone
                      paletteId="s3pal"
                      digits={s3Ans[q.lbl] || []}
                      zoneState={s3ZSt[q.lbl] || 'default'}
                      onDrop={makeDropHandler(setS3Ans, q.lbl, s3Done)}
                      onRemove={i => !s3Done && setS3Ans(prev => {
                        const cur = [...(prev[q.lbl] || [])];
                        cur.splice(i, 1);
                        return { ...prev, [q.lbl]: cur };
                      })}
                    />
                    <span style={{ fontWeight: 700 }}>°</span>
                  </div>
                </div>
              ))}
            </div>
            <CheckButton disabled={s3Done} onClick={checkS3} />
            {s3FB && <FeedbackBox type={s3FB.type} message={s3FB.msg} />}
          </QGroup>
        </SectionCard>

        {prog.allDone && (
          <Summary
            score={prog.completedCount}
            total={3}
            message="You can classify angles and use angle sum rules!"
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
//  lessons/unit6/L11_Circles.jsx
//  Unit 6 · Lesson 11: Circles
//  S1: Label parts of a circle (MCQ — radius/diameter/circumference/chord)
//  S2: Measure diameter and radius from a cm grid (6 circles, digit entry)
// ============================================================

import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── S1: Labelled circle diagram ───────────────────────────────
// Parts labelled A–D on the SVG; student taps the correct name.
const PART_QS = [
  {
    lbl: 'A',
    answer: 'radius',
    opts: ['radius', 'diameter', 'circumference', 'chord'],
    desc: 'Line from centre to edge',
  },
  {
    lbl: 'B',
    answer: 'diameter',
    opts: ['diameter', 'radius', 'chord', 'circumference'],
    desc: 'Line through the centre, edge to edge',
  },
  {
    lbl: 'C',
    answer: 'circumference',
    opts: ['circumference', 'diameter', 'radius', 'chord'],
    desc: 'The perimeter of the circle',
  },
  {
    lbl: 'D',
    answer: 'chord',
    opts: ['chord', 'radius', 'diameter', 'arc'],
    desc: 'Line joining two points on the edge (not through centre)',
  },
];

// SVG circle diagram with 4 labelled parts
function CircleDiagram() {
  const cx = 110, cy = 110, r = 80;
  // chord endpoints (not through centre)
  const chordX1 = cx - r * Math.cos(Math.PI / 5);
  const chordY1 = cy - r * Math.sin(Math.PI / 5);
  const chordX2 = cx + r * Math.cos(Math.PI * 0.85);
  const chordY2 = cy - r * Math.sin(Math.PI * 0.85);
  return (
    <svg viewBox="0 0 220 220" width={200} height={200}>
      {/* Circle outline */}
      <circle cx={cx} cy={cy} r={r} fill="#DBEAFE" stroke="#3B82F6" strokeWidth={3}/>
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={4} fill="#1E293B"/>
      {/* A — radius (centre to top) */}
      <line x1={cx} y1={cy} x2={cx} y2={cy-r} stroke="#7C3AED" strokeWidth={2.5}/>
      <circle cx={cx} cy={cy-r} r={4} fill="#7C3AED"/>
      <text x={cx+6} y={cy-r/2} fontSize={14} fontWeight="800" fill="#7C3AED">A</text>
      {/* B — diameter (left to right) */}
      <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#DC2626" strokeWidth={2.5}/>
      <text x={cx+r+4} y={cy+5} fontSize={14} fontWeight="800" fill="#DC2626">B</text>
      {/* C — circumference arc indicator (top-right arc, curved label) */}
      <path d={`M${cx+r*Math.cos(-0.4)},${cy+r*Math.sin(-0.4)} A${r},${r} 0 0,1 ${cx+r*Math.cos(0.8)},${cy+r*Math.sin(0.8)}`}
        fill="none" stroke="#16A34A" strokeWidth={4} strokeLinecap="round"/>
      <text x={cx+r+5} y={cy-42} fontSize={14} fontWeight="800" fill="#16A34A">C</text>
      {/* D — chord */}
      <line x1={chordX1} y1={chordY1} x2={chordX2} y2={chordY2} stroke="#F97316" strokeWidth={2.5}/>
      <text x={(chordX1+chordX2)/2+4} y={(chordY1+chordY2)/2+16} fontSize={14} fontWeight="800" fill="#F97316">D</text>
    </svg>
  );
}

// ── S2: Circle grid measurements ──────────────────────────────
// 6 circles; student counts grid squares for diameter then enters radius = d/2
const CIRCLES = [
  { lbl:'a', diameter:4, cx:55, cy:55, r:44,  fill:'#DBEAFE', stroke:'#3B82F6' },
  { lbl:'b', diameter:2, cx:55, cy:55, r:22,  fill:'#DCFCE7', stroke:'#16A34A' },
  { lbl:'c', diameter:6, cx:79, cy:79, r:66,  fill:'#FEF9C3', stroke:'#CA8A04' },
  { lbl:'d', diameter:5, cx:67, cy:67, r:55,  fill:'#FCE7F3', stroke:'#DB2777' },
  { lbl:'e', diameter:3, cx:55, cy:55, r:33,  fill:'#F3E8FF', stroke:'#7C3AED' },
  { lbl:'f', diameter:8, cx:100,cy:100,r:88, fill:'#FFEDD5', stroke:'#EA580C' },
];

const CELL = 22; // px per 1 cm

function CircleOnGrid({ circle }) {
  const { cx, cy, r, fill, stroke } = circle;
  const gridW = cx * 2;
  const gridH = cy * 2;
  const cols = Math.ceil(gridW / CELL) + 1;
  const rows = Math.ceil(gridH / CELL) + 1;
  return (
    <svg viewBox={`0 0 ${gridW} ${gridH}`} width={gridW} height={gridH}
      style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid lines */}
      {Array.from({ length: cols }, (_, i) => (
        <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={gridH}
          stroke="#CBD5E1" strokeWidth={0.8}/>
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * CELL} x2={gridW} y2={i * CELL}
          stroke="#CBD5E1" strokeWidth={0.8}/>
      ))}
      {/* Circle */}
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={2.5}/>
      <circle cx={cx} cy={cy} r={3} fill={stroke}/>
      {/* Scale label */}
      <text x={3} y={gridH - 4} fontSize={10} fill="#64748B" fontWeight="700">1 sq = 1 cm</text>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function L11_Circles() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const s2Ans = state.s2Ans || {}, setS2Ans = setField('s2Ans');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');

  const s1Done = prog.isDone('s1');
  const s2Done = prog.isDone('s2');

  function checkS1() {
    increment('s1'); const att = getAtt('s1') + 1;
    let correct = 0;
    PART_QS.forEach(q => { if (s1Sel[q.lbl] === q.answer) correct++; });
    const total = PART_QS.length;
    if (correct === total) {
      setS1FB({ type: 'correct', msg: '✓ All parts of a circle correctly identified!' });
      prog.markDone('s1', { correct, total, attempts: att });
    } else if (att >= 3) {
      setS1FB({ type: 'hint', msg: 'A: radius, B: diameter, C: circumference, D: chord. Diameter = 2 × radius.' });
      prog.markDone('s1', { correct, total, attempts: att });
    } else {
      setS1FB({ type: 'wrong', msg: `${correct}/${total} correct.` });
    }
  }

  function checkS2() {
    increment('s2'); const att = getAtt('s2') + 1;
    let correct = 0, total = 0;
    CIRCLES.forEach(c => {
      total += 2;
      if (parseInt(s2Ans[`${c.lbl}_d`]) === c.diameter) correct++;
      if (parseFloat(s2Ans[`${c.lbl}_r`]) === c.diameter / 2) correct++;
    });
    if (correct === total) {
      setS2FB({ type: 'correct', msg: '✓ All diameters and radii correct! Remember: radius = diameter ÷ 2.' });
      prog.markDone('s2', { correct, total, attempts: att });
    } else if (att >= 3) {
      const hints = CIRCLES.map(c => `${c.lbl}) d=${c.diameter}cm, r=${c.diameter / 2}cm`).join(' | ');
      setS2FB({ type: 'hint', msg: `Answers: ${hints}` });
      prog.markDone('s2', { correct, total, attempts: att });
    } else {
      setS2FB({ type: 'wrong', msg: `${correct}/${total} correct. Count the grid squares across the full width of each circle.` });
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font)', paddingBottom: 40 }}>
      <Header lessonChip="Unit 6 · Lesson 11" completed={prog.completedCount} total={2}/>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px' }}>
        <ObjectiveCard text="Name the parts of a circle. Measure diameter and radius from a grid."/>
        <ExplainPanel title="Circles">
          <RuleBox>
            <strong>Radius</strong> — from centre to edge &nbsp;|&nbsp;
            <strong>Diameter</strong> — through centre, edge to edge (= 2 × radius)<br/>
            <strong>Circumference</strong> — the distance around the circle<br/>
            <strong>Chord</strong> — a line joining two points on the circle (not through centre)
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* S1 */}
        <SectionCard badge={1} title="Parts of a circle" tagType="mcq" tagLabel="Tap">
          <QGroup title="Look at the diagram. Tap the correct name for each labelled part.">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flexShrink: 0 }}>
                <CircleDiagram/>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                {PART_QS.map(q => (
                  <div key={q.lbl} style={{
                    background: 'white', border: '2px solid var(--border)',
                    borderRadius: 12, padding: 12, marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <LblCircle letter={q.lbl}/>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{q.desc}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {q.opts.map(o => (
                        <button key={o} onClick={() => !s1Done && setS1Sel(p => ({ ...p, [q.lbl]: o }))} style={{
                          padding: '5px 12px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                          fontFamily: 'var(--font)', cursor: s1Done ? 'default' : 'pointer',
                          border: `2px solid ${s1Sel[q.lbl] === o ? 'var(--blue)' : 'var(--border)'}`,
                          background: s1Sel[q.lbl] === o ? 'var(--blue-light)' : 'white',
                          color: s1Sel[q.lbl] === o ? 'var(--blue)' : 'var(--text)',
                        }}>{o}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {!s1Done && <CheckButton onClick={checkS1}/>}
            {s1FB && <FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Measure diameter and radius" tagType="drag" tagLabel="Count + Type">
          <QGroup title="Each square = 1 cm. Count the grid squares across each circle to find its diameter, then calculate the radius.">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 20, marginBottom: 16,
            }}>
              {CIRCLES.map(c => (
                <div key={c.lbl} style={{
                  background: 'white', border: '2px solid var(--border)',
                  borderRadius: 14, padding: 14, textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <LblCircle letter={c.lbl}/>
                  </div>
                  <CircleOnGrid circle={c}/>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                    {[['Diameter (cm)', '_d'], ['Radius (cm)', '_r']].map(([label, key]) => (
                      <div key={key}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{label}</p>
                        <input
                          type="number" min={0} max={20} step={0.5}
                          value={s2Ans[`${c.lbl}${key}`] ?? ''}
                          onChange={e => !s2Done && setS2Ans(p => ({ ...p, [`${c.lbl}${key}`]: e.target.value }))}
                          disabled={s2Done}
                          style={{
                            width: '100%', padding: '6px 4px', borderRadius: 9,
                            border: '2px solid var(--border)', fontFamily: 'var(--font)',
                            fontSize: 15, fontWeight: 800, textAlign: 'center',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!s2Done && <CheckButton onClick={checkS2}/>}
            {s2FB && <FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone && <Summary score={prog.completedCount} total={2} message="You know all the parts of a circle and can measure diameter and radius!"/>}
      </div>
    </div>
  );
}

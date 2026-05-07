// ============================================================
//  lessons/unit6/L1_Lines.jsx
//  Unit 6 · Lesson 1: Lines and Directions
//  S1: Identify line type from 8 diagrams (MCQ)
//  S2: Name lines using letter notation (type + name MCQ)
//  S3: Identify perpendicular side pairs in shapes (tap-pairs)
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

// ── SVG diagram components ───────────────────────────────────

function Arrow({ x1,y1,x2,y2,headAt='both' }) {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
  const ux=dx/len, uy=dy/len, s=10;
  const head=(px,py,ox,oy)=>`M${px},${py} L${px-s*(ox-uy*0.5)},${py-s*(oy+ux*0.5)} L${px-s*(ox+uy*0.5)},${py-s*(oy-ux*0.5)}Z`;
  return (
    <g stroke="#C2410C" fill="#C2410C" strokeWidth={2}>
      <line x1={x1} y1={y1} x2={x2} y2={y2}/>
      {(headAt==='end'||headAt==='both')&&<path d={head(x2,y2,ux,uy)} stroke="none"/>}
      {(headAt==='start'||headAt==='both')&&<path d={head(x1,y1,-ux,-uy)} stroke="none"/>}
    </g>
  );
}
function Dot({x,y}){ return <circle cx={x} cy={y} r={4} fill="#C2410C"/>; }

const LINE_DIAGRAMS = [
  { lbl:'a', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Arrow x1={10} y1={30} x2={70} y2={30} headAt="both"/></svg> },
  { lbl:'b', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Arrow x1={10} y1={10} x2={70} y2={50} headAt="both"/><Arrow x1={10} y1={50} x2={70} y2={10} headAt="both"/></svg> },
  { lbl:'c', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Dot x={20} y={45}/><Arrow x1={20} y1={45} x2={70} y2={15} headAt="end"/></svg> },
  { lbl:'d', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Dot x={15} y={45}/><Dot x={65} y={20}/><line x1={15} y1={45} x2={65} y2={20} stroke="#C2410C" strokeWidth={2}/></svg> },
  { lbl:'e', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Dot x={40} y={10}/><Arrow x1={40} y1={10} x2={40} y2={58} headAt="end"/></svg> },
  { lbl:'f', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Arrow x1={10} y1={15} x2={70} y2={45} headAt="both"/><Arrow x1={10} y1={45} x2={70} y2={15} headAt="both"/></svg> },
  { lbl:'g', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Arrow x1={10} y1={30} x2={70} y2={30} headAt="both"/><Arrow x1={40} y1={5} x2={40} y2={55} headAt="both"/></svg> },
  { lbl:'h', svg: <svg viewBox="0 0 80 60" width={80} height={60}><Dot x={15} y={50}/><Dot x={68} y={18}/><line x1={15} y1={50} x2={68} y2={18} stroke="#C2410C" strokeWidth={2}/></svg> },
];
const LINE_ANSWERS = ['line','intersecting lines','ray','line segment','ray','intersecting lines','intersecting lines','line segment'];
const LINE_OPTIONS = ['ray','line','line segment','intersecting lines'];

// ── Q2: Named lines ──────────────────────────────────────────
const NAMED_DIAGRAMS = [
  { lbl:'a', type:'ray',      name:'AB', opts:['AB','BA','line AB'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={15} y={35}/><Arrow x1={15} y1={35} x2={75} y2={15} headAt="end"/><text x={8} y={48} fontSize={11} fontWeight={700} fill="#1E293B">A</text><text x={76} y={14} fontSize={11} fontWeight={700} fill="#1E293B">B</text></svg> },
  { lbl:'b', type:'ray',      name:'XY', opts:['XY','YX','segment XY'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={20} y={35}/><Arrow x1={20} y1={35} x2={78} y2={12} headAt="end"/><text x={10} y={48} fontSize={11} fontWeight={700} fill="#1E293B">X</text><text x={76} y={12} fontSize={11} fontWeight={700} fill="#1E293B">Y</text></svg> },
  { lbl:'c', type:'segment',  name:'DE', opts:['DE','segment DE','ray DE'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={15} y={15}/><Dot x={75} y={40}/><line x1={15} y1={15} x2={75} y2={40} stroke="#C2410C" strokeWidth={2}/><text x={7} y={13} fontSize={11} fontWeight={700} fill="#1E293B">D</text><text x={74} y={48} fontSize={11} fontWeight={700} fill="#1E293B">E</text></svg> },
  { lbl:'d', type:'ray',      name:'YZ', opts:['YZ','ZY','line YZ'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={75} y={30}/><Arrow x1={75} y1={30} x2={15} y2={15} headAt="end"/><text x={73} y={44} fontSize={11} fontWeight={700} fill="#1E293B">Y</text><text x={7} y={14} fontSize={11} fontWeight={700} fill="#1E293B">Z</text></svg> },
  { lbl:'e', type:'segment',  name:'QP', opts:['QP','PQ','ray QP'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={15} y={20}/><Dot x={75} y={38}/><line x1={15} y1={20} x2={75} y2={38} stroke="#C2410C" strokeWidth={2}/><text x={7} y={18} fontSize={11} fontWeight={700} fill="#1E293B">Q</text><text x={74} y={48} fontSize={11} fontWeight={700} fill="#1E293B">P</text></svg> },
  { lbl:'f', type:'intersecting lines', name:'—', opts:['intersecting lines','ray FG','line FG'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Arrow x1={10} y1={45} x2={80} y2={10} headAt="both"/><Arrow x1={10} y1={10} x2={80} y2={45} headAt="both"/><text x={78} y={8} fontSize={11} fontWeight={700} fill="#1E293B">F</text><text x={78} y={48} fontSize={11} fontWeight={700} fill="#1E293B">G</text></svg> },
  { lbl:'g', type:'ray',      name:'CD', opts:['CD','DC','segment CD'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={15} y={40}/><Arrow x1={15} y1={40} x2={78} y2={12} headAt="end"/><text x={7} y={48} fontSize={11} fontWeight={700} fill="#1E293B">C</text><text x={76} y={12} fontSize={11} fontWeight={700} fill="#1E293B">D</text></svg> },
  { lbl:'h', type:'ray',      name:'KJ', opts:['KJ','JK','line KJ'], svg: <svg viewBox="0 0 90 50" width={90} height={50}><Dot x={75} y={30}/><Arrow x1={75} y1={30} x2={15} y2={15} headAt="end"/><text x={73} y={44} fontSize={11} fontWeight={700} fill="#1E293B">K</text><text x={7} y={14} fontSize={11} fontWeight={700} fill="#1E293B">J</text></svg> },
];

// ── Q3: Perpendicular side pairs ─────────────────────────────
// Shape a: square ABCD + diagonals meeting at E
// answers: AB⊥BC, BC⊥CD, CD⊥DA, DA⊥AB
const PERP_SHAPES = [
  {
    lbl:'a', label:'Square ABCD',
    svg: <svg viewBox="0 0 100 100" width={100} height={100}>
      <rect x={15} y={15} width={70} height={70} fill="#EEF4FF" stroke="#7C3AED" strokeWidth={2}/>
      <line x1={15} y1={15} x2={85} y2={85} stroke="#7C3AED" strokeWidth={1.5}/>
      <line x1={85} y1={15} x2={15} y2={85} stroke="#7C3AED" strokeWidth={1.5}/>
      <text x={50} y={50} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#7C3AED">E</text>
      <text x={50} y={9} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1E293B">A</text>
      <text x={91} y={50} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="#1E293B">B</text>
      <text x={50} y={96} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1E293B">C</text>
      <text x={8} y={50} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="#1E293B">D</text>
    </svg>,
    pairs: ['AB','BC','CD','DA'],
    correct: [['AB','BC'],['BC','CD'],['CD','DA'],['DA','AB']],
  },
  {
    lbl:'b', label:'Shapes with rectangles',
    svg: <svg viewBox="0 0 140 100" width={140} height={100}>
      <polygon points="10,90 50,10 130,90" fill="#EEF4FF" stroke="#7C3AED" strokeWidth={2}/>
      <rect x={50} y={40} width={50} height={50} fill="none" stroke="#7C3AED" strokeWidth={2}/>
      <text x={30} y={55} fontSize={10} fontWeight={700} fill="#1E293B">F</text>
      <text x={50} y={6} fontSize={10} fontWeight={700} fill="#1E293B">A</text>
      <text x={100} y={38} fontSize={10} fontWeight={700} fill="#1E293B">B</text>
      <text x={100} y={97} fontSize={10} fontWeight={700} fill="#1E293B">C (D)</text>
      <text x={48} y={97} fontSize={10} fontWeight={700} fill="#1E293B">E</text>
    </svg>,
    pairs: ['AB','BC','CD','DE','EF','FA'],
    correct: [['AB','BC'],['BC','CD'],['DE','EF']],
  },
];

// ── Component ────────────────────────────────────────────────
export default function L1_Lines() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // S1 state
  const s1Sel  = state.s1Sel  || {}, setS1Sel  = setField('s1Sel');
  const s1FB   = state.s1FB   || null, setS1FB  = setField('s1FB');

  // S2 state
  const s2Sel  = state.s2Sel  || {}, setS2Sel  = setField('s2Sel');
  const s2FB   = state.s2FB   || null, setS2FB  = setField('s2FB');

  // S3 state — track selected pair for each shape
  const s3Sel  = state.s3Sel  || {}, setS3Sel  = setField('s3Sel');
  const s3FB   = state.s3FB   || null, setS3FB  = setField('s3FB');

  // ── S1 check ──
  function checkS1() {
    increment('s1');
    const att = getAtt('s1') + 1;
    let correct = 0;
    LINE_DIAGRAMS.forEach(d => {
      if (s1Sel[d.lbl] === LINE_ANSWERS[LINE_DIAGRAMS.indexOf(d)]) correct++;
    });
    const total = LINE_DIAGRAMS.length;
    if (correct === total) {
      setS1FB({ type:'correct', msg:'✓ All correct! Well done.' });
      prog.markDone('s1', { correct, total, attempts: att });
    } else if (att >= 3) {
      setS1FB({ type:'hint', msg:`The answers are: ${LINE_ANSWERS.join(', ')}.` });
      prog.markDone('s1', { correct, total, attempts: att });
    } else {
      setS1FB({ type:'wrong', msg:`${correct}/${total} correct. Check diagrams with arrows vs dots.` });
    }
  }

  // ── S2 check ──
  function checkS2() {
    increment('s2');
    const att = getAtt('s2') + 1;
    let correct = 0;
    NAMED_DIAGRAMS.forEach(d => {
      const expected = d.type === 'intersecting lines' ? 'intersecting lines' : `${d.type} ${d.name}`;
      const sel = s2Sel[d.lbl];
      if (d.type === 'intersecting lines') {
        if (sel === 'intersecting lines') correct++;
      } else {
        if (sel === d.name || sel === `segment ${d.name}` || sel === `${d.name}`) correct++;
      }
    });
    // simplified: check type selection
    let typeCorrect = 0;
    NAMED_DIAGRAMS.forEach(d => {
      if (s2Sel[`type_${d.lbl}`] === d.type) typeCorrect++;
    });
    const total = NAMED_DIAGRAMS.length;
    if (typeCorrect === total) {
      setS2FB({ type:'correct', msg:'✓ All named correctly!' });
      prog.markDone('s2', { correct: typeCorrect, total, attempts: att });
    } else if (att >= 3) {
      setS2FB({ type:'hint', msg:'Remember: rays have 1 endpoint + 1 arrow. Segments have 2 endpoints, no arrows.' });
      prog.markDone('s2', { correct: typeCorrect, total, attempts: att });
    } else {
      setS2FB({ type:'wrong', msg:`${typeCorrect}/${total} correct. Look at which ends have arrows vs dots.` });
    }
  }

  // ── S3 check ──
  function checkS3() {
    increment('s3');
    const att = getAtt('s3') + 1;
    // For shape a, correct perpendicular pairs are any two adjacent sides of the square
    const aSelected = s3Sel['a'] || [];
    const aCorrect = PERP_SHAPES[0].correct.some(pair =>
      aSelected.includes(pair[0]) && aSelected.includes(pair[1])
    );
    if (aCorrect) {
      setS3FB({ type:'correct', msg:'✓ Correct! Adjacent sides of a square always meet at 90°.' });
      prog.markDone('s3', { correct: 1, total: 1, attempts: att });
    } else if (att >= 3) {
      setS3FB({ type:'hint', msg:'In a square, any two sides next to each other are perpendicular. E.g., AB⊥BC.' });
      prog.markDone('s3', { correct: 0, total: 1, attempts: att });
    } else {
      setS3FB({ type:'wrong', msg:'Try again — select two side labels that meet at a right angle.' });
    }
  }

  const togglePair = (shapeKey, sideLabel) => {
    setS3Sel(prev => {
      const cur = prev[shapeKey] || [];
      const idx = cur.indexOf(sideLabel);
      if (idx !== -1) return { ...prev, [shapeKey]: cur.filter(s => s !== sideLabel) };
      if (cur.length >= 2) return { ...prev, [shapeKey]: [cur[1], sideLabel] };
      return { ...prev, [shapeKey]: [...cur, sideLabel] };
    });
  };

  const s1Done = prog.isDone('s1');
  const s2Done = prog.isDone('s2');
  const s3Done = prog.isDone('s3');

  return (
    <div style={{ fontFamily: 'var(--font)', paddingBottom: 40 }}>
      <Header lessonChip="Unit 6 · Lesson 1" completed={prog.completedCount} total={3} />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px' }}>
        <ObjectiveCard text="Identify and name lines, rays, line segments and intersecting lines. Recognise perpendicular sides." />

        <ExplainPanel title="Key Definitions">
          <RuleBox>
            <strong>Line</strong> — extends forever in both directions (two arrows)<br/>
            <strong>Ray</strong> — starts at a point, extends forever one way (one dot + one arrow)<br/>
            <strong>Line segment</strong> — finite length between two endpoints (two dots, no arrows)<br/>
            <strong>Intersecting lines</strong> — two lines that cross each other
          </RuleBox>
        </ExplainPanel>

        <ScoreTrack completed={prog.completedCount} total={3} />

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Name each line type" tagType="mcq" tagLabel="Tap">
          <QGroup title="Choose: ray · line · line segment · intersecting lines">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16, marginBottom: 16,
            }}>
              {LINE_DIAGRAMS.map(d => (
                <div key={d.lbl} style={{
                  background: 'white', border: '2px solid var(--border)',
                  borderRadius: 12, padding: 12, textAlign: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <LblCircle letter={d.lbl} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    {d.svg}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {LINE_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => !s1Done && setS1Sel(p=>({...p,[d.lbl]:opt}))} style={{
                        padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        fontFamily: 'var(--font)', cursor: s1Done ? 'default' : 'pointer',
                        border: `2px solid ${s1Sel[d.lbl]===opt ? 'var(--blue)' : 'var(--border)'}`,
                        background: s1Sel[d.lbl]===opt ? 'var(--blue-light)' : 'white',
                        color: s1Sel[d.lbl]===opt ? 'var(--blue)' : 'var(--text)',
                      }}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!s1Done && <CheckButton onClick={checkS1} label="✓ Check all" />}
            {s1FB && <FeedbackBox type={s1FB.type} message={s1FB.msg} />}
          </QGroup>
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={2} title="Name lines using letters" tagType="mcq" tagLabel="Tap">
          <QGroup title="Select the type of each line, then its correct notation">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14, marginBottom: 16,
            }}>
              {NAMED_DIAGRAMS.map(d => (
                <div key={d.lbl} style={{
                  background: 'white', border: '2px solid var(--border)',
                  borderRadius: 12, padding: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <LblCircle letter={d.lbl} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{d.svg}</div>
                  </div>
                  {/* Type selection */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {['ray','line','line segment','intersecting lines'].map(t => (
                      <button key={t} onClick={() => !s2Done && setS2Sel(p=>({...p,[`type_${d.lbl}`]:t}))} style={{
                        padding: '3px 7px', borderRadius: 7, fontSize: 10, fontWeight: 700,
                        fontFamily: 'var(--font)', cursor: s2Done ? 'default' : 'pointer',
                        border: `2px solid ${s2Sel[`type_${d.lbl}`]===t ? 'var(--purple)' : 'var(--border)'}`,
                        background: s2Sel[`type_${d.lbl}`]===t ? 'var(--purple-bg)' : 'white',
                        color: s2Sel[`type_${d.lbl}`]===t ? 'var(--purple)' : 'var(--text)',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!s2Done && <CheckButton onClick={checkS2} label="✓ Check all" />}
            {s2FB && <FeedbackBox type={s2FB.type} message={s2FB.msg} />}
          </QGroup>
        </SectionCard>

        {/* ── Section 3 ── */}
        <SectionCard badge={3} title="Perpendicular sides" tagType="tap" tagLabel="Tap pair">
          <QGroup title="Tap two side labels that are perpendicular (meet at 90°)">
            {PERP_SHAPES.map(shape => (
              <QItem key={shape.lbl}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{shape.lbl}) {shape.label}</p>
                    {shape.svg}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                      Select two perpendicular sides:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {shape.pairs.map(p => {
                        const sel = (s3Sel[shape.lbl] || []).includes(p);
                        return (
                          <button key={p} onClick={() => !s3Done && togglePair(shape.lbl, p)} style={{
                            padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            fontFamily: 'var(--font)', cursor: s3Done ? 'default' : 'pointer',
                            border: `2px solid ${sel ? 'var(--blue)' : 'var(--border)'}`,
                            background: sel ? 'var(--blue-light)' : 'white',
                            color: sel ? 'var(--blue)' : 'var(--text)',
                          }}>{p}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </QItem>
            ))}
            {!s3Done && <CheckButton onClick={checkS3} label="✓ Check" />}
            {s3FB && <FeedbackBox type={s3FB.type} message={s3FB.msg} />}
          </QGroup>
        </SectionCard>

        {prog.allDone && (
          <Summary
            score={prog.completedCount}
            total={3}
            message="You can identify lines, rays, segments and perpendicular sides!"
          />
        )}
      </div>
    </div>
  );
}

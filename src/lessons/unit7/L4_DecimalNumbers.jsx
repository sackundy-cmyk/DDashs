// ============================================================
//  lessons/unit7/L4_DecimalNumbers.jsx
//  Unit 7 · Lesson 4: Decimal Numbers
//  s1: Read decimals from number lines a & b (digit drag-drop)
//  s2: Read decimals from number lines c & d (digit drag-drop)
//  s3: Order decimals smallest→largest (drag-drop, 4 groups)
//  s4: Round to nearest whole number (digit drag-drop, 6 Qs)
//  s5: Round to nearest tenth (digit drag-drop, 6 Qs)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Number line arrow data ─────────────────────────────────────
const LINE_A = [
  { lbl:'A', val:0.02,  ans:['0','.','0','2'] },
  { lbl:'B', val:0.05,  ans:['0','.','0','5'] },
  { lbl:'C', val:0.07,  ans:['0','.','0','7'] },
  { lbl:'D', val:0.09,  ans:['0','.','0','9'] },
];
const LINE_B = [
  { lbl:'A', val:0.02,  ans:['0','.','0','2'] },
  { lbl:'B', val:0.08,  ans:['0','.','0','8'] },
  { lbl:'C', val:0.13,  ans:['0','.','1','3'] },
  { lbl:'D', val:0.18,  ans:['0','.','1','8'] },
];
const LINE_C = [
  { lbl:'A', val:0.002, ans:['0','.','0','0','2'] },
  { lbl:'B', val:0.005, ans:['0','.','0','0','5'] },
  { lbl:'C', val:0.007, ans:['0','.','0','0','7'] },
  { lbl:'D', val:0.009, ans:['0','.','0','0','9'] },
];
const LINE_D = [
  { lbl:'A', val:0.004, ans:['0','.','0','0','4'] },
  { lbl:'B', val:0.009, ans:['0','.','0','0','9'] },
  { lbl:'C', val:0.014, ans:['0','.','0','1','4'] },
  { lbl:'D', val:0.018, ans:['0','.','0','1','8'] },
];

// pairs: [A,B] and [C,D] per line
const S1_LINES = [
  { key:'a', label:'a',  data:LINE_A, min:0, max:0.1,  step:0.01,  mid:0.05,  palBase:'la' },
  { key:'b', label:'b',  data:LINE_B, min:0, max:0.2,  step:0.01,  mid:0.1,   palBase:'lb' },
];
const S2_LINES = [
  { key:'c', label:'c',  data:LINE_C, min:0, max:0.01, step:0.001, mid:0.005, palBase:'lc' },
  { key:'d', label:'d',  data:LINE_D, min:0, max:0.02, step:0.001, mid:0.01,  palBase:'ld' },
];

// ── Q3 ordering data ───────────────────────────────────────────
const Q3_GROUPS = [
  { lbl:'a', items:['19.407','19.74','19.007','19.9'],
    sorted:['19.007','19.407','19.74','19.9'] },
  { lbl:'b', items:['0.0035','0.033','0.302','0.3302'],
    sorted:['0.0035','0.033','0.302','0.3302'] },
  { lbl:'c', items:['6.445','6.5034','6.3559','6.4412'],
    sorted:['6.3559','6.4412','6.445','6.5034'] },
  { lbl:'d', items:['30.9312','30.9132','30.0913','30.1903'],
    sorted:['30.0913','30.1903','30.9132','30.9312'] },
];

// ── Q4 round to nearest whole ──────────────────────────────────
const Q4 = [
  { lbl:'a', display:'61.39',   ans:'61'  },
  { lbl:'b', display:'8.085',   ans:'8'   },
  { lbl:'c', display:'315.45',  ans:'315' },
  { lbl:'d', display:'35.285',  ans:'35'  },
  { lbl:'e', display:'19.62',   ans:'20'  },
  { lbl:'f', display:'18.096',  ans:'18'  },
];

// ── Q5 round to nearest tenth ──────────────────────────────────
const Q5 = [
  { lbl:'a', display:'36.45',   ans:'36.5'  },
  { lbl:'b', display:'8.214',   ans:'8.2'   },
  { lbl:'c', display:'37.492',  ans:'37.5'  },
  { lbl:'d', display:'26.743',  ans:'26.7'  },
  { lbl:'e', display:'134.264', ans:'134.3' },
  { lbl:'f', display:'37.62',   ans:'37.6'  },
];

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// group an array into chunks of n
function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── SVG Number Line ────────────────────────────────────────────
function NumberLine({ arrows, min, max, step, mid, label }) {
  const W = 700, H = 110, padL = 55, padR = 55;
  const innerW = W - padL - padR;
  const SPAN = max - min;
  const xOf = v => padL + ((v - min) / SPAN) * innerW;

  const ticks = [];
  const count = Math.round(SPAN / step);
  for (let i = 0; i <= count; i++) {
    ticks.push(+(min + i * step).toFixed(10));
  }
  const labeled = [min, mid, max];

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#1E40AF', marginBottom: 4 }}>
        Number line {label}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block', minWidth: W }}>
          {/* track */}
          <line x1={padL - 10} y1={62} x2={W - padR + 10} y2={62} stroke="#1E40AF" strokeWidth="2.5"/>
          {/* arrowhead */}
          <polygon points={`${W-padR+14},62 ${W-padR+2},56 ${W-padR+2},68`} fill="#1E40AF"/>
          {/* ticks */}
          {ticks.map(v => {
            const isLabeled = labeled.some(lv => Math.abs(lv - v) < step * 0.01);
            return (
              <line key={v}
                x1={xOf(v)} y1={isLabeled ? 54 : 58}
                x2={xOf(v)} y2={isLabeled ? 70 : 66}
                stroke="#1E40AF" strokeWidth={isLabeled ? 2 : 1}
              />
            );
          })}
          {/* labels */}
          {labeled.map(v => (
            <text key={v} x={xOf(v)} y={88} textAnchor="middle"
              fontSize="11" fontWeight="800" fill="#1E40AF">
              {v}
            </text>
          ))}
          {/* arrows: letter above, red triangle pointing down */}
          {arrows.map(arrow => (
            <g key={arrow.lbl}>
              <text x={xOf(arrow.val)} y={18} textAnchor="middle"
                fontSize="14" fontWeight="900" fontStyle="italic" fill="#DC2626">
                {arrow.lbl}
              </text>
              <polygon
                points={`${xOf(arrow.val)},52 ${xOf(arrow.val)-7},34 ${xOf(arrow.val)+7},34`}
                fill="#DC2626"/>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── Number display chip used inside question text ──────────────
function NumDisplay({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: '#1E40AF', color: '#fff',
      borderRadius: 8, padding: '2px 14px',
      fontSize: 22, fontWeight: 900,
      margin: '0 4px', lineHeight: 1.4,
      verticalAlign: 'middle', fontFamily: 'monospace',
    }}>
      {children}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
export default function L4_DecimalNumbers() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(5, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── s1 state (lines a & b) ──
  const q1D  = state.q1D  || {}, setQ1D  = setField('q1D');
  const q1St = state.q1St || {}, setQ1St = setField('q1St');
  const q1FB = state.q1FB || {}, setQ1FB = setField('q1FB');

  // ── s2 state (lines c & d) ──
  const q2D  = state.q2D  || {}, setQ2D  = setField('q2D');
  const q2St = state.q2St || {}, setQ2St = setField('q2St');
  const q2FB = state.q2FB || {}, setQ2FB = setField('q2FB');

  // ── s3 state ──
  const [q3Shuffled] = useState(() =>
    Object.fromEntries(Q3_GROUPS.map(g => [g.lbl, shuffle([...g.items])]))
  );
  const q3Slots = state.q3Slots || {}, setQ3Slots = setField('q3Slots');
  const q3St    = state.q3St    || {}, setQ3St    = setField('q3St');
  const q3FB    = state.q3FB    || {}, setQ3FB    = setField('q3FB');

  // ── s4 state ──
  const q4D  = state.q4D  || {}, setQ4D  = setField('q4D');
  const q4St = state.q4St || {}, setQ4St = setField('q4St');
  const q4FB = state.q4FB || {}, setQ4FB = setField('q4FB');

  // ── s5 state ──
  const q5D  = state.q5D  || {}, setQ5D  = setField('q5D');
  const q5St = state.q5St || {}, setQ5St = setField('q5St');
  const q5FB = state.q5FB || {}, setQ5FB = setField('q5FB');

  // ══════════════════════════════════════════════════════════════
  // s1 / s2: shared helpers for number-line sections
  // ══════════════════════════════════════════════════════════════

  function makeNLHandlers(dState, setD, stState, setSt) {
    const drop = (key) => (raw) => {
      if (stState[key] === 'correct') return;
      if (raw === 'del') {
        if (stState[key] === 'wrong') setSt(p => ({ ...p, [key]: 'default' }));
        setD(p => ({ ...p, [key]: (p[key] || []).slice(0, -1) }));
      } else if (raw.startsWith('digit:')) {
        const d = raw.split(':')[1];
        if (stState[key] === 'wrong') setSt(p => ({ ...p, [key]: 'default' }));
        setD(p => ({ ...p, [key]: [...(p[key] || []), d] }));
      }
    };
    const remove = (key) => (idx) => {
      if (stState[key] === 'correct') return;
      if (stState[key] === 'wrong') setSt(p => ({ ...p, [key]: 'default' }));
      setD(p => {
        const a = [...(p[key] || [])];
        a.splice(idx, 1);
        return { ...p, [key]: a };
      });
    };
    return { drop, remove };
  }

  function makeNLCheck(lines, dState, stState, setSt, fbState, setFB, sectionId, markDone, totalArrows) {
    return (pair, lineKey, pi) => {
      const attKey = `${sectionId}_p${pi}`;
      increment(attKey);
      const att = getAtt(attKey) + 1;
      let ok = 0;
      const ns = { ...stState };
      pair.forEach(arrow => {
        const key = `${lineKey}_${arrow.lbl}`;
        const val = (dState[key] || []).join('');
        const correct = val === arrow.ans.join('');
        ns[key] = correct ? 'correct' : 'wrong';
        if (correct) ok++;
      });
      setSt(ns);
      const total = pair.length;
      let fb;
      if (ok === total) fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      else if (att >= 3) fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
      else if (att === 2) fb = { type:'hint', text:`💡 ${ok}/${total} correct. Count each small tick carefully — each one represents the step size shown on the line.` };
      else fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Count the ticks from 0 to find the exact position of each arrow.` };
      const merged = { ...fbState, [pi]: fb };
      setFB(merged);
      if (ok === total) {
        const allDone = [0,1,2,3].every(i => merged[i]?.type === 'correct');
        if (allDone) markDone(sectionId, { correct: totalArrows, total: totalArrows, attempts: att });
      }
    };
  }

  const { drop: q1Drop, remove: q1Remove } = makeNLHandlers(q1D, setQ1D, q1St, setQ1St);
  const checkQ1Pair = makeNLCheck(S1_LINES, q1D, q1St, setQ1St, q1FB, setQ1FB, 's1', prog.markDone, 8);

  const { drop: q2Drop, remove: q2Remove } = makeNLHandlers(q2D, setQ2D, q2St, setQ2St);
  const checkQ2Pair = makeNLCheck(S2_LINES, q2D, q2St, setQ2St, q2FB, setQ2FB, 's2', prog.markDone, 8);

  // ══════════════════════════════════════════════════════════════
  // s3: ordering drag-drop
  // ══════════════════════════════════════════════════════════════

  const q3Drop = (grpLbl, slotIdx) => (rawVal) => {
    setQ3Slots(prev => {
      const grp = { ...(prev[grpLbl] || {}) };
      Object.keys(grp).forEach(k => { if (grp[k] === rawVal) delete grp[k]; });
      grp[slotIdx] = rawVal;
      return { ...prev, [grpLbl]: grp };
    });
  };

  const q3Clear = (grpLbl, slotIdx) => () => {
    setQ3Slots(prev => {
      const grp = { ...(prev[grpLbl] || {}) };
      delete grp[slotIdx];
      return { ...prev, [grpLbl]: grp };
    });
  };

  const checkQ3Group = (grp) => {
    const key = `q3_${grp.lbl}`;
    increment(key);
    const att = getAtt(key) + 1;
    const slots = q3Slots[grp.lbl] || {};
    let ok = 0;
    const ns = {};
    grp.sorted.forEach((correct, idx) => {
      if (slots[idx] === correct) { ns[idx] = 'correct'; ok++; }
      else if (slots[idx] !== undefined) { ns[idx] = 'wrong'; }
    });
    setQ3St(p => ({ ...p, [grp.lbl]: ns }));
    const total = grp.sorted.length;
    let fb;
    if (ok === total) fb = { type:'correct', text:`🎉 Correct order!` };
    else if (att >= 3) fb = { type:'hint', text:'Keep trying! Compare digit by digit from the left.' };
    else if (att === 2) fb = { type:'hint', text:`💡 ${ok}/${total} in the right place. Compare the digits at each decimal place, starting from the leftmost digit.` };
    else fb = { type:'wrong', text:`✗ ${ok}/${total} in the right place. Look at each decimal carefully — find the smallest first.` };
    const merged = { ...q3FB, [grp.lbl]: fb };
    setQ3FB(merged);
    if (ok === total) {
      const allDone = Q3_GROUPS.every(g => merged[g.lbl]?.type === 'correct');
      if (allDone) prog.markDone('s3', { correct: Q3_GROUPS.length, total: Q3_GROUPS.length, attempts: att });
    }
  };

  // ══════════════════════════════════════════════════════════════
  // s4 / s5: rounding helpers
  // ══════════════════════════════════════════════════════════════

  function makeRoundHandlers(dState, setD, stState, setSt) {
    const drop = (lbl) => (raw) => {
      if (stState[lbl] === 'correct') return;
      if (raw === 'del') {
        if (stState[lbl] === 'wrong') setSt(p => ({ ...p, [lbl]: 'default' }));
        setD(p => ({ ...p, [lbl]: (p[lbl] || []).slice(0, -1) }));
      } else if (raw.startsWith('digit:')) {
        const d = raw.split(':')[1];
        if (stState[lbl] === 'wrong') setSt(p => ({ ...p, [lbl]: 'default' }));
        setD(p => ({ ...p, [lbl]: [...(p[lbl] || []), d] }));
      }
    };
    const remove = (lbl) => (idx) => {
      if (stState[lbl] === 'correct') return;
      if (stState[lbl] === 'wrong') setSt(p => ({ ...p, [lbl]: 'default' }));
      setD(p => {
        const a = [...(p[lbl] || [])];
        a.splice(idx, 1);
        return { ...p, [lbl]: a };
      });
    };
    return { drop, remove };
  }

  function makeRoundCheck(questions, dState, stState, setSt, fbState, setFB, sectionId, hintText) {
    const numPairs = chunk(questions, 2).length;
    return (pair, pi) => {
      const key = `${sectionId}_p${pi}`;
      increment(key);
      const att = getAtt(key) + 1;
      let ok = 0;
      const ns = { ...stState };
      pair.forEach(q => {
        const val = (dState[q.lbl] || []).join('');
        ns[q.lbl] = val === q.ans ? 'correct' : 'wrong';
        if (val === q.ans) ok++;
      });
      setSt(ns);
      const total = pair.length;
      let fb;
      if (ok === total) fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      else if (att >= 3) fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
      else if (att === 2) fb = { type:'hint', text:`💡 ${ok}/${total} correct. ${hintText}` };
      else fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Look at the digit after the rounding position to decide whether to round up or stay.` };
      const merged = { ...fbState, [pi]: fb };
      setFB(merged);
      if (ok === total) {
        const allDone = Array.from({ length: numPairs }, (_, i) => i).every(i => merged[i]?.type === 'correct');
        if (allDone) prog.markDone(sectionId, { correct: questions.length, total: questions.length, attempts: att });
      }
    };
  }

  const { drop: q4Drop, remove: q4Remove } = makeRoundHandlers(q4D, setQ4D, q4St, setQ4St);
  const checkQ4Pair = makeRoundCheck(Q4, q4D, q4St, setQ4St, q4FB, setQ4FB, 's4',
    'Look at the digit in the first decimal place — if it is 5 or more, round up the whole number.');

  const { drop: q5Drop, remove: q5Remove } = makeRoundHandlers(q5D, setQ5D, q5St, setQ5St);
  const checkQ5Pair = makeRoundCheck(Q5, q5D, q5St, setQ5St, q5FB, setQ5FB, 's5',
    'Look at the hundredths digit — if it is 5 or more, round the tenths digit up.');

  // ══════════════════════════════════════════════════════════════
  // render helper: one number-line section (s1 or s2)
  // ══════════════════════════════════════════════════════════════

  function renderNLSection(lines, dState, dropFn, removeFn, stState, fbState, checkFn, sectionId, badge, title) {
    // global pair index across all lines in this section
    let pairIdx = 0;
    return (
      <SectionCard badge={badge} title={title}
        tagType="drag" tagLabel="Drag Digits"
        subtitle="Drag digit cards to build each decimal. Check after every pair."
        score={prog.done[sectionId]}>
        {lines.map(line => {
          const pairs = chunk(line.data, 2);
          return (
            <div key={line.key} style={{ marginBottom: 20 }}>
              <NumberLine
                arrows={line.data}
                min={line.min} max={line.max}
                step={line.step} mid={line.mid}
                label={line.label}
              />
              {pairs.map((pair, localPi) => {
                const pi = pairIdx++;
                const pId = pi; // capture for closure
                return (
                  <QGroup key={localPi}
                    title={`Questions ${pair.map(a => a.lbl).join(' & ')}`}>
                    <DigitPalette paletteId={`${line.palBase}_p${localPi}`} decimal={true} minus={false}/>
                    {pair.map((arrow, ai) => {
                      const key = `${line.key}_${arrow.lbl}`;
                      return (
                        <QItem key={arrow.lbl} last={ai === pair.length - 1}>
                          <QItemLabel>
                            <LblCircle letter={arrow.lbl}/>
                            <span style={{ fontSize: 20, fontWeight: 700 }}>
                              Arrow <strong style={{ color:'#DC2626', fontStyle:'italic' }}>{arrow.lbl}</strong> points to:
                            </span>
                            <DigitDropZone
                              paletteId={`${line.palBase}_p${localPi}`}
                              digits={dState[key] || []}
                              zoneState={stState[key] || 'default'}
                              onDrop={dropFn(key)}
                              onRemove={removeFn(key)}
                            />
                          </QItemLabel>
                        </QItem>
                      );
                    })}
                    <CheckButton
                      label={`✓ Check ${pair.map(a => a.lbl).join(' & ')}`}
                      onClick={() => checkFn(pair, line.key, pId)}
                      disabled={!!prog.done[sectionId]}
                    />
                    {fbState[pId] && <FeedbackBox type={fbState[pId].type} message={fbState[pId].text}/>}
                  </QGroup>
                );
              })}
            </div>
          );
        })}
      </SectionCard>
    );
  }

  // ── render helper: ordering group ─────────────────────────────
  function renderOrderGroup(grp) {
    const shuffled = q3Shuffled[grp.lbl] || grp.items;
    const slots = q3Slots[grp.lbl] || {};
    const slotSt = q3St[grp.lbl] || {};
    const fb = q3FB[grp.lbl];
    const isDone = !!prog.done['s3'];

    return (
      <QGroup key={grp.lbl} title={`Set ${grp.lbl.toUpperCase()}`}>
        {/* card bank */}
        <div style={{ background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:800, color:'#1E40AF', marginBottom:8, textTransform:'uppercase', letterSpacing:'.4px' }}>
            Drag cards into order — smallest first
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {shuffled.map(v => {
              const placed = Object.values(slots).includes(v);
              return (
                <div
                  key={v}
                  draggable={!placed && !isDone}
                  onDragStart={e => {
                    if (placed || isDone) { e.preventDefault(); return; }
                    e.dataTransfer.setData('text/plain', v);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  style={{
                    background: placed ? '#CBD5E1' : '#1E40AF',
                    color: '#fff',
                    border: `2px solid ${placed ? '#94A3B8' : '#1E3A8A'}`,
                    borderRadius: 10, padding: '10px 16px',
                    fontSize: 18, fontWeight: 900, fontFamily: 'monospace',
                    cursor: placed || isDone ? 'default' : 'grab',
                    opacity: placed ? 0.35 : 1,
                    userSelect: 'none',
                  }}>
                  {v}
                </div>
              );
            })}
          </div>
        </div>
        {/* order slots */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          <span style={{ fontSize:14, fontWeight:800, color:'#1E40AF' }}>← Smallest</span>
          {[0,1,2,3].map(idx => {
            const v = slots[idx];
            const ss = slotSt[idx];
            const bg    = ss==='correct' ? 'var(--green-bg)' : ss==='wrong' ? 'var(--red-bg)' : v!==undefined ? '#EEF4FF' : '#F8FAFF';
            const bd    = ss==='correct' ? '2.5px solid var(--green)' : ss==='wrong' ? '2.5px solid var(--red)' : v!==undefined ? '2.5px solid #1E40AF' : '2.5px dashed #CBD5E1';
            const color = ss==='correct' ? 'var(--green)' : ss==='wrong' ? 'var(--red)' : v!==undefined ? '#1E3A8A' : '#94A3B8';
            return (
              <div
                key={idx}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const d = e.dataTransfer.getData('text/plain');
                  if (d) q3Drop(grp.lbl, idx)(d);
                }}
                onClick={() => { if (v !== undefined && !isDone) q3Clear(grp.lbl, idx)(); }}
                style={{
                  minWidth: 90, height: 54, borderRadius: 10,
                  border: bd, background: bg, color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 900, fontFamily: 'monospace',
                  padding: '0 10px',
                  cursor: v !== undefined && !isDone ? 'pointer' : 'default',
                }}>
                {v !== undefined ? v : `#${idx + 1}`}
              </div>
            );
          })}
          <span style={{ fontSize:14, fontWeight:800, color:'#DC2626' }}>Largest →</span>
        </div>
        <CheckButton
          label={`✓ Check Set ${grp.lbl.toUpperCase()}`}
          onClick={() => checkQ3Group(grp)}
          disabled={isDone}
        />
        {fb && <FeedbackBox type={fb.type} message={fb.text}/>}
      </QGroup>
    );
  }

  // ── render helper: rounding section (s4 or s5) ────────────────
  function renderRoundSection(questions, dState, dropFn, removeFn, stState, fbState, checkFn, sectionId, badge, title, subtitle, palPrefix) {
    const pairs = chunk(questions, 2);
    return (
      <SectionCard badge={badge} title={title}
        tagType="drag" tagLabel="Drag Digits"
        subtitle={subtitle}
        score={prog.done[sectionId]}>
        {pairs.map((pair, pi) => (
          <QGroup key={pi} title={`Questions ${pair.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
            <DigitPalette paletteId={`${palPrefix}_p${pi}`} decimal={true} minus={false}/>
            {pair.map((q, qi) => (
              <QItem key={q.lbl} last={qi === pair.length - 1}>
                <QItemLabel>
                  <LblCircle letter={q.lbl}/>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>
                    Round <NumDisplay>{q.display}</NumDisplay> →
                  </span>
                  <DigitDropZone
                    paletteId={`${palPrefix}_p${pi}`}
                    digits={dState[q.lbl] || []}
                    zoneState={stState[q.lbl] || 'default'}
                    onDrop={dropFn(q.lbl)}
                    onRemove={removeFn(q.lbl)}
                  />
                </QItemLabel>
              </QItem>
            ))}
            <CheckButton
              label={`✓ Check ${pair.map(q => q.lbl.toUpperCase()).join(' & ')}`}
              onClick={() => checkFn(pair, pi)}
              disabled={!!prog.done[sectionId]}
            />
            {fbState[pi] && <FeedbackBox type={fbState[pi].type} message={fbState[pi].text}/>}
          </QGroup>
        ))}
      </SectionCard>
    );
  }

  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 4 · Decimal Numbers" completed={prog.completedCount} total={5}/>
      <div className="page">
        <ObjectiveCard text="Read decimals from number lines, order sets of decimal numbers from smallest to largest, and round decimals to the nearest whole number and nearest tenth"/>
        <ExplainPanel title="Key Concepts: Decimal Numbers">
          <RuleBox>
            <strong>Reading a number line:</strong> Count the ticks between labeled values. Each tick = the step size.<br/>
            <strong>Ordering decimals:</strong> Compare digits from left to right — the first digit that differs decides which is smaller.<br/>
            <strong>Round to whole number:</strong> Look at the tenths digit — 5 or more → round up; less than 5 → round down.<br/>
            <strong>Round to nearest tenth:</strong> Look at the hundredths digit — 5 or more → round tenths up; less than 5 → keep tenths digit.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={5}/>

        {/* ── s1: number lines a & b ── */}
        {renderNLSection(
          S1_LINES, q1D, q1Drop, q1Remove, q1St, q1FB, checkQ1Pair,
          's1', 1, 'Write the decimal number each arrow points to.'
        )}

        {/* ── s2: number lines c & d ── */}
        {renderNLSection(
          S2_LINES, q2D, q2Drop, q2Remove, q2St, q2FB, checkQ2Pair,
          's2', 2, 'Write the decimal number each arrow points to.'
        )}

        {/* ── s3: ordering ── */}
        <SectionCard badge={3}
          title="Write each set in order, starting with the smallest."
          tagType="drag" tagLabel="Drag & Order"
          subtitle="Drag the number cards into the slots — smallest on the left, largest on the right."
          score={prog.done['s3']}>
          {Q3_GROUPS.map(grp => renderOrderGroup(grp))}
        </SectionCard>

        {/* ── s4: round to whole ── */}
        {renderRoundSection(
          Q4, q4D, q4Drop, q4Remove, q4St, q4FB, checkQ4Pair,
          's4', 4,
          'Round each amount to the nearest whole number.',
          'Drag digit cards to enter your rounded answer.',
          'q4'
        )}

        {/* ── s5: round to tenth ── */}
        {renderRoundSection(
          Q5, q5D, q5Drop, q5Remove, q5St, q5FB, checkQ5Pair,
          's5', 5,
          'Round each amount to the nearest tenth.',
          'Drag digit cards to enter your rounded answer.',
          'q5'
        )}

        {prog.allDone && (
          <Summary message="Excellent! You can read decimals from number lines, order decimals, and round to the nearest whole number and tenth!"/>
        )}
      </div>
    </div>
  );
}

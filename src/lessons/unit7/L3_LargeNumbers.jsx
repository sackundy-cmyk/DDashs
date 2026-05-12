// ============================================================
//  lessons/unit7/L3_LargeNumbers.jsx
//  Unit 1 · Lesson 3: Large Numbers
//  s1: Q1 (a–l) — write number in full  (MCQ, 12 Qs, 6 pairs)
//  s2: Q2 (a–l) — write in index form   (MCQ, 12 Qs, 6 pairs)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import {
  ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
  FeedbackBox, LblCircle, CheckButton, Summary,
} from '../../components/SharedComponents.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress }    from '../../hooks/useProgress.js';
import { useAttempts }    from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

function fmt(n) {
  return Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// Inline expression renderer — "67 × 10²" with proper superscript
function Pow({ base, exp }) {
  return (
    <span style={{
      display: 'inline-block',
      background: '#EFF6FF', border: '2px solid #1E40AF',
      borderRadius: 10, padding: '6px 16px',
      fontSize: 24, fontWeight: 900, color: '#1E3A8A',
      letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {fmt(base)} × 10<sup style={{ fontSize: '0.55em', fontWeight: 900, verticalAlign: 'super' }}>{exp}</sup>
    </span>
  );
}

// ── Q1 data — expressions to expand ──────────────────────────
const Q1_QS = [
  { lbl: 'a', base: 67,  exp: 2, ans: 6700,        opts: [6700,        6007,       670,          67000]       },
  { lbl: 'b', base: 5,   exp: 4, ans: 50000,        opts: [50000,       5000,       500000,       5400]        },
  { lbl: 'c', base: 85,  exp: 3, ans: 85000,        opts: [85000,       8500,       850000,       85300]       },
  { lbl: 'd', base: 23,  exp: 4, ans: 230000,       opts: [230000,      23000,      2300000,      230400]      },
  { lbl: 'e', base: 38,  exp: 5, ans: 3800000,      opts: [3800000,     380000,     38000000,     3080000]     },
  { lbl: 'f', base: 162, exp: 3, ans: 162000,       opts: [162000,      16200,      1620000,      162300]      },
  { lbl: 'g', base: 15,  exp: 6, ans: 15000000,     opts: [15000000,    1500000,    150000000,    15600000]    },
  { lbl: 'h', base: 32,  exp: 4, ans: 320000,       opts: [320000,      32000,      3200000,      302000]      },
  { lbl: 'i', base: 12,  exp: 5, ans: 1200000,      opts: [1200000,     120000,     12000000,     1020000]     },
  { lbl: 'j', base: 11,  exp: 3, ans: 11000,        opts: [11000,       1100,       110000,       11300]       },
  { lbl: 'k', base: 294, exp: 4, ans: 2940000,      opts: [2940000,     294000,     29400000,     2904000]     },
  { lbl: 'l', base: 2,   exp: 8, ans: 200000000,    opts: [200000000,   20000000,   2000000000,   200000]      },
];

// ── Q2 data — numbers to write in index form ──────────────────
// Unicode superscripts: ² ³ ⁴ ⁵ ⁶ ⁷ ⁸
const Q2_QS = [
  { lbl: 'a', num: 26000,       ans: '26 × 10³',  opts: ['26 × 10³',  '26 × 10⁴',  '260 × 10²',  '2.6 × 10⁴']  },
  { lbl: 'b', num: 30000,       ans: '3 × 10⁴',   opts: ['3 × 10⁴',   '30 × 10³',  '3 × 10³',    '3 × 10⁵']    },
  { lbl: 'c', num: 294000,      ans: '294 × 10³', opts: ['294 × 10³', '294 × 10⁴', '2940 × 10²', '29.4 × 10⁴'] },
  { lbl: 'd', num: 1800000,     ans: '18 × 10⁵',  opts: ['18 × 10⁵',  '18 × 10⁶',  '180 × 10⁴',  '1.8 × 10⁶']  },
  { lbl: 'e', num: 61000000,    ans: '61 × 10⁶',  opts: ['61 × 10⁶',  '61 × 10⁷',  '610 × 10⁵',  '6.1 × 10⁷']  },
  { lbl: 'f', num: 70000000,    ans: '7 × 10⁷',   opts: ['7 × 10⁷',   '70 × 10⁶',  '7 × 10⁶',    '7 × 10⁸']    },
  { lbl: 'g', num: 3810000,     ans: '381 × 10⁴', opts: ['381 × 10⁴', '381 × 10³', '3810 × 10³', '38.1 × 10⁵'] },
  { lbl: 'h', num: 292000000,   ans: '292 × 10⁶', opts: ['292 × 10⁶', '292 × 10⁷', '2920 × 10⁵', '29.2 × 10⁷'] },
  { lbl: 'i', num: 270000000,   ans: '27 × 10⁷',  opts: ['27 × 10⁷',  '27 × 10⁸',  '270 × 10⁶',  '2.7 × 10⁸']  },
  { lbl: 'j', num: 300000000,   ans: '3 × 10⁸',   opts: ['3 × 10⁸',   '30 × 10⁷',  '3 × 10⁷',    '3 × 10⁹']    },
  { lbl: 'k', num: 22000000,    ans: '22 × 10⁶',  opts: ['22 × 10⁶',  '22 × 10⁷',  '220 × 10⁵',  '2.2 × 10⁷']  },
  { lbl: 'l', num: 4830000000,  ans: '483 × 10⁷', opts: ['483 × 10⁷', '483 × 10⁶', '4830 × 10⁶', '48.3 × 10⁸'] },
];

// 6 pairs per section (a+b, c+d, e+f, g+h, i+j, k+l)
const Q1_PAIRS = [0, 2, 4, 6, 8, 10].map(i => [Q1_QS[i], Q1_QS[i + 1]]);
const Q2_PAIRS = [0, 2, 4, 6, 8, 10].map(i => [Q2_QS[i], Q2_QS[i + 1]]);
const NUM_PAIRS = 6;

// ── Responsive styles ─────────────────────────────────────────
const LESSON_CSS = `
  .ln-pair { margin-bottom: 28px; }
  .ln-pair-label {
    font-size: 15px; font-weight: 700; color: #64748B;
    margin-bottom: 14px; padding-left: 2px;
  }
  .ln-q-block {
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    padding: 14px 16px;
    margin-bottom: 12px;
  }
  .ln-q-block:nth-child(even) { background: #F8FAFC; }
  .ln-q-block:nth-child(odd)  { background: #fff; }
  .ln-q-head {
    display: flex; align-items: center; gap: 12px;
    flex-wrap: wrap; margin-bottom: 12px;
  }
  .ln-divider {
    border: none; border-top: 2px dashed #E2E8F0;
    margin: 4px 0 28px;
  }
  @media (max-width: 480px) {
    .ln-q-block { padding: 12px; }
  }
`;

// ══════════════════════════════════════════════════════════════
export default function L3_LargeNumbers() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const q1Sel = state.q1Sel || {}, setQ1Sel = setField('q1Sel');
  const q1St  = state.q1St  || {}, setQ1St  = setField('q1St');
  const q1FB  = state.q1FB  || {}, setQ1FB  = setField('q1FB');
  const q2Sel = state.q2Sel || {}, setQ2Sel = setField('q2Sel');
  const q2St  = state.q2St  || {}, setQ2St  = setField('q2St');
  const q2FB  = state.q2FB  || {}, setQ2FB  = setField('q2FB');

  // Shuffle options once on mount
  const [shuf] = useState(() => ({
    q1: Object.fromEntries(Q1_QS.map(q => [q.lbl, shuffle(q.opts)])),
    q2: Object.fromEntries(Q2_QS.map(q => [q.lbl, shuffle(q.opts)])),
  }));

  // ── Check Q1 pair ────────────────────────────────────────────
  const checkQ1Pair = (pairQs, pi) => {
    const key = `q1p${pi}`;
    increment(key);
    const att = getAtt(key) + 1;

    // Compute before setState (React async-updater rule)
    let ok = 0;
    pairQs.forEach(q => { if (q1Sel[q.lbl] === String(q.ans)) ok++; });

    const ns = { ...q1St };
    pairQs.forEach(q => {
      const s = q1Sel[q.lbl];
      if (s === String(q.ans)) ns[`${q.lbl}-${s}`] = 'correct';
      else if (s)              ns[`${q.lbl}-${s}`] = 'wrong';
    });
    setQ1St(ns);

    const total = pairQs.length;
    const lbls = pairQs.map(q => q.lbl.toUpperCase()).join(' and ');
    let fb;
    if (ok === total)   fb = { type: 'correct', text: `Both correct! Multiplying by a power of 10 adds exactly that many zeros.` };
    else if (att >= 3)  fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',    text: `${ok}/${total} correct. The exponent tells you how many zeros to add to the right of the number. Count carefully.` };
    else                fb = { type: 'wrong',   text: `${ok}/${total} correct. Count the power of 10 — that is exactly how many zeros to add. Check your answer against the exponent.` };

    const newFB = { ...q1FB, [pi]: fb };
    setQ1FB(newFB);

    if (ok === total) {
      const allDone = Array.from({ length: NUM_PAIRS }, (_, i) => i)
        .every(i => i === pi ? true : newFB[i]?.type === 'correct');
      if (allDone && !prog.done['s1']) {
        prog.markDone('s1', { correct: 12, total: 12, attempts: att });
      }
    }
  };

  // ── Check Q2 pair ────────────────────────────────────────────
  const checkQ2Pair = (pairQs, pi) => {
    const key = `q2p${pi}`;
    increment(key);
    const att = getAtt(key) + 1;

    let ok = 0;
    pairQs.forEach(q => { if (q2Sel[q.lbl] === q.ans) ok++; });

    const ns = { ...q2St };
    pairQs.forEach(q => {
      const s = q2Sel[q.lbl];
      if (s === q.ans) ns[`${q.lbl}-${s}`] = 'correct';
      else if (s)      ns[`${q.lbl}-${s}`] = 'wrong';
    });
    setQ2St(ns);

    const total = pairQs.length;
    let fb;
    if (ok === total)   fb = { type: 'correct', text: `Both correct! You correctly identified the index form.` };
    else if (att >= 3)  fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',    text: `${ok}/${total} correct. Count all trailing zeros — that is your power. The remaining digits form the coefficient. If the coefficient still ends in zero, strip one more.` };
    else                fb = { type: 'wrong',   text: `${ok}/${total} correct. Strip the trailing zeros from the number — count them for the power. The digits left (with no trailing zero) form the coefficient.` };

    const newFB = { ...q2FB, [pi]: fb };
    setQ2FB(newFB);

    if (ok === total) {
      const allDone = Array.from({ length: NUM_PAIRS }, (_, i) => i)
        .every(i => i === pi ? true : newFB[i]?.type === 'correct');
      if (allDone && !prog.done['s2']) {
        prog.markDone('s2', { correct: 12, total: 12, attempts: att });
      }
    }
  };

  // ── Render one Q1 pair ───────────────────────────────────────
  const renderQ1Pair = (pairQs, pi) => {
    const isPairDone = q1FB[pi]?.type === 'correct' || !!prog.done['s1'];
    const lbls = pairQs.map(q => q.lbl.toUpperCase()).join(' & ');
    return (
      <div className="ln-pair" key={`q1p${pi}`}>
        <div className="ln-pair-label">Questions {lbls}</div>
        {pairQs.map(q => {
          const opts = (shuf.q1[q.lbl] || q.opts).map(v => ({
            id: String(v), label: fmt(v),
            state: q1St[`${q.lbl}-${String(v)}`] || (q1Sel[q.lbl] === String(v) ? 'selected' : 'default'),
          }));
          return (
            <div className="ln-q-block" key={q.lbl}>
              <div className="ln-q-head">
                <LblCircle letter={q.lbl}/>
                <Pow base={q.base} exp={q.exp}/>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#64748B' }}>=</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>?</span>
              </div>
              <MCQOptions
                options={opts}
                onSelect={o => { if (!isPairDone) setQ1Sel(p => ({ ...p, [q.lbl]: o })); }}
              />
            </div>
          );
        })}
        <div style={{ marginTop: 12 }}>
          <CheckButton
            label={`✓ Check ${lbls}`}
            onClick={() => checkQ1Pair(pairQs, pi)}
            disabled={isPairDone}
          />
          {q1FB[pi] && <FeedbackBox type={q1FB[pi].type} message={q1FB[pi].text}/>}
        </div>
      </div>
    );
  };

  // ── Render one Q2 pair ───────────────────────────────────────
  const renderQ2Pair = (pairQs, pi) => {
    const isPairDone = q2FB[pi]?.type === 'correct' || !!prog.done['s2'];
    const lbls = pairQs.map(q => q.lbl.toUpperCase()).join(' & ');
    return (
      <div className="ln-pair" key={`q2p${pi}`}>
        <div className="ln-pair-label">Questions {lbls}</div>
        {pairQs.map(q => {
          const opts = (shuf.q2[q.lbl] || q.opts).map(v => ({
            id: v, label: v,
            state: q2St[`${q.lbl}-${v}`] || (q2Sel[q.lbl] === v ? 'selected' : 'default'),
          }));
          return (
            <div className="ln-q-block" key={q.lbl}>
              <div className="ln-q-head">
                <LblCircle letter={q.lbl}/>
                <span style={{
                  background: '#EFF6FF', border: '2px solid #1E40AF',
                  borderRadius: 10, padding: '6px 18px',
                  fontSize: 22, fontWeight: 900, color: '#1E3A8A',
                  letterSpacing: '0.03em',
                }}>
                  {fmt(q.num)}
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#64748B' }}>=</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#94A3B8' }}>?</span>
              </div>
              <MCQOptions
                options={opts}
                onSelect={o => { if (!isPairDone) setQ2Sel(p => ({ ...p, [q.lbl]: o })); }}
              />
            </div>
          );
        })}
        <div style={{ marginTop: 12 }}>
          <CheckButton
            label={`✓ Check ${lbls}`}
            onClick={() => checkQ2Pair(pairQs, pi)}
            disabled={isPairDone}
          />
          {q2FB[pi] && <FeedbackBox type={q2FB[pi].type} message={q2FB[pi].text}/>}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <style>{LESSON_CSS}</style>
      <Header lessonChip="Unit 1 · Lesson 3 · Large Numbers" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Multiply numbers by powers of 10 to write them in full. Write large numbers in index form using × 10ⁿ notation."/>
        <ExplainPanel title="Key Concepts: Powers of 10">
          <RuleBox>
            <strong>Writing in full:</strong> Multiplying by 10ⁿ adds exactly <em>n</em> zeros to the right.<br/>
            Example: 67 × 10² = 67 × 100 = <strong>6,700</strong> (add 2 zeros to 67)<br/>
            Example: 5 × 10⁴ = 5 × 10,000 = <strong>50,000</strong> (add 4 zeros to 5)<br/><br/>
            <strong>Writing in index form:</strong> Count the trailing zeros — that is the power. The remaining digits (with no trailing zero) form the coefficient.<br/>
            Example: 26,000 → 3 trailing zeros → coefficient 26 → <strong>26 × 10³</strong><br/>
            Example: 30,000 → try 30 × 10³, but 30 ends in zero → factor out one more → <strong>3 × 10⁴</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 1: Write in full ── */}
        <SectionCard badge={1}
          title="Write these numbers in full."
          tagType="mcq" tagLabel="MCQ"
          subtitle="Each expression shows a number multiplied by a power of 10. Choose the correct full number. Check each pair separately."
          score={prog.done['s1']}>
          {Q1_PAIRS.map((pair, pi) => (
            <React.Fragment key={pi}>
              {renderQ1Pair(pair, pi)}
              {pi < Q1_PAIRS.length - 1 && <hr className="ln-divider"/>}
            </React.Fragment>
          ))}
        </SectionCard>

        {/* ── Section 2: Write in index form ── */}
        <SectionCard badge={2}
          title="Write these numbers in index form."
          tagType="mcq" tagLabel="MCQ"
          subtitle="Write each number as a coefficient × 10ⁿ. The coefficient must not end in zero. Check each pair separately."
          score={prog.done['s2']}>
          {Q2_PAIRS.map((pair, pi) => (
            <React.Fragment key={pi}>
              {renderQ2Pair(pair, pi)}
              {pi < Q2_PAIRS.length - 1 && <hr className="ln-divider"/>}
            </React.Fragment>
          ))}
        </SectionCard>

        {prog.allDone && (
          <Summary message="Excellent! You can write numbers in full from index form and convert large numbers to index form using powers of 10!"/>
        )}
      </div>
    </div>
  );
}

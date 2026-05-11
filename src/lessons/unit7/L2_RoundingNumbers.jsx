// ============================================================
//  lessons/unit7/L2_RoundingNumbers.jsx
//  Unit 1 · Lesson 2: Rounding Large Numbers
//  s1: Q1 rows 1–4  — round to nearest 100 / 1,000 / 10,000 (MCQ)
//  s2: Q1 rows 5–8  — round to nearest 100 / 1,000 / 10,000 (MCQ)
//  s3: Q2           — smallest / largest integer for a given rounded value (MCQ)
//  Each section has 2-question pairs with separate Check buttons
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
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// ── Q1 data — 8 numbers, 3 rounding columns each ─────────────
const Q1_ROWS = [
  { num: 7892388,
    a: { ans: 7892400,    opts: [7892400,    7892300,    7892500,    7892000]    },
    b: { ans: 7892000,    opts: [7892000,    7893000,    7891000,    7892400]    },
    c: { ans: 7890000,    opts: [7890000,    7900000,    7880000,    7892000]    } },
  { num: 68372105,
    a: { ans: 68372100,   opts: [68372100,   68372200,   68372000,   68373000]   },
    b: { ans: 68372000,   opts: [68372000,   68373000,   68371000,   68372100]   },
    c: { ans: 68370000,   opts: [68370000,   68380000,   68360000,   68372000]   } },
  { num: 38893465,
    a: { ans: 38893500,   opts: [38893500,   38893400,   38893600,   38894000]   },
    b: { ans: 38893000,   opts: [38893000,   38894000,   38892000,   38893500]   },
    c: { ans: 38890000,   opts: [38890000,   38900000,   38880000,   38893000]   } },
  { num: 149035476,
    a: { ans: 149035500,  opts: [149035500,  149035400,  149035600,  149036000]  },
    b: { ans: 149035000,  opts: [149035000,  149036000,  149034000,  149035500]  },
    c: { ans: 149040000,  opts: [149040000,  149030000,  149050000,  149035000]  } },
  { num: 7498024573,
    a: { ans: 7498024600, opts: [7498024600, 7498024500, 7498024700, 7498025000] },
    b: { ans: 7498025000, opts: [7498025000, 7498024000, 7498026000, 7498024600] },
    c: { ans: 7498020000, opts: [7498020000, 7498030000, 7498010000, 7498025000] } },
  { num: 1093773284,
    a: { ans: 1093773300, opts: [1093773300, 1093773200, 1093773400, 1093774000] },
    b: { ans: 1093773000, opts: [1093773000, 1093774000, 1093772000, 1093773300] },
    c: { ans: 1093770000, opts: [1093770000, 1093780000, 1093760000, 1093773000] } },
  { num: 1936243225,
    a: { ans: 1936243200, opts: [1936243200, 1936243300, 1936243100, 1936244000] },
    b: { ans: 1936243000, opts: [1936243000, 1936244000, 1936242000, 1936243200] },
    c: { ans: 1936240000, opts: [1936240000, 1936250000, 1936230000, 1936243000] } },
  { num: 7846374522,
    a: { ans: 7846374500, opts: [7846374500, 7846374600, 7846374400, 7846375000] },
    b: { ans: 7846375000, opts: [7846375000, 7846374000, 7846376000, 7846374500] },
    c: { ans: 7846370000, opts: [7846370000, 7846380000, 7846360000, 7846375000] } },
];

const Q1_G1A = Q1_ROWS.slice(0, 2);
const Q1_G1B = Q1_ROWS.slice(2, 4);
const Q1_G2A = Q1_ROWS.slice(4, 6);
const Q1_G2B = Q1_ROWS.slice(6, 8);

const Q1_COLS = [
  { key: 'a', label: 'Round to Nearest 100',    hint: 'Look at the tens digit' },
  { key: 'b', label: 'Round to Nearest 1,000',  hint: 'Look at the hundreds digit' },
  { key: 'c', label: 'Round to Nearest 10,000', hint: 'Look at the thousands digit' },
];

// ── Q2 data — smallest / largest for a rounded value ─────────
const Q2_ROWS = [
  { lbl: 'a', rounded: 8460000,   unit: 'nearest 10,000',
    minAns: 8455000,   minOpts: [8455000,   8450000,   8460000,   8465000],
    maxAns: 8464999,   maxOpts: [8464999,   8469999,   8460000,   8465000] },
  { lbl: 'b', rounded: 74110000,  unit: 'nearest 10,000',
    minAns: 74105000,  minOpts: [74105000,  74100000,  74110000,  74115000],
    maxAns: 74114999,  maxOpts: [74114999,  74109999,  74119999,  74115000] },
  { lbl: 'c', rounded: 397500000, unit: 'nearest 100,000',
    minAns: 397450000, minOpts: [397450000, 397400000, 397500000, 397550000],
    maxAns: 397549999, maxOpts: [397549999, 397499999, 397599999, 397550000] },
  { lbl: 'd', rounded: 649900000, unit: 'nearest 100,000',
    minAns: 649850000, minOpts: [649850000, 649800000, 649900000, 649950000],
    maxAns: 649949999, maxOpts: [649949999, 649899999, 649999999, 649950000] },
];

const Q2_G0 = Q2_ROWS.slice(0, 2);
const Q2_G1 = Q2_ROWS.slice(2, 4);

// ── Responsive styles ─────────────────────────────────────────
const LESSON_CSS = `
  .rln-pair { margin-bottom: 32px; }
  .rln-pair-label {
    font-size: 15px; font-weight: 700; color: #64748B;
    margin-bottom: 12px; padding-left: 2px;
  }

  /* Q1 column header row — visible on desktop, hidden on mobile */
  .rln-col-hdr {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }
  .rln-col-hdr-cell {
    background: #1E40AF;
    color: #fff;
    border-radius: 10px;
    padding: 11px 10px 8px;
    font-size: 17px;
    font-weight: 800;
    text-align: center;
    line-height: 1.3;
  }
  .rln-col-hdr-hint {
    font-size: 12px;
    font-weight: 600;
    opacity: 0.82;
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Per-row column label (mobile only) */
  .rln-col-mob {
    display: none;
    font-size: 15px; font-weight: 800;
    color: #1E40AF; background: #EFF6FF;
    border-radius: 6px; padding: 5px 12px;
    margin-bottom: 8px;
  }

  /* Q2 column header row — visible on desktop */
  .rln-q2-hdr {
    display: flex;
    gap: 14px;
    margin-bottom: 14px;
  }
  .rln-q2-hdr-spacer { flex: 0 0 0; min-width: 0; }
  .rln-q2-hdr-cell {
    flex: 1;
    border-radius: 10px;
    padding: 11px 10px;
    font-size: 17px; font-weight: 800;
    text-align: center; line-height: 1.3;
  }
  .rln-q2-hdr-cell.min { background: #ECFDF5; color: #065F46; }
  .rln-q2-hdr-cell.max { background: #FEF2F2; color: #991B1B; }

  /* Q2 mobile column label */
  .rln-q2-mob { display: none; border-radius: 6px; padding: 5px 12px; margin-bottom: 8px; font-size: 15px; font-weight: 800; }
  .rln-q2-mob.min { color: #065F46; background: #ECFDF5; }
  .rln-q2-mob.max { color: #991B1B; background: #FEF2F2; }

  /* Pair divider */
  .rln-divider {
    border: none; border-top: 2px dashed #E2E8F0;
    margin: 4px 0 28px;
  }

  @media (max-width: 640px) {
    .rln-col-hdr  { display: none; }
    .rln-col-mob  { display: block; }
    .rln-q2-hdr   { display: none; }
    .rln-q2-mob   { display: block; }
  }
`;

// ══════════════════════════════════════════════════════════════
export default function L2_RoundingNumbers() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const q1Sel = state.q1Sel || {}, setQ1Sel = setField('q1Sel');
  const q1St  = state.q1St  || {}, setQ1St  = setField('q1St');
  const q1FB  = state.q1FB  || {}, setQ1FB  = setField('q1FB');
  const q2Sel = state.q2Sel || {}, setQ2Sel = setField('q2Sel');
  const q2St  = state.q2St  || {}, setQ2St  = setField('q2St');
  const q2FB  = state.q2FB  || {}, setQ2FB  = setField('q2FB');

  const [shuf] = useState(() => ({
    q1: Q1_ROWS.reduce((acc, row, ri) => {
      Q1_COLS.forEach(({ key }) => { acc[`${ri}${key}`] = shuffle(row[key].opts); });
      return acc;
    }, {}),
    q2min: Q2_ROWS.reduce((acc, row) => { acc[row.lbl] = shuffle(row.minOpts); return acc; }, {}),
    q2max: Q2_ROWS.reduce((acc, row) => { acc[row.lbl] = shuffle(row.maxOpts); return acc; }, {}),
  }));

  // ── Check Q1 pair (2 rows × 3 cols = 6 answers) ─────────────
  const checkQ1Pair = (groupRows, startIdx, sectionKey, gi, pi) => {
    const pairKey = `q1g${gi}p${pi}`;
    increment(pairKey);
    const att = getAtt(pairKey) + 1;

    // Compute ok BEFORE setState (React async-updater rule)
    let ok = 0;
    groupRows.forEach((row, ri) => {
      const rowIdx = startIdx + ri;
      Q1_COLS.forEach(({ key: col }) => {
        if (q1Sel[`${rowIdx}${col}`] === String(row[col].ans)) ok++;
      });
    });

    const ns = { ...q1St };
    groupRows.forEach((row, ri) => {
      const rowIdx = startIdx + ri;
      Q1_COLS.forEach(({ key: col }) => {
        const sel = q1Sel[`${rowIdx}${col}`];
        if (sel === String(row[col].ans)) ns[`${rowIdx}${col}-${sel}`] = 'correct';
        else if (sel)                     ns[`${rowIdx}${col}-${sel}`] = 'wrong';
      });
    });
    setQ1St(ns);

    const total = groupRows.length * 3;
    let fb;
    if (ok === total)   fb = { type: 'correct', text: `All ${total} correct! Excellent rounding!` };
    else if (att >= 3)  fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',    text: `${ok}/${total} correct. Nearest 100 → look at the tens digit; nearest 1,000 → hundreds digit; nearest 10,000 → thousands digit. 5 or more rounds up; 4 or less rounds down.` };
    else                fb = { type: 'wrong',   text: `${ok}/${total} correct. Check the digit immediately to the right of the rounding position — 5 or more rounds up, 4 or less rounds down.` };

    const newFB = { ...q1FB, [`${gi}-${pi}`]: fb };
    setQ1FB(newFB);

    // Section done when BOTH pairs are correct
    if (ok === total) {
      const otherPi = pi === 0 ? 1 : 0;
      if (newFB[`${gi}-${otherPi}`]?.type === 'correct' && !prog.done[sectionKey]) {
        prog.markDone(sectionKey, { correct: 2 * total, total: 2 * total, attempts: att });
      }
    }
  };

  // ── Check Q2 pair (2 rows × 2 answers = 4) ──────────────────
  const checkQ2Pair = (rows, gi) => {
    const key = `q2g${gi}`;
    increment(key);
    const att = getAtt(key) + 1;

    let ok = 0;
    rows.forEach(row => {
      if (q2Sel[`${row.lbl}min`] === String(row.minAns)) ok++;
      if (q2Sel[`${row.lbl}max`] === String(row.maxAns)) ok++;
    });

    const ns = { ...q2St };
    rows.forEach(row => {
      ['min', 'max'].forEach(type => {
        const sel = q2Sel[`${row.lbl}${type}`];
        const ans = String(type === 'min' ? row.minAns : row.maxAns);
        if (sel === ans) ns[`${row.lbl}${type}-${sel}`] = 'correct';
        else if (sel)    ns[`${row.lbl}${type}-${sel}`] = 'wrong';
      });
    });
    setQ2St(ns);

    const total = rows.length * 2;
    let fb;
    if (ok === total)   fb = { type: 'correct', text: `All ${total} correct! You understand the range of integers that round to a given value.` };
    else if (att >= 3)  fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',    text: `${ok}/${total} correct. The range spans half the rounding unit on each side. Smallest is at the lower boundary; largest is one less than the upper boundary.` };
    else                fb = { type: 'wrong',   text: `${ok}/${total} correct. The smallest integer is at the lower boundary of the rounding range; the largest is the highest integer that still rounds to the given value.` };

    const newFB = { ...q2FB, [gi]: fb };
    setQ2FB(newFB);

    if (ok === total) {
      const otherGi = gi === 0 ? 1 : 0;
      if (newFB[otherGi]?.type === 'correct' && !prog.done['s3']) {
        prog.markDone('s3', { correct: 8, total: 8, attempts: att });
      }
    }
  };

  // ── Render one Q1 pair (2 rows) ──────────────────────────────
  const renderQ1Pair = (groupRows, startIdx, sectionKey, gi, pi) => {
    const isPairDone = q1FB[`${gi}-${pi}`]?.type === 'correct' || !!prog.done[sectionKey];
    const rowRange = `${startIdx + 1}–${startIdx + groupRows.length}`;
    return (
      <div className="rln-pair" key={`q1-${gi}-${pi}`}>
        <div className="rln-pair-label">Numbers {rowRange}</div>

        {/* Column header row — desktop shows all 3 at once */}
        <div className="rln-col-hdr">
          {Q1_COLS.map(col => (
            <div key={col.key} className="rln-col-hdr-cell">
              {col.label}
              <div className="rln-col-hdr-hint">{col.hint}</div>
            </div>
          ))}
        </div>

        {groupRows.map((row, ri) => {
          const rowIdx = startIdx + ri;
          return (
            <div key={rowIdx} style={{
              background: ri % 2 === 0 ? '#F8FAFC' : '#fff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: '14px 16px',
              marginBottom: 10,
            }}>
              {/* Row badge + number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{
                  background: '#1E40AF', color: '#fff', borderRadius: '50%',
                  width: 36, height: 36, flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900,
                }}>
                  {rowIdx + 1}
                </span>
                <span style={{
                  background: '#EFF6FF', border: '2px solid #1E40AF',
                  borderRadius: 10, padding: '8px 18px',
                  fontSize: 24, fontWeight: 900, color: '#1E3A8A',
                  letterSpacing: '0.03em',
                }}>
                  {fmt(row.num)}
                </span>
              </div>

              {/* 3 MCQ columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 14,
              }}>
                {Q1_COLS.map(col => {
                  const selKey = `${rowIdx}${col.key}`;
                  const opts = (shuf.q1[selKey] || row[col.key].opts).map(v => ({
                    id: String(v), label: fmt(v),
                    state: q1St[`${selKey}-${v}`] || (q1Sel[selKey] === String(v) ? 'selected' : 'default'),
                  }));
                  return (
                    <div key={col.key}>
                      {/* Mobile-only column label */}
                      <div className="rln-col-mob">{col.label}</div>
                      <MCQOptions
                        options={opts}
                        onSelect={o => { if (!isPairDone) setQ1Sel(p => ({ ...p, [selKey]: o })); }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 14 }}>
          <CheckButton
            label={`✓ Check Rows ${rowRange}`}
            onClick={() => checkQ1Pair(groupRows, startIdx, sectionKey, gi, pi)}
            disabled={isPairDone}
          />
          {q1FB[`${gi}-${pi}`] && (
            <FeedbackBox type={q1FB[`${gi}-${pi}`].type} message={q1FB[`${gi}-${pi}`].text}/>
          )}
        </div>
      </div>
    );
  };

  // ── Render one Q2 pair (2 questions) ────────────────────────
  const renderQ2Pair = (rows, gi) => {
    const isPairDone = q2FB[gi]?.type === 'correct' || !!prog.done['s3'];
    const pairLabel = gi === 0 ? 'A–B' : 'C–D';
    return (
      <div className="rln-pair" key={`q2-${gi}`}>
        <div className="rln-pair-label">Questions {pairLabel}</div>

        {/* Q2 column header row — desktop */}
        <div className="rln-q2-hdr">
          <div className="rln-q2-hdr-cell min">Smallest Integer</div>
          <div className="rln-q2-hdr-cell max">Largest Integer</div>
        </div>

        {rows.map((row, ri) => {
          const minKey = `${row.lbl}min`;
          const maxKey = `${row.lbl}max`;
          const minOpts = (shuf.q2min[row.lbl] || row.minOpts).map(v => ({
            id: String(v), label: fmt(v),
            state: q2St[`${minKey}-${v}`] || (q2Sel[minKey] === String(v) ? 'selected' : 'default'),
          }));
          const maxOpts = (shuf.q2max[row.lbl] || row.maxOpts).map(v => ({
            id: String(v), label: fmt(v),
            state: q2St[`${maxKey}-${v}`] || (q2Sel[maxKey] === String(v) ? 'selected' : 'default'),
          }));
          return (
            <div key={row.lbl} style={{
              background: ri % 2 === 0 ? '#F8FAFC' : '#fff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: '16px',
              marginBottom: 10,
            }}>
              {/* Question header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <LblCircle letter={row.lbl}/>
                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4 }}>
                  Rounds to{' '}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: '#1E40AF', color: '#fff',
                    borderRadius: 7, padding: '2px 10px',
                    fontSize: 19, fontWeight: 900, margin: '0 3px', verticalAlign: 'middle',
                  }}>{fmt(row.rounded)}</span>
                  {' '}(to the{' '}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: '#0F766E', color: '#fff',
                    borderRadius: 7, padding: '2px 10px',
                    fontSize: 17, fontWeight: 800, margin: '0 3px', verticalAlign: 'middle',
                  }}>{row.unit}</span>
                  )
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}>
                <div>
                  <div className="rln-q2-mob min">Smallest Integer</div>
                  <MCQOptions
                    options={minOpts}
                    onSelect={o => { if (!isPairDone) setQ2Sel(p => ({ ...p, [minKey]: o })); }}
                  />
                </div>
                <div>
                  <div className="rln-q2-mob max">Largest Integer</div>
                  <MCQOptions
                    options={maxOpts}
                    onSelect={o => { if (!isPairDone) setQ2Sel(p => ({ ...p, [maxKey]: o })); }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 14 }}>
          <CheckButton
            label={`✓ Check Questions ${pairLabel}`}
            onClick={() => checkQ2Pair(rows, gi)}
            disabled={isPairDone}
          />
          {q2FB[gi] && <FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text}/>}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <style>{LESSON_CSS}</style>
      <Header lessonChip="Unit 1 · Lesson 2 · Rounding Large Numbers" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Round large numbers to the nearest 100, 1,000 and 10,000. Find the smallest and largest integers that round to a given value."/>
        <ExplainPanel title="Key Concept: Rounding Large Numbers">
          <RuleBox>
            <strong>How to round:</strong> Look at the digit <em>immediately to the right</em> of the rounding position.<br/>
            If it is <strong>5 or more → round up</strong>. If it is <strong>4 or less → round down</strong>.<br/>
            All digits to the right of the rounding position become zero.<br/><br/>
            <strong>Example:</strong> 7,892,388 rounded to the nearest 1,000 → look at hundreds digit (3) → 3 &lt; 5 → round down → <strong>7,892,000</strong><br/><br/>
            <strong>Finding the range:</strong> For nearest 10,000, all integers within ±5,000 of the rounded value round to it.
            The smallest ends exactly at −5,000; the largest ends at −1 below +5,000.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* ── s1: Rows 1–4, two 2-row pairs ── */}
        <SectionCard badge={1}
          title="Round each number to the nearest 100, 1,000 and 10,000."
          tagType="mcq" tagLabel="MCQ"
          subtitle="Each pair of rows has its own Check button. The column headers above show exactly what to round to."
          score={prog.done['s1']}>
          {renderQ1Pair(Q1_G1A, 0, 's1', 0, 0)}
          <hr className="rln-divider"/>
          {renderQ1Pair(Q1_G1B, 2, 's1', 0, 1)}
        </SectionCard>

        {/* ── s2: Rows 5–8, two 2-row pairs ── */}
        <SectionCard badge={2}
          title="Continue rounding — numbers 5 to 8."
          tagType="mcq" tagLabel="MCQ"
          subtitle="These numbers have more digits. Each pair of rows has its own Check button."
          score={prog.done['s2']}>
          {renderQ1Pair(Q1_G2A, 4, 's2', 1, 0)}
          <hr className="rln-divider"/>
          {renderQ1Pair(Q1_G2B, 6, 's2', 1, 1)}
        </SectionCard>

        {/* ── s3: Q2 smallest / largest, two 2-question pairs ── */}
        <SectionCard badge={3}
          title="What is the smallest and largest integer that rounds to each value?"
          tagType="mcq" tagLabel="MCQ"
          subtitle="For each rounded value choose the smallest and largest possible integers. Each pair has its own Check button."
          score={prog.done['s3']}>
          {renderQ2Pair(Q2_G0, 0)}
          <hr className="rln-divider"/>
          {renderQ2Pair(Q2_G1, 1)}
        </SectionCard>

        {prog.allDone && (
          <Summary message="Excellent! You can round large numbers to the nearest 100, 1,000, and 10,000, and find the range of integers that round to any given value!"/>
        )}
      </div>
    </div>
  );
}

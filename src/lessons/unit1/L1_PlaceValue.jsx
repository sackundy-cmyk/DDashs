// ============================================================
//  lessons/unit1/L1_PlaceValue.jsx
//  Unit 1 · Lesson 1: Place Value in Decimals
//  6 sections:
//    s1 Place Value Table  (drag digits, tap cell to clear)
//    s2 Number Lines       (textbook ruler, 15 arrows, drag full decimal)
//    s3 Decimals in Words  (MCQ)
//    s4 Fractions→Decimals (textbook mixed-number cards, drag full decimal)
//    s5 Words→Decimals     (drag full decimal, 14 questions)
//    s6 Value of Red Digit (MCQ)
// ============================================================

import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, Frac, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Section 1: Place value table ─────────────────────────────
const PV_TABLE = [
  { lbl:'A', n:'37.28', tens:3, units:7, tenths:2, hundredths:8, guided:true  },
  { lbl:'B', n:'14.06', tens:1, units:4, tenths:0, hundredths:6, guided:true  },
  { lbl:'C', n:'82.50', tens:8, units:2, tenths:5, hundredths:0, guided:true  },
  { lbl:'D', n:'9.73',  tens:0, units:9, tenths:7, hundredths:3, guided:false },
  { lbl:'E', n:'46.01', tens:4, units:6, tenths:0, hundredths:1, guided:false },
  { lbl:'F', n:'70.85', tens:7, units:0, tenths:8, hundredths:5, guided:false },
  { lbl:'G', n:'13.40', tens:1, units:3, tenths:4, hundredths:0, guided:false },
  { lbl:'H', n:'5.92',  tens:0, units:5, tenths:9, hundredths:2, guided:false },
];

// ── Section 2: Number lines ───────────────────────────────────
// Three ruler-style number lines; each has multiple labelled arrows.
// Answers include the full decimal string as individual token arrays (with '.').
const LINES = [
  {
    lineId: 'L1', from: 0, to: 1, mid: 0.5,
    arrows: [
      { lbl:'a', pos:0.1,  ans:['0','.','1']       },
      { lbl:'b', pos:0.3,  ans:['0','.','3']       },
      { lbl:'c', pos:0.45, ans:['0','.','4','5']   },
      { lbl:'d', pos:0.7,  ans:['0','.','7']       },
      { lbl:'e', pos:0.9,  ans:['0','.','9']       },
    ],
  },
  {
    lineId: 'L2', from: 12, to: 13, mid: 12.5,
    arrows: [
      { lbl:'f', pos:12.1,  ans:['1','2','.','1']     },
      { lbl:'g', pos:12.3,  ans:['1','2','.','3']     },
      { lbl:'h', pos:12.5,  ans:['1','2','.','5']     },
      { lbl:'i', pos:12.65, ans:['1','2','.','6','5'] },
      { lbl:'j', pos:12.9,  ans:['1','2','.','9']     },
    ],
  },
  {
    lineId: 'L3', from: 47, to: 48, mid: 47.5,
    arrows: [
      { lbl:'k', pos:47.2,  ans:['4','7','.','2']     },
      { lbl:'l', pos:47.5,  ans:['4','7','.','5']     },
      { lbl:'m', pos:47.6,  ans:['4','7','.','6']     },
      { lbl:'n', pos:47.75, ans:['4','7','.','7','5'] },
      { lbl:'o', pos:47.9,  ans:['4','7','.','9']     },
    ],
  },
];

// ── Section 3: Decimals in words MCQ ─────────────────────────
const WORDS_Q = [
  { lbl:'a', dec:'0.6',  ans:'six tenths',              opts:['six tenths','six hundredths','six units','sixty'] },
  { lbl:'b', dec:'0.04', ans:'four hundredths',         opts:['four tenths','four hundredths','forty hundredths','four units'] },
  { lbl:'c', dec:'2.3',  ans:'two and three tenths',    opts:['two and three tenths','twenty-three tenths','two and three hundredths','two thirds'] },
  { lbl:'d', dec:'1.05', ans:'one and five hundredths', opts:['one and five tenths','one and fifty hundredths','one and five hundredths','fifteen hundredths'] },
  { lbl:'e', dec:'0.9',  ans:'nine tenths',             opts:['nine tenths','nine hundredths','nine units','ninety'] },
  { lbl:'f', dec:'0.42', ans:'forty-two hundredths',    opts:['four point two','forty-two tenths','forty-two hundredths','four and two hundredths'] },
  { lbl:'g', dec:'5.7',  ans:'five and seven tenths',   opts:['five and seven','fifty-seven tenths','five and seven hundredths','five and seven tenths'] },
  { lbl:'h', dec:'0.08', ans:'eight hundredths',        opts:['eight tenths','eighty hundredths','eight hundredths','eight units'] },
];

// ── Section 4: Write these as decimals (mixed numbers / fractions) ──
// whole=0 means it is a pure fraction (no whole-number part shown).
// ans = full decimal token array including '.'.
const FRAC_Q = [
  { lbl:'a', whole:9,  num:7,  den:10,  ans:['9','.','7']          }, // 9.7
  { lbl:'b', whole:12, num:1,  den:10,  ans:['1','2','.','1']      }, // 12.1
  { lbl:'c', whole:15, num:35, den:100, ans:['1','5','.','3','5']  }, // 15.35
  { lbl:'d', whole:27, num:9,  den:100, ans:['2','7','.','0','9']  }, // 27.09
  { lbl:'e', whole:0,  num:97, den:100, ans:['0','.','9','7']      }, // 0.97
  { lbl:'f', whole:11, num:47, den:100, ans:['1','1','.','4','7']  }, // 11.47
  { lbl:'g', whole:38, num:2,  den:100, ans:['3','8','.','0','2']  }, // 38.02
  { lbl:'h', whole:0,  num:5,  den:100, ans:['0','.','0','5']      }, // 0.05
];

// ── Section 5: Write as decimals (words) ─────────────────────
// Existing 6 + 8 new from screenshot.
// ans = full decimal token array including '.'.
const WORDS_TO_DEC = [
  { lbl:'a', words:'five tenths',                 ans:['0','.','5']         }, // 0.5
  { lbl:'b', words:'thirty-two hundredths',       ans:['0','.','3','2']     }, // 0.32
  { lbl:'c', words:'eight hundredths',            ans:['0','.','0','8']     }, // 0.08
  { lbl:'d', words:'two and seven tenths',        ans:['2','.','7']         }, // 2.7
  { lbl:'e', words:'four and fifteen hundredths', ans:['4','.','1','5']     }, // 4.15
  { lbl:'f', words:'one and three hundredths',    ans:['1','.','0','3']     }, // 1.03
  { lbl:'g', words:'9 tenths',                    ans:['0','.','9']         }, // 0.9
  { lbl:'h', words:'3 tenths',                    ans:['0','.','3']         }, // 0.3
  { lbl:'i', words:'45 hundredths',               ans:['0','.','4','5']     }, // 0.45
  { lbl:'j', words:'19 hundredths',               ans:['0','.','1','9']     }, // 0.19
  { lbl:'k', words:'8 tenths',                    ans:['0','.','8']         }, // 0.8
  { lbl:'l', words:'7 hundredths',                ans:['0','.','0','7']     }, // 0.07
  { lbl:'m', words:'87 hundredths',               ans:['0','.','8','7']     }, // 0.87
  { lbl:'n', words:'61 hundredths',               ans:['0','.','6','1']     }, // 0.61
];

// ── Section 6: Value of red digit MCQ ────────────────────────
const VALUE_QS = [
  { lbl:'a', num:'87.45',  redPos:'units',      ans:'7',     opts:['7','70','7/10','7/100'] },
  { lbl:'b', num:'13.7',   redPos:'tenths',     ans:'7/10',  opts:['70','7','7/10','7/100'] },
  { lbl:'c', num:'72.12',  redPos:'tens',       ans:'70',    opts:['70','7','7/10','7/100'] },
  { lbl:'d', num:'90.74',  redPos:'tenths',     ans:'7/10',  opts:['70','7','7/10','7/100'] },
  { lbl:'e', num:'36.27',  redPos:'hundredths', ans:'7/100', opts:['70','7','7/10','7/100'] },
  { lbl:'f', num:'47.19',  redPos:'units',      ans:'7',     opts:['70','7','7/10','7/100'] },
  { lbl:'g', num:'1.87',   redPos:'hundredths', ans:'7/100', opts:['70','7','7/10','7/100'] },
  { lbl:'h', num:'89.07',  redPos:'hundredths', ans:'7/100', opts:['70','7','7/10','7/100'] },
];

// ── Helpers ───────────────────────────────────────────────────
function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── FracCard: displays a mixed number / pure fraction in a big card ──
function FracCard({ whole, num, den }) {
  const color = '#7B2FA8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: '#F3E8FF', border: `2.5px solid ${color}`,
      borderRadius: 12, padding: '8px 16px',
      boxShadow: '0 2px 8px rgba(123,47,168,0.18)', verticalAlign: 'middle',
    }}>
      {whole > 0 && (
        <span style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{whole}</span>
      )}
      <Frac num={num} den={den} size={24} color={color} />
    </span>
  );
}

// ── NumLine: textbook ruler style with multiple green arrows ──
function NumLine({ from, to, mid, arrows }) {
  const W = 520, H = 88;
  const padL = 24, padR = 24;
  const innerW = W - padL - padR;
  const span = to - from;
  const xOf = v => padL + ((v - from) / span) * innerW;

  const RULER_TOP = 42;
  const BAR_H = 5;

  // 100 ticks (hundredths resolution)
  const TICKS = Array.from({ length: 101 }, (_, i) => ({
    x: xOf(from + (i / 100) * span),
    major: i % 10 === 0,
  }));

  const TIP_Y = RULER_TOP - 1; // arrowhead tip just above the ruler bar

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', maxWidth: 620, margin: '8px auto' }}
      aria-hidden="true"
    >
      {/* Ruler bar */}
      <rect x={padL} y={RULER_TOP} width={innerW} height={BAR_H} rx={2} fill="#B91C1C" />

      {/* Tick marks hanging below the bar */}
      {TICKS.map((t, i) => (
        <line
          key={i}
          x1={t.x} y1={RULER_TOP + BAR_H}
          x2={t.x} y2={RULER_TOP + BAR_H + (t.major ? 14 : 6)}
          stroke="#B91C1C"
          strokeWidth={t.major ? 2.5 : 0.8}
        />
      ))}

      {/* Labels below ticks */}
      <text x={xOf(from)} y={H - 3} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1E40AF">{from}</text>
      <text x={xOf(mid)}  y={H - 3} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1E40AF">{mid}</text>
      <text x={xOf(to)}   y={H - 3} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1E40AF">{to}</text>

      {/* Arrows pointing down from letter label to ruler */}
      {arrows.map(a => {
        const ax = xOf(a.pos);
        const LETTER_Y = 12;
        const SHAFT_END = TIP_Y - 8;
        return (
          <g key={a.lbl}>
            <text x={ax} y={LETTER_Y} textAnchor="middle" fontSize="12" fontWeight="900"
              fontStyle="italic" fill="#166534">{a.lbl}</text>
            <line x1={ax} y1={LETTER_Y + 3} x2={ax} y2={SHAFT_END}
              stroke="#166534" strokeWidth={1.5} />
            {/* Arrowhead pointing down */}
            <polygon
              points={`${ax},${TIP_Y} ${ax - 5},${TIP_Y - 8} ${ax + 5},${TIP_Y - 8}`}
              fill="#166534"
            />
          </g>
        );
      })}
    </svg>
  );
}

// Highlights the first '7' in a number string in red+bold (Section 6)
function HighlightSeven({ num }) {
  const idx = num.indexOf('7');
  if (idx < 0) return <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900 }}>{num}</span>;
  return (
    <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900 }}>
      {num.slice(0, idx)}
      <span style={{ color: 'var(--red)', fontSize: 26 }}>7</span>
      {num.slice(idx + 1)}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function L1_PlaceValue() {
  const cols = ['tens', 'units', 'tenths', 'hundredths'];
  const pvDInit = Object.fromEntries(PV_TABLE.map(r => [r.lbl, Object.fromEntries(cols.map(c => [c, '']))]));

  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(6, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // s1
  const pvD  = state.pvD  || pvDInit, setPvD  = setField('pvD',  pvDInit);
  const pvSt = state.pvSt || {},      setPvSt = setField('pvSt');
  const pvFB = state.pvFB ?? null,    setPvFB = setField('pvFB');

  // s2
  const s2D  = state.s2D  || {}, setS2D  = setField('s2D');
  const s2St = state.s2St || {}, setS2St = setField('s2St');
  const s2FB = state.s2FB || {}, setS2FB = setField('s2FB');

  // s3
  const s3Sel = state.s3Sel || {}, setS3Sel = setField('s3Sel');
  const s3St  = state.s3St  || {}, setS3St  = setField('s3St');
  const s3FB  = state.s3FB  || {}, setS3FB  = setField('s3FB');

  // s4
  const s4D  = state.s4D  || {}, setS4D  = setField('s4D');
  const s4St = state.s4St || {}, setS4St = setField('s4St');
  const s4FB = state.s4FB || {}, setS4FB = setField('s4FB');

  // s5
  const s5D  = state.s5D  || {}, setS5D  = setField('s5D');
  const s5St = state.s5St || {}, setS5St = setField('s5St');
  const s5FB = state.s5FB || {}, setS5FB = setField('s5FB');

  // s6
  const v7Sel = state.v7Sel || {}, setV7Sel = setField('v7Sel');
  const v7St  = state.v7St  || {}, setV7St  = setField('v7St');
  const v7FB  = state.v7FB  || {}, setV7FB  = setField('v7FB');

  // ── s1 check ─────────────────────────────────────────────────
  const checkPVTable = () => {
    increment('pvt'); const att = getAtt('pvt') + 1;
    let ok = 0, total = 0;
    const ns = {};
    PV_TABLE.forEach(r => {
      cols.forEach(c => {
        total++;
        const placed = parseInt(pvD[r.lbl][c]);
        if (placed === r[c]) { ns[`${r.lbl}-${c}`] = 'correct'; ok++; }
        else ns[`${r.lbl}-${c}`] = 'wrong';
      });
    });
    setPvSt(ns);
    if (ok === total) {
      setPvFB({ type: 'correct', text: `🎉 All ${total} cells correct!` });
      prog.markDone('s1', { correct: ok, total, attempts: att });
    } else if (att >= 3) { setPvFB({ type: 'hint', text: 'Keep trying! Ask your teacher if you need help.' }); }
    else if (att === 2)  { setPvFB({ type: 'hint', text: `💡 ${ok}/${total} correct. Tens left of units; tenths and hundredths after the point.` }); }
    else                 { setPvFB({ type: 'wrong', text: `✗ ${ok}/${total} correct. Check each column carefully.` }); }
  };

  // ── s2 helpers ───────────────────────────────────────────────
  const s2Drop = (lbl) => (raw) => {
    if (s2St[lbl] === 'correct') return;
    if (raw === 'del') setS2D(p => ({ ...p, [lbl]: (p[lbl] || []).slice(0, -1) }));
    else if (raw.startsWith('digit:')) {
      const d = raw.split(':')[1];
      setS2D(p => ({ ...p, [lbl]: [...(p[lbl] || []), d] }));
    }
  };
  const s2Remove = (lbl) => (idx) => {
    if (s2St[lbl] === 'correct') return;
    setS2D(p => { const a = [...(p[lbl] || [])]; a.splice(idx, 1); return { ...p, [lbl]: a }; });
  };
  const checkS2Line = (line) => {
    const { lineId, arrows } = line;
    increment(`s2${lineId}`); const att = getAtt(`s2${lineId}`) + 1;
    let ok = 0; const ns = { ...s2St };
    arrows.forEach(a => {
      const got = (s2D[a.lbl] || []).join('');
      if (got === a.ans.join('')) { ns[a.lbl] = 'correct'; ok++; }
      else {
        ns[a.lbl] = 'wrong';
        setTimeout(() => setS2St(p => { const x = { ...p }; if (x[a.lbl] === 'wrong') delete x[a.lbl]; return x; }), 1200);
      }
    });
    setS2St(ns);
    const total = arrows.length;
    let fb;
    if (ok === total)  fb = { type: 'correct', text: `🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',   text: `💡 ${ok}/${total} correct. Read the arrow tip — count small ticks from the nearest whole.` };
    else               fb = { type: 'wrong',   text: `✗ ${ok}/${total} correct. Each big tick = 0.1; each small tick = 0.01.` };
    setS2FB(p => ({ ...p, [lineId]: fb }));
    if (ok === total) {
      const newFB = { ...s2FB, [lineId]: fb };
      const correctLines = Object.values(newFB).filter(f => f.type === 'correct').length;
      if (correctLines >= LINES.length) {
        const totalQs = LINES.reduce((s, l) => s + l.arrows.length, 0);
        prog.markDone('s2', { correct: totalQs, total: totalQs, attempts: att });
      }
    }
  };

  // ── s3 check ─────────────────────────────────────────────────
  const s3Groups = grp(WORDS_Q, 2);
  const checkS3Group = (ga, gi) => {
    increment(`s3g${gi}`); const att = getAtt(`s3g${gi}`) + 1;
    let ok = 0; const ns = { ...s3St };
    ga.forEach(q => {
      const sel = s3Sel[q.lbl];
      if (sel === q.ans) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else if (sel)      { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setS3St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type: 'correct', text: `🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',   text: `💡 ${ok}/${total} correct. 1st decimal place = tenths, 2nd = hundredths.` };
    else               fb = { type: 'wrong',   text: '✗ Read each digit\'s place after the decimal point.' };
    setS3FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const correctGroups = Object.values({ ...s3FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= s3Groups.length) prog.markDone('s3', { correct: WORDS_Q.length, total: WORDS_Q.length, attempts: att });
    }
  };

  // ── s4 helpers ───────────────────────────────────────────────
  const s4Groups = grp(FRAC_Q, 4);
  const s4Drop = (lbl) => (raw) => {
    if (s4St[lbl] === 'correct') return;
    if (raw === 'del') setS4D(p => ({ ...p, [lbl]: (p[lbl] || []).slice(0, -1) }));
    else if (raw.startsWith('digit:')) {
      const d = raw.split(':')[1];
      setS4D(p => ({ ...p, [lbl]: [...(p[lbl] || []), d] }));
    }
  };
  const s4Remove = (lbl) => (idx) => {
    if (s4St[lbl] === 'correct') return;
    setS4D(p => { const a = [...(p[lbl] || [])]; a.splice(idx, 1); return { ...p, [lbl]: a }; });
  };
  const checkS4Group = (grpData, gi) => {
    increment(`s4g${gi}`); const att = getAtt(`s4g${gi}`) + 1;
    let ok = 0; const ns = { ...s4St };
    grpData.forEach(q => {
      const got = (s4D[q.lbl] || []).join('');
      if (got === q.ans.join('')) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS4St(p => { const x = { ...p }; if (x[q.lbl] === 'wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS4St(ns);
    const total = grpData.length;
    let fb;
    if (ok === total)  fb = { type: 'correct', text: `🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',   text: `💡 ${ok}/${total} correct. /10 → 1 dp, /100 → 2 dp. Pad zeros if needed (e.g. 9/100 = 0.09).` };
    else               fb = { type: 'wrong',   text: `✗ ${ok}/${total} correct. Match the denominator to the number of decimal places.` };
    setS4FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const correctGroups = Object.values({ ...s4FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= s4Groups.length) prog.markDone('s4', { correct: FRAC_Q.length, total: FRAC_Q.length, attempts: att });
    }
  };

  // ── s5 helpers ───────────────────────────────────────────────
  const s5Groups = grp(WORDS_TO_DEC, 4);
  const s5Drop = (lbl) => (raw) => {
    if (s5St[lbl] === 'correct') return;
    if (raw === 'del') setS5D(p => ({ ...p, [lbl]: (p[lbl] || []).slice(0, -1) }));
    else if (raw.startsWith('digit:')) {
      const d = raw.split(':')[1];
      setS5D(p => ({ ...p, [lbl]: [...(p[lbl] || []), d] }));
    }
  };
  const s5Remove = (lbl) => (idx) => {
    if (s5St[lbl] === 'correct') return;
    setS5D(p => { const a = [...(p[lbl] || [])]; a.splice(idx, 1); return { ...p, [lbl]: a }; });
  };
  const checkS5Group = (grpData, gi) => {
    increment(`s5g${gi}`); const att = getAtt(`s5g${gi}`) + 1;
    let ok = 0; const ns = { ...s5St };
    grpData.forEach(q => {
      const got = (s5D[q.lbl] || []).join('');
      if (got === q.ans.join('')) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS5St(p => { const x = { ...p }; if (x[q.lbl] === 'wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS5St(ns);
    const total = grpData.length;
    let fb;
    if (ok === total)  fb = { type: 'correct', text: `🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',   text: `💡 ${ok}/${total} correct. Drag the decimal point too — "five tenths" = 0 . 5.` };
    else               fb = { type: 'wrong',   text: '✗ Re-read the words: tenths → 1 dp, hundredths → 2 dp. Remember to drag the decimal point.' };
    setS5FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const correctGroups = Object.values({ ...s5FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= s5Groups.length) prog.markDone('s5', { correct: WORDS_TO_DEC.length, total: WORDS_TO_DEC.length, attempts: att });
    }
  };

  // ── s6 check ─────────────────────────────────────────────────
  const v7Groups = grp(VALUE_QS, 3);
  const checkV7Group = (ga, gi) => {
    increment(`v7g${gi}`); const att = getAtt(`v7g${gi}`) + 1;
    let ok = 0; const ns = { ...v7St };
    ga.forEach(q => {
      const sel = v7Sel[q.lbl];
      if (sel === q.ans) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else if (sel)      { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setV7St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type: 'correct', text: `🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint',   text: `💡 ${ok}/${total} correct. Count decimal places: 1st dp = tenths, 2nd dp = hundredths.` };
    else               fb = { type: 'wrong',   text: '✗ Check which decimal place the red digit is in.' };
    setV7FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const correctGroups = Object.values({ ...v7FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= v7Groups.length) prog.markDone('s6', { correct: VALUE_QS.length, total: VALUE_QS.length, attempts: att });
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 1" completed={prog.completedCount} total={6} />
      <div className="page">
        <ObjectiveCard text="Read, write and identify digits in decimal numbers up to hundredths" />
        <ExplainPanel title="Key Concept: Place Value in Decimals">
          <RuleBox>
            Every digit has a <strong>place value</strong>. The decimal point separates whole numbers from parts of a whole.<br />
            <strong>37.28</strong>: Tens=3, Units=7, Tenths=2 (=2/10), Hundredths=8 (=8/100)
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={6} />

        {/* ── s1: place value table ─────────────────────────────── */}
        <SectionCard badge={1} title="Copy and complete this place-value chart" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digit cards into the empty cells. Tap a filled cell to clear it. ★ Guided rows A–C"
          score={prog.done['s1']}>
          <DigitPalette paletteId="pvpal" />
          <div style={{ overflowX: 'auto', marginBottom: 14 }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--border)', minWidth: 500, width: '100%' }}>
              <thead>
                <tr>
                  {['Number', 'Tens', 'Units', '.', 'Tenths', 'Hundredths'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', textAlign: 'center', background: 'var(--blue-light)', fontSize: 13, fontWeight: 800, borderBottom: '2px solid var(--border)', color: h === 'Tens' ? '#1E40AF' : h === 'Units' ? '#065F46' : h === 'Tenths' ? '#92400E' : h === 'Hundredths' ? '#9D174D' : 'var(--text)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PV_TABLE.map(r => (
                  <tr key={r.lbl}>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: 16, background: r.guided ? '#FFFBEB' : '#F8FAFF', border: '1px solid var(--border)' }}>{r.n}</td>
                    {(() => {
                      const cells = [];
                      cols.forEach((c, ci) => {
                        const st  = pvSt[`${r.lbl}-${c}`];
                        const val = pvD[r.lbl][c];
                        const bg  = st === 'correct' ? 'var(--green-bg)' : st === 'wrong' ? 'var(--red-bg)' : '#fff';
                        const bd  = st === 'correct' ? '2px solid var(--green)' : st === 'wrong' ? '2px solid var(--red)' : '1px solid var(--border)';
                        const locked = st === 'correct';
                        cells.push(
                          <td key={c} style={{ padding: 4, textAlign: 'center', background: bg, border: bd }}>
                            <input
                              type="text"
                              maxLength={1}
                              value={val}
                              readOnly
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => {
                                e.preventDefault();
                                if (locked) return;
                                try {
                                  const d = e.dataTransfer.getData('text/plain');
                                  if (d.startsWith('digit:')) {
                                    const v = d.split(':')[1];
                                    setPvD(p => ({ ...p, [r.lbl]: { ...p[r.lbl], [c]: v } }));
                                  }
                                } catch {}
                              }}
                              onClick={() => {
                                if (!locked && val) {
                                  setPvD(p => ({ ...p, [r.lbl]: { ...p[r.lbl], [c]: '' } }));
                                }
                              }}
                              title={!locked && val ? 'Tap to clear' : ''}
                              style={{
                                width: 40, height: 36,
                                textAlign: 'center', fontWeight: 900, fontSize: 18,
                                border: 'none', background: 'transparent',
                                cursor: locked ? 'default' : val ? 'pointer' : 'default',
                                color: st === 'correct' ? 'var(--green)' : st === 'wrong' ? 'var(--red)' : 'var(--text)',
                              }}
                            />
                          </td>
                        );
                        if (ci === 1) {
                          cells.push(
                            <td key="dp" style={{ padding: '8px', textAlign: 'center', background: '#F8FAFF', border: '1px solid var(--border)', fontWeight: 900, color: 'var(--muted)' }}>.</td>
                          );
                        }
                      });
                      return cells;
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CheckButton label="✓ Check All Answers" onClick={checkPVTable} disabled={prog.done['s1']} />
          {pvFB && <FeedbackBox type={pvFB.type} message={pvFB.text} />}
        </SectionCard>

        {/* ── s2: number lines ─────────────────────────────────── */}
        <SectionCard badge={2} title="Write the decimal number each arrow points to" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digit cards — including the decimal point — to write each answer."
          score={prog.done['s2']}>
          {LINES.map((line, li) => (
            <QGroup key={line.lineId} title={`Number Line ${li + 1}  —  Questions ${line.arrows.map(a => a.lbl).join(', ')}`}>
              <NumLine from={line.from} to={line.to} mid={line.mid} arrows={line.arrows} />
              <DigitPalette paletteId={`s2pal_${line.lineId}`} />
              {line.arrows.map((a, ai) => (
                <QItem key={a.lbl} last={ai === line.arrows.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={a.lbl} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>arrow points to</span>
                    <DigitDropZone
                      digits={s2D[a.lbl] || []}
                      zoneState={s2St[a.lbl] || 'default'}
                      onDrop={s2Drop(a.lbl)}
                      onRemove={s2Remove(a.lbl)}
                    />
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${line.arrows.map(a => a.lbl).join(', ')}`}
                onClick={() => checkS2Line(line)}
                disabled={prog.done['s2']}
              />
              {s2FB[line.lineId] && <FeedbackBox type={s2FB[line.lineId].type} message={s2FB[line.lineId].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s3: decimals in words ─────────────────────────────── */}
        <SectionCard badge={3} title="Choose the words that match each decimal" tagType="mcq" tagLabel="MCQ"
          subtitle="Pick the correct word form for each decimal number. Check after each pair."
          score={prog.done['s3']}>
          {s3Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const opts = q.opts.map(o => ({ id: o, label: o, state: s3St[`${q.lbl}-${o}`] || (s3Sel[q.lbl] === o ? 'selected' : 'default') }));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    <QItemLabel>
                      <LblCircle letter={q.lbl} />
                      <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--blue)', fontFamily: 'monospace' }}>{q.dec}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>=</span>
                    </QItemLabel>
                    <MCQOptions options={opts} onSelect={o => setS3Sel(p => ({ ...p, [q.lbl]: o }))} />
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS3Group(ga, gi)} disabled={prog.done['s3']} />
              {s3FB[gi] && <FeedbackBox type={s3FB[gi].type} message={s3FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s4: write fractions as decimals ──────────────────── */}
        <SectionCard badge={4} title="Write these as decimals" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag all digits and the decimal point to write each mixed number as a decimal."
          score={prog.done['s4']}>
          {s4Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              <DigitPalette paletteId={`s4pal_${gi}`} />
              {ga.map((q, qi) => (
                <QItem key={q.lbl} last={qi === ga.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={q.lbl} />
                    <FracCard whole={q.whole} num={q.num} den={q.den} />
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 4px' }}>=</span>
                    <DigitDropZone
                      digits={s4D[q.lbl] || []}
                      zoneState={s4St[q.lbl] || 'default'}
                      onDrop={s4Drop(q.lbl)}
                      onRemove={s4Remove(q.lbl)}
                    />
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(', ')}`} onClick={() => checkS4Group(ga, gi)} disabled={prog.done['s4']} />
              {s4FB[gi] && <FeedbackBox type={s4FB[gi].type} message={s4FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s5: words to decimals ─────────────────────────────── */}
        <SectionCard badge={5} title="Write these as decimals" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag all digits and the decimal point to convert each amount into a decimal number."
          score={prog.done['s5']}>
          {s5Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              <DigitPalette paletteId={`s5pal_${gi}`} />
              {ga.map((q, qi) => (
                <QItem key={q.lbl} last={qi === ga.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={q.lbl} />
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{q.words}</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>=</span>
                    <DigitDropZone
                      digits={s5D[q.lbl] || []}
                      zoneState={s5St[q.lbl] || 'default'}
                      onDrop={s5Drop(q.lbl)}
                      onRemove={s5Remove(q.lbl)}
                    />
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(', ')}`} onClick={() => checkS5Group(ga, gi)} disabled={prog.done['s5']} />
              {s5FB[gi] && <FeedbackBox type={s5FB[gi].type} message={s5FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s6: value of red digit ────────────────────────────── */}
        <SectionCard badge={6} title="What is the value of the highlighted digit?" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the correct value for the red digit in each number."
          score={prog.done['s6']}>
          {v7Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              {ga.map((q, qi) => {
                const opts = q.opts.map(o => ({ id: o, label: o, state: v7St[`${q.lbl}-${o}`] || (v7Sel[q.lbl] === o ? 'selected' : 'default') }));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    <QItemLabel>
                      <LblCircle letter={q.lbl} />
                      <span style={{ fontSize: 17, fontWeight: 700 }}>Value of the red digit in</span>
                      <HighlightSeven num={q.num} />
                    </QItemLabel>
                    <MCQOptions options={opts} onSelect={o => setV7Sel(p => ({ ...p, [q.lbl]: o }))} />
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(', ')}`} onClick={() => checkV7Group(ga, gi)} disabled={prog.done['s6']} />
              {v7FB[gi] && <FeedbackBox type={v7FB[gi].type} message={v7FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Brilliant! You can read, write and identify decimal place values up to hundredths!" />}
      </div>
    </div>
  );
}

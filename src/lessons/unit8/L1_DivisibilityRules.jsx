// ============================================================
//  lessons/unit8/L1_DivisibilityRules.jsx
//  Unit 8 · Lesson 1: Rules of Divisibility
//  s1: Which of {2–10} divide each number exactly?
//      8 questions (a–h), click to select chips, checked in pairs
// ============================================================

import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Question data ──────────────────────────────────────────────
const DIVISORS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const QS = [
  { lbl:'a', num:'1 468',    correct:[2,4]              },
  { lbl:'b', num:'2 745',    correct:[3,5,9]            },
  { lbl:'c', num:'6 102',    correct:[2,3,6,9]          },
  { lbl:'d', num:'24 096',   correct:[2,3,4,6,8]        },
  { lbl:'e', num:'252 252',  correct:[2,3,4,6,7,9]      },
  { lbl:'f', num:'456 030',  correct:[2,3,5,6,9,10]     },
  { lbl:'g', num:'313 470',  correct:[2,3,5,6,9,10]     },
  { lbl:'h', num:'151 200',  correct:[2,3,4,5,6,7,8,9,10] },
];

const PAIRS = [
  [QS[0], QS[1]],
  [QS[2], QS[3]],
  [QS[4], QS[5]],
  [QS[6], QS[7]],
];

// ── Clickable divisor chip ─────────────────────────────────────
function DivisorChip({ value, chipState, onClick }) {
  const style = {
    default:  { background:'#F1F5F9', border:'2.5px solid #CBD5E1', color:'#475569' },
    selected: { background:'#1E40AF', border:'2.5px solid #1E3A8A', color:'#fff'    },
    correct:  { background:'#16A34A', border:'2.5px solid #15803D', color:'#fff'    },
    wrong:    { background:'#DC2626', border:'2.5px solid #B91C1C', color:'#fff'    },
  }[chipState] || { background:'#F1F5F9', border:'2.5px solid #CBD5E1', color:'#475569' };

  const locked = chipState === 'correct';

  return (
    <button
      onClick={locked ? undefined : onClick}
      style={{
        width: 50, height: 50,
        ...style,
        borderRadius: 10, fontSize: 20, fontWeight: 900,
        cursor: locked ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.12s, border-color 0.12s',
        userSelect: 'none',
        flexShrink: 0,
      }}>
      {value}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
export default function L1_DivisibilityRules() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(1, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // sel[lbl]   = array of selected divisors, e.g. { a:[2,4], b:[] }
  // grpFB[gi]  = feedback per pair index 0–3
  const sel   = state.sel   || {}, setSel   = setField('sel');
  const grpFB = state.grpFB || {}, setGrpFB = setField('grpFB');

  // ── Chip visual state (computed) ───────────────────────────
  function getChipState(lbl, divisor, gi) {
    const isSelected   = (sel[lbl] || []).includes(divisor);
    const wasChecked   = !!grpFB[gi];

    if (!wasChecked) return isSelected ? 'selected' : 'default';

    const q = QS.find(x => x.lbl === lbl);
    const isCorrectDiv = q.correct.includes(divisor);

    if (isSelected && isCorrectDiv)  return 'correct';   // green, locked
    if (isSelected && !isCorrectDiv) return 'wrong';     // red, can deselect
    return 'default';                                     // missing: not revealed
  }

  // ── Toggle a chip ──────────────────────────────────────────
  const toggle = (lbl, divisor, gi) => {
    if (grpFB[gi]?.type === 'correct') return;  // pair done, fully locked
    // lock correctly-placed chips from previous check
    if (grpFB[gi]) {
      const q = QS.find(x => x.lbl === lbl);
      if (q.correct.includes(divisor) && (sel[lbl] || []).includes(divisor)) return;
    }
    setSel(p => {
      const curr = p[lbl] || [];
      const next = curr.includes(divisor)
        ? curr.filter(d => d !== divisor)
        : [...curr, divisor];
      return { ...p, [lbl]: next };
    });
  };

  // ── Check a pair ───────────────────────────────────────────
  const checkPair = (pair, gi) => {
    increment(`grp${gi}`);
    const att = getAtt(`grp${gi}`) + 1;

    // compute ok BEFORE setState
    let ok = 0;
    pair.forEach(q => {
      const chosen  = (sel[q.lbl] || []).slice().sort((a, b) => a - b);
      const correct = [...q.correct].sort((a, b) => a - b);
      const match   = chosen.length === correct.length && correct.every((d, i) => d === chosen[i]);
      if (match) ok++;
    });

    const total = pair.length;
    let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct! Well done — you identified all the divisors.` };
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Review: digit sum for 3 and 9 · last digit for 2, 5, 10 · last 2 digits for 4 · last 3 digits for 8 · divisible by both 2 and 3 for 6.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Check how many divisors each number should have — you may be missing some or have selected an extra one.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Apply the divisibility rule for each number from 2 to 10 in turn.` };
    }

    const merged = { ...grpFB, [gi]: fb };
    setGrpFB(merged);

    if (ok === total) {
      const allDone = PAIRS.every((_, idx) => merged[idx]?.type === 'correct');
      if (allDone) prog.markDone('s1', { correct: QS.length, total: QS.length, attempts: att });
    }
  };

  // ── Render one question ────────────────────────────────────
  function renderQuestion(q, gi, isLast) {
    const pairDone = grpFB[gi]?.type === 'correct';
    return (
      <QItem key={q.lbl} last={isLast}>
        <QItemLabel>
          <LblCircle letter={q.lbl}/>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1E3A8A' }}>
            {q.num} is divisible by
          </span>
        </QItemLabel>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          marginTop: 10, paddingLeft: 52,
        }}>
          {DIVISORS.map(d => (
            <DivisorChip
              key={d}
              value={d}
              chipState={getChipState(q.lbl, d, gi)}
              onClick={() => !pairDone && toggle(q.lbl, d, gi)}
            />
          ))}
        </div>
        {/* show count of selected */}
        <div style={{
          marginTop: 6, paddingLeft: 52,
          fontSize: 13, fontWeight: 700, color: '#64748B',
        }}>
          {(sel[q.lbl] || []).length} selected
        </div>
      </QItem>
    );
  }

  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 2 · Lesson 1 · Rules of Divisibility" completed={prog.completedCount} total={1}/>
      <div className="page">
        <ObjectiveCard text="Use divisibility rules to identify which numbers from 2 to 10 divide exactly into larger numbers"/>
        <ExplainPanel title="Divisibility Rules — Quick Reference">
          <RuleBox>
            <strong>÷ 2:</strong> last digit is even (0, 2, 4, 6, 8)<br/>
            <strong>÷ 3:</strong> digit sum is divisible by 3<br/>
            <strong>÷ 4:</strong> last two digits form a number divisible by 4<br/>
            <strong>÷ 5:</strong> last digit is 0 or 5<br/>
            <strong>÷ 6:</strong> divisible by both 2 and 3<br/>
            <strong>÷ 7:</strong> no simple rule — divide and check<br/>
            <strong>÷ 8:</strong> last three digits form a number divisible by 8<br/>
            <strong>÷ 9:</strong> digit sum is divisible by 9<br/>
            <strong>÷ 10:</strong> last digit is 0
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={1}/>

        <SectionCard badge={1}
          title="Write the numbers 2, 3, 4, 5, 6, 7, 8, 9 or 10 that divide exactly into each number."
          tagType="mcq" tagLabel="Click to Select"
          subtitle="Click the number chips to select divisors. Click again to deselect. Green chips are locked correct. Check each pair when ready."
          score={prog.done['s1']}>

          {PAIRS.map((pair, gi) => (
            <QGroup key={gi} title={`Questions ${pair.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {pair.map((q, qi) => renderQuestion(q, gi, qi === pair.length - 1))}
              <CheckButton
                label={`✓ Check ${pair.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkPair(pair, gi)}
                disabled={!!prog.done['s1']}
              />
              {grpFB[gi] && <FeedbackBox type={grpFB[gi].type} message={grpFB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && (
          <Summary message="Excellent! You can apply divisibility rules to identify all divisors from 2 to 10!"/>
        )}
      </div>
    </div>
  );
}

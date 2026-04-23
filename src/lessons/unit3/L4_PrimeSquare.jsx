// ============================================================
//  lessons/unit3/L4_PrimeSquare.jsx
//  Unit 3 · Lesson 4: Prime & Square Numbers
//  Q1: 100-grid tap   Q2: squared number drag   Q3: not-square tap
// ============================================================

import React, { useState, useCallback } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack, GuidedHint,
         FeedbackBox, LblCircle, NumChip, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import NumberGrid100 from '../../components/interactions/NumberGrid100.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useDigitZone } from '../../hooks/useDigitZone.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

const SQUARES = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

// ── Q2 data ──
const Q2_DATA = [
  { lbl: 'a', expr: '3²',  ans: 9,   guided: true,  hint: '3 squared means 3 × 3. What does 3 × 3 equal?' },
  { lbl: 'b', expr: '10²', ans: 100, guided: true,  hint: '10 squared means 10 × 10.' },
  { lbl: 'c', expr: '4²',  ans: 16,  guided: false },
  { lbl: 'd', expr: '9²',  ans: 81,  guided: false },
  { lbl: 'e', expr: '6²',  ans: 36,  guided: false },
  { lbl: 'f', expr: '2²',  ans: 4,   guided: false },
  { lbl: 'g', expr: '5²',  ans: 25,  guided: false },
  { lbl: 'h', expr: '7²',  ans: 49,  guided: false },
  { lbl: 'i', expr: '8²',  ans: 64,  guided: false },
  { lbl: 'j', expr: '1²',  ans: 1,   guided: false },
];

// ── Q3 data ──
const Q3_DATA = [
  { lbl: 'a', nums: [36, 24, 16, 64] },
  { lbl: 'b', nums: [25, 81, 9,  15] },
  { lbl: 'c', nums: [1, 100, 46,  4] },
  { lbl: 'd', nums: [18,  49,  9, 81] },
  { lbl: 'e', nums: [36,   6,  4, 64] },
  { lbl: 'f', nums: [49,   9, 39, 100] },
];

function group(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export default function L4_PrimeSquare() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();
  const dz = useDigitZone();

  // ── Q2 state ──
  const q2Placed = state.q2Placed || {}, setQ2Placed = setField('q2Placed');
  const q2States = state.q2States || {}, setQ2States = setField('q2States');
  const q2FB     = state.q2FB     || {}, setQ2FB     = setField('q2FB');

  // ── Q3 state ──
  const q3Tapped = state.q3Tapped || {}, setQ3Tapped = setField('q3Tapped'); // lbl → num[]
  const q3States = state.q3States || {}, setQ3States = setField('q3States');
  const q3FB     = state.q3FB     || {}, setQ3FB     = setField('q3FB');

  // ── Q2 helpers ──
  const q2Digits = (lbl) => q2Placed[lbl] || [];
  const q2Val    = (lbl) => {
    const d = q2Digits(lbl);
    return d.length ? parseInt(d.join(''), 10) : null;
  };
  const q2Drop = (lbl) => (raw) => {
    if (q2States[lbl] === 'correct') return;
    if (raw === 'del') {
      setQ2Placed(p => ({ ...p, [lbl]: (p[lbl] || []).slice(0, -1) }));
    } else if (raw.startsWith('digit:')) {
      const d = raw.split(':')[1];
      setQ2Placed(p => ({ ...p, [lbl]: [...(p[lbl] || []), d] }));
    }
  };
  const q2Remove = (lbl) => (idx) => {
    if (q2States[lbl] === 'correct') return;
    setQ2Placed(p => { const arr = [...(p[lbl] || [])]; arr.splice(idx, 1); return { ...p, [lbl]: arr }; });
  };

  const checkQ2Group = (grp, gi) => {
    increment(`q2g${gi}`);
    const att = getAtt(`q2g${gi}`) + 1;
    let correct = 0;
    const newStates = { ...q2States };
    grp.forEach(q => {
      const val = q2Val(q.lbl);
      if (val === q.ans) { newStates[q.lbl] = 'correct'; correct++; }
      else {
        newStates[q.lbl] = 'wrong';
        setTimeout(() => setQ2States(p => {
          const s = { ...p }; if (s[q.lbl] === 'wrong') delete s[q.lbl]; return s;
        }), 1200);
      }
    });
    setQ2States(newStates);
    const total = grp.length;
    let fb;
    if (correct === total)   fb = { type: 'correct', text: `🎉 ${correct}/${total} correct!` };
    else if (att >= 3)       fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)      fb = { type: 'hint',    text: `💡 ${correct}/${total} correct. Multiply the number by itself!` };
    else                     fb = { type: 'wrong',   text: `✗ ${correct}/${total} correct. Check: n × n = ?` };
    setQ2FB(p => ({ ...p, [gi]: fb }));

    if (correct === total) {
      // Check if all groups done
      const allGroups = group(Q2_DATA, 2);
      const newFBCount = Object.keys({ ...q2FB, [gi]: fb }).length;
      if (newFBCount >= allGroups.length) {
        const totalCorrect = Object.values({ ...q2States, ...newStates }).filter(s => s === 'correct').length;
        prog.markDone('s2', `${totalCorrect}/${Q2_DATA.length} ✓`);
      }
    }
  };

  // ── Q3 helpers ──
  const toggleQ3 = (lbl, num) => {
    if (['correct-tap', 'reveal-tap', 'is-square'].includes(q3States[`${lbl}-${num}`])) return;
    setQ3Tapped(p => {
      const arr = p[lbl] || [];
      const next = arr.includes(num) ? arr.filter(x => x !== num) : [...arr, num];
      return { ...p, [lbl]: next };
    });
  };

  const checkQ3Group = (grp, gi) => {
    increment(`q3g${gi}`);
    const att = getAtt(`q3g${gi}`) + 1;
    let correct = 0;
    const newStates = { ...q3States };
    grp.forEach(q => {
      const notSq = q.nums.filter(n => !SQUARES.includes(n));
      const tapped = q3Tapped[q.lbl] || [];
      const allCorrect =
        notSq.every(n => tapped.includes(n)) &&
        tapped.every(n => notSq.includes(n));
      q.nums.forEach(n => {
        const isNS = notSq.includes(n), wasTapped = tapped.includes(n);
        if (allCorrect) newStates[`${q.lbl}-${n}`] = isNS ? 'correct-tap' : 'is-square';
        else if (wasTapped && isNS)  newStates[`${q.lbl}-${n}`] = 'correct-tap';
        else if (wasTapped && !isNS) newStates[`${q.lbl}-${n}`] = 'wrong-tap';
        else if (!wasTapped && !isNS) newStates[`${q.lbl}-${n}`] = 'is-square';
      });
      if (allCorrect) correct++;
    });
    setQ3States(newStates);
    const total = grp.length;
    let fb;
    if (correct === total)  fb = { type: 'correct', text: `🎉 ${correct}/${total} correct! You spotted all non-square numbers!` };
    else if (att >= 3)      fb = { type: 'hint',    text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)     fb = { type: 'hint',    text: `💡 ${correct}/${total} correct. Is the number in the list 1,4,9,16,25,36,49,64,81,100?` };
    else                    fb = { type: 'wrong',   text: '✗ Tap any number NOT in the square numbers list.' };
    setQ3FB(p => ({ ...p, [gi]: fb }));
    if (correct === total) {
      const allDone = Object.keys({ ...q3FB, [gi]: fb }).length >= group(Q3_DATA, 2).length;
      if (allDone) prog.markDone('s3', '✓');
    }
  };

  const q3TapStyle = (lbl, num) => {
    const state = q3States[`${lbl}-${num}`];
    const tapped = (q3Tapped[lbl] || []).includes(num);
    if (state === 'correct-tap') return { border: '2.5px solid var(--green)', bg: 'var(--green-bg)', color: 'var(--green)' };
    if (state === 'wrong-tap')   return { border: '2.5px solid var(--red)',   bg: 'var(--red-bg)',   color: 'var(--red)'   };
    if (state === 'reveal-tap')  return { border: '2.5px dashed var(--green)',bg: 'var(--green-bg)', color: 'var(--green)' };
    if (state === 'is-square')   return { border: '2.5px solid #D4C990',      bg: '#FEFCE8',         color: '#9CA3AF'      };
    if (tapped)                  return { border: '2.5px solid var(--red)',   bg: 'var(--red-bg)',   color: 'var(--red)'   };
    return { border: '2.5px solid var(--border)', bg: '#fff', color: 'var(--text)' };
  };

  const q2GroupData = group(Q2_DATA, 2);
  const q3GroupData = group(Q3_DATA, 2);

  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 3 · Lesson 4" completed={prog.completedCount} total={3} />
      <div className="page">
        <ObjectiveCard text="Identify prime numbers up to 100, calculate square numbers, and spot non-square numbers" />
        <ExplainPanel title="Key Concepts">
          <RuleBox>
            <strong>Prime number:</strong> Has exactly 2 factors — 1 and itself. (2, 3, 5, 7, 11…)<br />
            ⚠️ <strong>1 is NOT prime.</strong> <strong>2 is the only even prime.</strong><br /><br />
            <strong>Square number:</strong> A whole number × itself. (e.g. 6 × 6 = 6² = <strong>36</strong>)<br />
            Squares up to 100: <strong>1, 4, 9, 16, 25, 36, 49, 64, 81, 100</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3} />

        {/* Q1 */}
        <SectionCard badge={1} title="Tap all the prime numbers in the 100 square" tagType="tap" tagLabel="Tap to Select"
          subtitle="Tap a number to highlight it purple. Tap again to deselect. Press Check when ready."
          score={prog.done['s1']?.score}>
          <NumberGrid100 onComplete={({ correct, total }) => prog.markDone('s1', `${correct}/${total} ✓`)} />
        </SectionCard>

        {/* Q2 */}
        <SectionCard badge={2} title="Work out the squared numbers" tagType="drag" tagLabel="Drag & Drop"
          subtitle="Drag digit cards to build your answer. Check after each pair. ★ Guided: a & b"
          score={prog.done['s2']?.score}>
          {q2GroupData.map((grp, gi) => {
            const palId = `q2pal_${gi}`;
            return (
              <QGroup key={gi} title={`Questions ${grp.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
                <DigitPalette paletteId={palId} />
                {grp.map((q, qi) => (
                  <QItem key={q.lbl} last={qi === grp.length - 1}>
                    {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel>
                      <LblCircle letter={q.lbl} />
                      <span style={{ fontSize: 24, fontWeight: 900 }}>
                        {q.expr.replace('²', '')}
                        <sup style={{ fontSize: 15, color: 'var(--blue)' }}>2</sup>
                        {' '}=
                      </span>
                      <DigitDropZone
                        digits={q2Digits(q.lbl)}
                        zoneState={q2States[q.lbl] || 'default'}
                        onDrop={q2Drop(q.lbl)}
                        onRemove={q2Remove(q.lbl)}
                      />
                    </QItemLabel>
                  </QItem>
                ))}
                <CheckButton
                  label={`✓ Check ${grp.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                  onClick={() => checkQ2Group(grp, gi)}
                  disabled={prog.done['s2']}
                />
                {q2FB[gi] && <FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text} />}
              </QGroup>
            );
          })}
        </SectionCard>

        {/* Q3 */}
        <SectionCard badge={3} title="Tap the numbers that are NOT square numbers" tagType="tap" tagLabel="Tap to Select"
          subtitle="Each row shows 4 numbers. Tap the one(s) NOT in the square numbers list. Check after each pair."
          score={prog.done['s3']?.score}>
          {q3GroupData.map((grp, gi) => (
            <QGroup key={gi} title={`Questions ${grp.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {grp.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grp.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={q.lbl} />
                    <span style={{ fontSize: 18, fontWeight: 800 }}>Which is NOT a square number?</span>
                  </QItemLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {q.nums.map(n => {
                      const ts = q3TapStyle(q.lbl, n);
                      const locked = ['correct-tap', 'reveal-tap', 'is-square'].includes(q3States[`${q.lbl}-${n}`]);
                      return (
                        <div
                          key={n}
                          onClick={() => !locked && toggleQ3(q.lbl, n)}
                          style={{
                            background: ts.bg, border: ts.border, color: ts.color,
                            borderRadius: 12, padding: '12px 22px',
                            fontSize: 24, fontWeight: 900,
                            cursor: locked ? 'default' : 'pointer',
                            transition: 'all .15s', userSelect: 'none',
                          }}
                        >
                          {n}
                        </div>
                      );
                    })}
                  </div>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grp.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ3Group(grp, gi)}
              />
              {q3FB[gi] && <FeedbackBox type={q3FB[gi].type} message={q3FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary score={null} total={null} message="Brilliant! You know your primes and square numbers inside out!" />}
      </div>
    </div>
  );
}

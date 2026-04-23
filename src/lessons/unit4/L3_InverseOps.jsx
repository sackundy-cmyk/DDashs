// ============================================================
//  lessons/unit4/L3_InverseOps.jsx
//  Unit 4 · Lesson 3: Inverse Operations
//  S1: write the missing number — digit-drag, groups of 4
//  S2: complete & check with inverse — digit-drag, groups of 4
// ============================================================

import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── Section 1: write missing number ──
// before/after split — answer slot goes between them
const Q1 = [
  { lbl:'a', before:'34 + 25 =',   after:'',          ans:59,  guided:true,  hint:'Add ones: 4+5=9. Add tens: 30+20=50. Total: 59.' },
  { lbl:'b', before:'52 −',         after:'= 26',      ans:26,  guided:true,  hint:'52 − ? = 26 means ? = 52 − 26. Subtract: 52 − 26 = 26.' },
  { lbl:'c', before:'74 + 38 =',   after:'',          ans:112, guided:true,  hint:'74 + 30 = 104, then 104 + 8 = 112.' },
  { lbl:'d', before:'',             after:'− 45 = 27', ans:72,  guided:true,  hint:'? − 45 = 27 means ? = 45 + 27. Add: 45 + 27 = 72.' },
  { lbl:'e', before:'64 − 18 =',   after:''          ,ans:46  },
  { lbl:'f', before:'53 +',         after:'= 92',      ans:39  },
  { lbl:'g', before:'72 ÷',         after:'= 9',       ans:8   },
  { lbl:'h', before:'',             after:'× 3 = 24',  ans:8   },
  { lbl:'i', before:'6 ×',          after:'= 42',      ans:7   },
  { lbl:'j', before:'45 ÷',         after:'= 5',       ans:9   },
  { lbl:'k', before:'',             after:'× 3 = 18',  ans:6   },
  { lbl:'l', before:'',             after:'÷ 8 = 7',   ans:56  },
];

// ── Section 2: complete & check with inverse ──
// primary: 'expr =' → user fills result
// check: '{R} op = original' → {R} auto-filled with user's answer
const Q2 = [
  { lbl:'a', primary:'37 + 42 =',    check:'{R} − 42 = 37',   ans:79,   guided:true,  hint:'37 + 42: 37 + 40 = 77, then 77 + 2 = 79.' },
  { lbl:'b', primary:'83 − 56 =',    check:'{R} + 56 = 83',   ans:27,   guided:true,  hint:'83 − 56: 83 − 50 = 33, then 33 − 6 = 27.' },
  { lbl:'c', primary:'42 + 93 =',    check:'{R} − 93 = 42',   ans:135,  guided:true,  hint:'42 + 93: 42 + 90 = 132, then 132 + 3 = 135.' },
  { lbl:'d', primary:'64 − 38 =',    check:'{R} + 38 = 64',   ans:26,   guided:true,  hint:'64 − 38: 64 − 30 = 34, then 34 − 8 = 26.' },
  { lbl:'e', primary:'112 + 65 =',   check:'{R} − 65 = 112',  ans:177  },
  { lbl:'f', primary:'167 − 59 =',   check:'{R} + 59 = 167',  ans:108  },
  { lbl:'g', primary:'15 × 6 =',     check:'{R} ÷ 6 = 15',    ans:90   },
  { lbl:'h', primary:'24 × 3 =',     check:'{R} ÷ 3 = 24',    ans:72   },
  { lbl:'i', primary:'48 ÷ 3 =',     check:'{R} × 3 = 48',    ans:16   },
  { lbl:'j', primary:'150 ÷ 6 =',    check:'{R} × 6 = 150',   ans:25   },
  { lbl:'k', primary:'165 + 648 =',  check:'{R} − 648 = 165', ans:813  },
  { lbl:'l', primary:'675 − 268 =',  check:'{R} + 268 = 675', ans:407  },
  { lbl:'m', primary:'684 + 468 =',  check:'{R} − 468 = 684', ans:1152 },
  { lbl:'n', primary:'846 − 309 =',  check:'{R} + 309 = 846', ans:537  },
  { lbl:'o', primary:'43 × 6 =',     check:'{R} ÷ 6 = 43',    ans:258  },
  { lbl:'p', primary:'92 ÷ 4 =',     check:'{R} × 4 = 92',    ans:23   },
];

export default function L3_InverseOps() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Section 1 state ──
  const q1D         = state.q1D         || {}, setQ1D         = setField('q1D');
  const q1St        = state.q1St        || {}, setQ1St        = setField('q1St');
  const q1FB        = state.q1FB        || {}, setQ1FB        = setField('q1FB');
  const q1GroupDone = state.q1GroupDone || {}, setQ1GroupDone = setField('q1GroupDone');

  // ── Section 2 state ──
  const q2D         = state.q2D         || {}, setQ2D         = setField('q2D');
  const q2St        = state.q2St        || {}, setQ2St        = setField('q2St');
  const q2FB        = state.q2FB        || {}, setQ2FB        = setField('q2FB');
  const q2GroupDone = state.q2GroupDone || {}, setQ2GroupDone = setField('q2GroupDone');

  const q1Groups = grp(Q1, 4);
  const q2Groups = grp(Q2, 4);

  // ── Section 1 helpers ──
  const q1Val  = lbl => { const d = q1D[lbl] || []; return d.length ? parseInt(d.join(''), 10) : null; };
  const q1Drop = lbl => raw => {
    if (q1St[lbl] === 'correct') return;
    if (raw === 'del') setQ1D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ1D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q1Rm = lbl => i => {
    if (q1St[lbl] === 'correct') return;
    setQ1D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ1 = (grpArr, gi) => {
    increment(`q1g${gi}`); const att = getAtt(`q1g${gi}`) + 1;
    let ok = 0; const ns = { ...q1St };
    grpArr.forEach(q => {
      const v = q1Val(q.lbl);
      if (v === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ1St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ1St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q1GroupDone, [gi]:true };
      setQ1GroupDone(nd);
      if (q1Groups.every((_, i) => nd[i])) prog.markDone('s1', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Use the inverse operation — if something is added, subtract to find the missing number.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Work backwards using the opposite operation.` };
    }
    setQ1FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 helpers ──
  const q2Val  = lbl => { const d = q2D[lbl] || []; return d.length ? parseInt(d.join(''), 10) : null; };
  const q2Drop = lbl => raw => {
    if (q2St[lbl] === 'correct') return;
    if (raw === 'del') setQ2D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ2D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q2Rm = lbl => i => {
    if (q2St[lbl] === 'correct') return;
    setQ2D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ2 = (grpArr, gi) => {
    increment(`q2g${gi}`); const att = getAtt(`q2g${gi}`) + 1;
    let ok = 0; const ns = { ...q2St };
    grpArr.forEach(q => {
      const v = q2Val(q.lbl);
      if (v === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ2St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ2St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct! Notice how the inverse check confirms each answer.` };
      const nd = { ...q2GroupDone, [gi]:true };
      setQ2GroupDone(nd);
      if (q2Groups.every((_, i) => nd[i])) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Calculate each expression and check with the inverse.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Compute the left side carefully, then verify with the inverse.` };
    }
    setQ2FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 3" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Use inverse operations to find missing numbers and to check your answers"/>
        <ExplainPanel title="Key Concept: Inverse Operations">
          <RuleBox>
            <strong>Addition ⇔ Subtraction</strong>&emsp;<strong>Multiplication ⇔ Division</strong><br/>
            If <strong>34 + 25 = 59</strong>, then check: <strong>59 − 25 = 34</strong> ✓<br/>
            Use the inverse to <em>find</em> a missing number or to <em>verify</em> your answer.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Write the missing numbers" tagType="drag" tagLabel="Drag Digits"
          subtitle="Work out what number is missing. Drag digits to build your answer. Check after each group of four. ★ Guided: a–d">
          {q1Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              <DigitPalette paletteId={`q1p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      {q.before && (
                        <span style={{ fontSize:20, fontWeight:800 }}>{q.before}</span>
                      )}
                      <DigitDropZone
                        digits={q1D[q.lbl]||[]}
                        zoneState={q1St[q.lbl]||'default'}
                        onDrop={q1Drop(q.lbl)}
                        onRemove={q1Rm(q.lbl)}
                      />
                      {q.after && (
                        <span style={{ fontSize:20, fontWeight:800 }}>{q.after}</span>
                      )}
                    </div>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(', ')}`}
                onClick={() => checkQ1(grpArr, gi)}
              />
              {q1FB[gi] && <FeedbackBox type={q1FB[gi].type} message={q1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={2} title="Complete and check with the inverse" tagType="drag" tagLabel="Drag Digits"
          subtitle="Calculate the answer, then see how the inverse operation checks it. Check after each group of four. ★ Guided: a–d">
          {q2Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              <DigitPalette paletteId={`q2p${gi}`}/>
              {grpArr.map((q, qi) => {
                const digits  = q2D[q.lbl] || [];
                const ansStr  = digits.join('') || '?';
                const checkTx = q.check.replace('{R}', ansStr);
                const isCorrect = q2St[q.lbl] === 'correct';
                return (
                  <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                    {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {/* Primary equation */}
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:20, fontWeight:800 }}>{q.primary}</span>
                          <DigitDropZone
                            digits={digits}
                            zoneState={q2St[q.lbl]||'default'}
                            onDrop={q2Drop(q.lbl)}
                            onRemove={q2Rm(q.lbl)}
                          />
                        </div>
                        {/* Inverse check — auto-filled */}
                        <div style={{
                          display:'inline-flex', alignItems:'center', gap:6,
                          background: isCorrect ? 'var(--green-bg)' : 'var(--blue-light)',
                          border: `1.5px solid ${isCorrect ? 'var(--green-border)' : 'var(--border)'}`,
                          borderRadius:8, padding:'6px 12px',
                        }}>
                          <span style={{ fontSize:13, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.4px' }}>Check:</span>
                          <span style={{
                            fontSize:17, fontWeight:800,
                            color: isCorrect ? 'var(--green)' : ansStr === '?' ? 'var(--muted)' : 'var(--text)',
                          }}>
                            {checkTx}
                            {isCorrect && ' ✓'}
                          </span>
                        </div>
                      </div>
                    </QItemLabel>
                  </QItem>
                );
              })}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(', ')}`}
                onClick={() => checkQ2(grpArr, gi)}
              />
              {q2FB[gi] && <FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Great work! You can use inverse operations to find missing numbers and verify answers."/>}
      </div>
    </div>
  );
}

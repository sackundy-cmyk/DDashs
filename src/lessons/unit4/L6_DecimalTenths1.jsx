// ============================================================
//  lessons/unit4/L6_DecimalTenths1.jsx
//  Unit 4 · Lesson 6: Decimal Tenths — Part 1
//  S1 (a–l): mental decimal addition, digit-drag, groups of 4
//  S2 (a–f): column decimal addition (2 addends), digit-drag, pairs
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

function ColumnAdd({ addends }) {
  const width = Math.max(...addends.map(s => s.length));
  return (
    <div style={{
      display:'inline-block', background:'var(--blue-light)',
      border:'1.5px solid var(--border)', borderRadius:8, padding:'8px 16px',
    }}>
      {addends.map((n, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:18, fontWeight:700, color:'var(--muted)', minWidth:18, textAlign:'right' }}>
            {i === addends.length - 1 ? '+' : ''}
          </span>
          <span style={{ fontSize:20, fontWeight:800, color:'var(--text)', minWidth: width * 13, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{n}</span>
        </div>
      ))}
      <div style={{ borderTop:'2px solid var(--text)', margin:'4px 0 6px' }}/>
    </div>
  );
}

// ── Section 1: mental decimal addition ──
const Q1 = [
  { lbl:'a', expr:'0.5 + 0.6 =', ans:1.1,  guided:true, hint:'8 tenths + 6 tenths = 11 tenths → 0.5 + 0.6 = 1.1. Drag [1][.][1].' },
  { lbl:'b', expr:'0.9 + 0.4 =', ans:1.3,  guided:true, hint:'9 tenths + 4 tenths = 13 tenths → 1.3.' },
  { lbl:'c', expr:'0.7 + 0.7 =', ans:1.4 },
  { lbl:'d', expr:'0.2 + 0.8 =', ans:1.0 },
  { lbl:'e', expr:'0.6 + 0.7 =', ans:1.3 },
  { lbl:'f', expr:'0.8 + 0.7 =', ans:1.5 },
  { lbl:'g', expr:'8.9 + 0.1 =', ans:9.0 },
  { lbl:'h', expr:'10.2 + 0.5 =',ans:10.7 },
  { lbl:'i', expr:'10.8 + 0.3 =',ans:11.1 },
  { lbl:'j', expr:'9.7 + 0.9 =', ans:10.6 },
  { lbl:'k', expr:'9.6 + 1.4 =', ans:11.0 },
  { lbl:'l', expr:'8.5 + 1.9 =', ans:10.4 },
];

// ── Section 2: column addition (2 addends) ──
const Q2 = [
  { lbl:'a', addends:['13.2', '7.4'],   ans:20.6,  guided:true, hint:'13.2 + 7.4: tenths 2+4=6; units 3+7=10 (write 0, carry 1); tens 1+1=2 → 20.6.' },
  { lbl:'b', addends:['26.6', '1.9'],   ans:28.5,  guided:true, hint:'26.6 + 1.9: tenths 6+9=15 (write 5, carry 1); units 6+1+1=8; tens 2 → 28.5.' },
  { lbl:'c', addends:['32.5', '9.5'],   ans:42.0 },
  { lbl:'d', addends:['104.7', '3.8'],  ans:108.5 },
  { lbl:'e', addends:['128.5', '4.6'],  ans:133.1 },
  { lbl:'f', addends:['256.9', '72.3'], ans:329.2 },
];

export default function L6_DecimalTenths1() {
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
  const q2Groups = grp(Q2, 2);

  // ── Decimal value parser ──
  const decVal = (lbl, dMap) => {
    const d = dMap[lbl] || [];
    if (!d.length) return null;
    const v = parseFloat(d.join(''));
    return isNaN(v) ? null : Math.round(v * 1000) / 1000;
  };

  // ── Section 1 helpers ──
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
      const v = decVal(q.lbl, q1D);
      if (v !== null && Math.abs(v - q.ans) < 0.0005) { ns[q.lbl] = 'correct'; ok++; }
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
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Add the tenths digits first — if they total 10 or more, carry 1 to the units.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Think in tenths: 0.6 + 0.7 = 13 tenths = 1.3.` };
    }
    setQ1FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 helpers ──
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
      const v = decVal(q.lbl, q2D);
      if (v !== null && Math.abs(v - q.ans) < 0.0005) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ2St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ2St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q2GroupDone, [gi]:true };
      setQ2GroupDone(nd);
      if (q2Groups.every((_, i) => nd[i])) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Line up the decimal points and add column by column from right to left.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Start with the tenths column, then move left.` };
    }
    setQ2FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 6" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Add decimal tenths mentally and using column addition"/>
        <ExplainPanel title="Key Concept: Adding Decimal Tenths">
          <RuleBox>
            <strong>Mental:</strong> think in tenths — 0.8 + 0.7 = 15 tenths = 1.5<br/>
            <strong>Column:</strong> align the decimal points, then add column by column from right to left. Carry when a column totals 10 or more.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Add these mentally" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digits and a decimal point to build each answer. Check after each group of four. ★ Guided: a & b">
          {q1Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              <DigitPalette decimal paletteId={`q1p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{q.expr}</span>
                      <DigitDropZone
                        digits={q1D[q.lbl]||[]}
                        zoneState={q1St[q.lbl]||'default'}
                        onDrop={q1Drop(q.lbl)}
                        onRemove={q1Rm(q.lbl)}
                      />
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
        <SectionCard badge={2} title="Copy and complete these decimal additions" tagType="drag" tagLabel="Drag Digits"
          subtitle="Use column addition — align decimal points. Drag digits to build each answer. Check after each pair. ★ Guided: a & b">
          {q2Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette decimal paletteId={`q2p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <ColumnAdd addends={q.addends}/>
                      <DigitDropZone
                        digits={q2D[q.lbl]||[]}
                        zoneState={q2St[q.lbl]||'default'}
                        onDrop={q2Drop(q.lbl)}
                        onRemove={q2Rm(q.lbl)}
                      />
                    </div>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ2(grpArr, gi)}
              />
              {q2FB[gi] && <FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Great work! You can add decimal tenths mentally and with column addition."/>}
      </div>
    </div>
  );
}

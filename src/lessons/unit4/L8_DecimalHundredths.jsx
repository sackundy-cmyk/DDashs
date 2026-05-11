// ============================================================
//  lessons/unit4/L8_DecimalHundredths.jsx
//  Unit 4 · Lesson 8: Decimal Hundredths
//  S1 (a–f): column addition (hundredths), digit-drag, pairs
//  S2 (a–f): horizontal addition (hundredths), digit-drag, pairs
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

// ── Section 1: column addition (hundredths) ──
const Q1 = [
  { lbl:'a', addends:['45.37', '22.46'], ans:67.83, guided:true, hint:'Hundredths: 7+6=13 (write 3, carry 1). Tenths: 3+4+1=8. Units: 5+2=7. Tens: 4+2=6 → 67.83.' },
  { lbl:'b', addends:['31.85', '52.91'], ans:84.76, guided:true, hint:'Hundredths: 5+1=6. Tenths: 8+9=17 (write 7, carry 1). Units: 1+2+1=4. Tens: 3+5=8 → 84.76.' },
  { lbl:'c', addends:['73.02', '18.79'], ans:91.81 },
  { lbl:'d', addends:['64.89', '20.62'], ans:85.51 },
  { lbl:'e', addends:['28.13', '15.57'], ans:43.70 },
  { lbl:'f', addends:['36.24', '36.79'], ans:73.03 },
];

// ── Section 2: horizontal addition (hundredths) ──
const Q2 = [
  { lbl:'a', expr:'32.48 + 18.45 =', ans:50.93, guided:true, hint:'Hundredths: 8+5=13 (write 3, carry 1). Tenths: 4+4+1=9. Units: 2+8=10 (write 0, carry 1). Tens: 3+1+1=5 → 50.93.' },
  { lbl:'b', expr:'56.37 + 20.97 =', ans:77.34, guided:true, hint:'Hundredths: 7+7=14 (write 4, carry 1). Tenths: 3+9+1=13 (write 3, carry 1). Units: 6+0+1=7. Tens: 5+2=7 → 77.34.' },
  { lbl:'c', expr:'41.64 + 43.89 =', ans:85.53 },
  { lbl:'d', expr:'16.06 + 65.65 =', ans:81.71 },
  { lbl:'e', expr:'78.27 + 18.99 =', ans:97.26 },
  { lbl:'f', expr:'34.96 + 37.67 =', ans:72.63 },
];

export default function L8_DecimalHundredths() {
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

  const q1Groups = grp(Q1, 2);
  const q2Groups = grp(Q2, 2);

  const decVal = (lbl, dMap) => {
    const d = dMap[lbl] || [];
    if (!d.length) return null;
    const v = parseFloat(d.join(''));
    return isNaN(v) ? null : Math.round(v * 100000) / 100000;
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
      if (v !== null && Math.abs(v - q.ans) < 0.00005) { ns[q.lbl] = 'correct'; ok++; }
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
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Start with the hundredths column — carry when the total is 10 or more.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Add hundredths first, then tenths, then units, carrying as needed.` };
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
      if (v !== null && Math.abs(v - q.ans) < 0.00005) { ns[q.lbl] = 'correct'; ok++; }
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
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Rewrite each as a column addition to keep decimal points aligned.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Add hundredths first, then tenths, then larger columns. Don't forget to carry!` };
    }
    setQ2FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 8" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Add decimal numbers with hundredths using column addition and horizontal calculation"/>
        <ExplainPanel title="Key Concept: Adding Decimal Hundredths">
          <RuleBox>
            <strong>Always align decimal points</strong> before adding.<br/>
            Start from the <strong>hundredths</strong> column (rightmost), then tenths, then units, then tens.<br/>
            Carry whenever a column totals 10 or more. Example: <strong>45.37 + 22.46 = 67.83</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Copy and complete these additions" tagType="drag" tagLabel="Drag Digits"
          subtitle="Each shows two numbers to add in column form. Drag digits to build the answer. Check after each pair. ★ Guided: a & b">
          {q1Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette decimal paletteId={`q1p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <ColumnAdd addends={q.addends}/>
                      <DigitDropZone
                        paletteId={`q1p${gi}`}
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
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ1(grpArr, gi)}
              />
              {q1FB[gi] && <FeedbackBox type={q1FB[gi].type} message={q1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={2} title="Answer these additions — line up the decimal points" tagType="drag" tagLabel="Drag Digits"
          subtitle="Calculate each sum and drag digits to build your answer. Check after each pair. ★ Guided: a & b">
          {q2Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette decimal paletteId={`q2p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{q.expr}</span>
                      <DigitDropZone
                        paletteId={`q2p${gi}`}
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

        {prog.allDone && <Summary message="Fantastic! You can add decimal hundredths using column and horizontal methods."/>}
      </div>
    </div>
  );
}

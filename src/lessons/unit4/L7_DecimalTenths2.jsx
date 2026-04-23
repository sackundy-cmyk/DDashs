// ============================================================
//  lessons/unit4/L7_DecimalTenths2.jsx
//  Unit 4 · Lesson 7: Decimal Tenths — Part 2
//  S3 (a–f): decimal word problems, digit-drag, pairs
//  S4 (a–f): column addition with three addends, digit-drag, pairs
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

// ── Section 3: word problems ──
const Q3 = [
  { lbl:'a', text:'What is 21.7 added to 345.6?',         ans:367.3, guided:true, hint:'21.7 + 345.6: tenths 7+6=13 (write 3, carry 1); units 1+5+1=7; tens 2+4=6; hundreds 3 → 367.3.' },
  { lbl:'b', text:'What is 74.2 more than 39.5?',          ans:113.7, guided:true, hint:'74.2 + 39.5: tenths 2+5=7; units 4+9=13 (write 3, carry 1); tens 7+3+1=11 → 113.7.' },
  { lbl:'c', text:'Add 314.9 to 247.8.',                   ans:562.7 },
  { lbl:'d', text:'What is the total of 67.8 and 291.7?',  ans:359.5 },
  { lbl:'e', text:'What is 765.4 added to 384.9?',         ans:1150.3 },
  { lbl:'f', text:'Total 385.6 and 934.1.',                ans:1319.7 },
];

// ── Section 4: column addition (3 addends) ──
const Q4 = [
  { lbl:'a', addends:['17.4', '18.2', '19.5'],   ans:55.1,  guided:true, hint:'17.4+18.2=35.6, then 35.6+19.5=55.1.' },
  { lbl:'b', addends:['3.7', '15.6', '38.9'],    ans:58.2,  guided:true, hint:'3.7+15.6=19.3, then 19.3+38.9=58.2.' },
  { lbl:'c', addends:['215.1', '58.8', '30.3'],  ans:304.2 },
  { lbl:'d', addends:['124.6', '62.5', '23.2'],  ans:210.3 },
  { lbl:'e', addends:['209.4', '151.7', '89.1'], ans:450.2 },
  { lbl:'f', addends:['268.3', '80.5', '67.6'],  ans:416.4 },
];

export default function L7_DecimalTenths2() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Section 3 state ──
  const q3D         = state.q3D         || {}, setQ3D         = setField('q3D');
  const q3St        = state.q3St        || {}, setQ3St        = setField('q3St');
  const q3FB        = state.q3FB        || {}, setQ3FB        = setField('q3FB');
  const q3GroupDone = state.q3GroupDone || {}, setQ3GroupDone = setField('q3GroupDone');

  // ── Section 4 state ──
  const q4D         = state.q4D         || {}, setQ4D         = setField('q4D');
  const q4St        = state.q4St        || {}, setQ4St        = setField('q4St');
  const q4FB        = state.q4FB        || {}, setQ4FB        = setField('q4FB');
  const q4GroupDone = state.q4GroupDone || {}, setQ4GroupDone = setField('q4GroupDone');

  const q3Groups = grp(Q3, 2);
  const q4Groups = grp(Q4, 2);

  const decVal = (lbl, dMap) => {
    const d = dMap[lbl] || [];
    if (!d.length) return null;
    const v = parseFloat(d.join(''));
    return isNaN(v) ? null : Math.round(v * 10000) / 10000;
  };

  // ── Section 3 helpers ──
  const q3Drop = lbl => raw => {
    if (q3St[lbl] === 'correct') return;
    if (raw === 'del') setQ3D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ3D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q3Rm = lbl => i => {
    if (q3St[lbl] === 'correct') return;
    setQ3D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ3 = (grpArr, gi) => {
    increment(`q3g${gi}`); const att = getAtt(`q3g${gi}`) + 1;
    let ok = 0; const ns = { ...q3St };
    grpArr.forEach(q => {
      const v = decVal(q.lbl, q3D);
      if (v !== null && Math.abs(v - q.ans) < 0.0005) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ3St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ3St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q3GroupDone, [gi]:true };
      setQ3GroupDone(nd);
      if (q3Groups.every((_, i) => nd[i])) prog.markDone('s1', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Line up the decimal points and add column by column, carrying where needed.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Read the key words to identify which numbers to add, then calculate carefully.` };
    }
    setQ3FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 4 helpers ──
  const q4Drop = lbl => raw => {
    if (q4St[lbl] === 'correct') return;
    if (raw === 'del') setQ4D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ4D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q4Rm = lbl => i => {
    if (q4St[lbl] === 'correct') return;
    setQ4D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ4 = (grpArr, gi) => {
    increment(`q4g${gi}`); const att = getAtt(`q4g${gi}`) + 1;
    let ok = 0; const ns = { ...q4St };
    grpArr.forEach(q => {
      const v = decVal(q.lbl, q4D);
      if (v !== null && Math.abs(v - q.ans) < 0.0005) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ4St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ4St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q4GroupDone, [gi]:true };
      setQ4GroupDone(nd);
      if (q4Groups.every((_, i) => nd[i])) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Add two numbers first, then add the third. Align decimal points.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Add column by column from right to left, carrying when needed.` };
    }
    setQ4FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 7" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Solve decimal addition word problems and add three decimal numbers using column addition"/>
        <ExplainPanel title="Key Concept: Decimal Addition with Multiple Addends">
          <RuleBox>
            <strong>Word problems:</strong> <em>added to, more than, total</em> → add the two numbers.<br/>
            <strong>Three addends:</strong> add the first two, then add the third. Align decimal points throughout.<br/>
            Carry when any column sum reaches 10 or more.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 3 ── */}
        <SectionCard badge={3} title="Answer these" tagType="drag" tagLabel="Drag Digits"
          subtitle="Read each word problem and drag digits to build your decimal answer. Check after each pair. ★ Guided: a & b">
          {q3Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette decimal paletteId={`q3p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{q.text}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>=</span>
                        <DigitDropZone
                          digits={q3D[q.lbl]||[]}
                          zoneState={q3St[q.lbl]||'default'}
                          onDrop={q3Drop(q.lbl)}
                          onRemove={q3Rm(q.lbl)}
                        />
                      </div>
                    </div>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ3(grpArr, gi)}
              />
              {q3FB[gi] && <FeedbackBox type={q3FB[gi].type} message={q3FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 4 ── */}
        <SectionCard badge={4} title="Copy and complete these decimal additions" tagType="drag" tagLabel="Drag Digits"
          subtitle="Each column has three numbers to add. Drag digits to build each answer. Check after each pair. ★ Guided: a & b">
          {q4Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette decimal paletteId={`q4p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <ColumnAdd addends={q.addends}/>
                      <DigitDropZone
                        digits={q4D[q.lbl]||[]}
                        zoneState={q4St[q.lbl]||'default'}
                        onDrop={q4Drop(q.lbl)}
                        onRemove={q4Rm(q.lbl)}
                      />
                    </div>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ4(grpArr, gi)}
              />
              {q4FB[gi] && <FeedbackBox type={q4FB[gi].type} message={q4FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You can add decimal numbers in word problems and column additions."/>}
      </div>
    </div>
  );
}

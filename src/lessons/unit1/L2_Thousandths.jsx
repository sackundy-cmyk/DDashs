// ============================================================
//  lessons/unit1/L2_Thousandths.jsx
//  Unit 1 · Lesson 2: Thousandths
//  3 sections (matches HTML structure):
//    s1 Words + red-digit place value (paired MCQ)
//    s2 Fractions /1000 → decimals   (drag digits, 3 dp)
//    s3 Count in thousandths          (drag chips into sequences)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── s1: Words + place value of red digit ──
// `num` = decimal shown, `redIdx` = index (in num string) of the red digit.
// Each item has: words MCQ (3 opts) + place MCQ (3 opts).
const WORDS_Q = [
  { lbl:'a', num:'0.473', redIdx:4,
    words:'zero point four seven three',
    wordsOpts:['zero point four seven three','zero point four three seven','zero point three four seven'],
    place:'thousandths', placeOpts:['thousandths','tenths','hundredths'],
    guided:true, hint:'Say each decimal digit separately. The red 3 is the 3rd digit after the point = thousandths.' },
  { lbl:'b', num:'5.981', redIdx:3,
    words:'five point nine eight one',
    wordsOpts:['five point nine eight one','five point eight nine one','five point one nine eight'],
    place:'hundredths', placeOpts:['hundredths','tenths','thousandths'],
    guided:true, hint:'The red 8 is the 2nd digit after the point = hundredths.' },
  { lbl:'c', num:'62.359', redIdx:4,
    words:'sixty-two point three five nine',
    wordsOpts:['sixty-two point three five nine','sixty-two point five three nine','sixty-two point three nine five'],
    place:'hundredths', placeOpts:['hundredths','tenths','thousandths'],
    guided:true, hint:'Count digits after the point: 3 (tenths), 5 (hundredths), 9 (thousandths).' },
  { lbl:'d', num:'0.702', redIdx:3,
    words:'zero point seven zero two',
    wordsOpts:['zero point seven zero two','zero point zero seven two','zero point two zero seven'],
    place:'hundredths', placeOpts:['hundredths','tenths','thousandths'] },
  { lbl:'e', num:'44.008', redIdx:5,
    words:'forty-four point zero zero eight',
    wordsOpts:['forty-four point zero zero eight','forty-four point eight zero zero','forty-four point zero eight zero'],
    place:'thousandths', placeOpts:['thousandths','hundredths','tenths'] },
  { lbl:'f', num:'1.105', redIdx:0,
    words:'one point one zero five',
    wordsOpts:['one point one zero five','one point zero one five','one point five one zero'],
    place:'units', placeOpts:['units','tenths','thousandths'] },
  { lbl:'g', num:'96.283', redIdx:4,
    words:'ninety-six point two eight three',
    wordsOpts:['ninety-six point two eight three','ninety-six point eight two three','ninety-six point two three eight'],
    place:'hundredths', placeOpts:['hundredths','tenths','thousandths'] },
  { lbl:'h', num:'35.169', redIdx:4,
    words:'thirty-five point one six nine',
    wordsOpts:['thirty-five point one six nine','thirty-five point six one nine','thirty-five point nine six one'],
    place:'hundredths', placeOpts:['hundredths','tenths','thousandths'] },
];

// ── s2: Fractions → decimals (/1000, 3 decimal places) ──
// `whole` prefix (may be ''), `num/1000` gives the decimal part.
const FRAC_Q = [
  { lbl:'a', whole:'',   num:'7',   ans:'007', guided:true,  hint:'7÷1000 = 0.007 (two leading zeros).' },
  { lbl:'b', whole:'',   num:'90',  ans:'090', guided:true,  hint:'90÷1000 = 0.090 (one leading zero).' },
  { lbl:'c', whole:'2',  num:'300', ans:'300', guided:true,  hint:'300÷1000 = 0.300, so the answer is 2.300.' },
  { lbl:'d', whole:'17', num:'1',   ans:'001' },
  { lbl:'e', whole:'',   num:'450', ans:'450' },
  { lbl:'f', whole:'',   num:'525', ans:'525' },
  { lbl:'g', whole:'12', num:'800', ans:'800' },
  { lbl:'h', whole:'68', num:'950', ans:'950' },
  { lbl:'i', whole:'19', num:'325', ans:'325' },
  { lbl:'j', whole:'',   num:'45',  ans:'045' },
  { lbl:'k', whole:'3',  num:'572', ans:'572' },
  { lbl:'l', whole:'29', num:'807', ans:'807' },
];

// ── s3: Count in thousandths (drag chips into gaps) ──
// Each q shows 4 known numbers then 2 blanks. Bank holds correct + distractors.
const SEQ_Q = [
  { lbl:'a', seq:['82.311','82.312','82.313','82.314'], next:['82.315','82.316'],
    dist:['82.317','82.310','82.320','82.214'],
    guided:true, hint:'Each step adds 0.001. After 82.314 → 82.315 → 82.316.' },
  { lbl:'b', seq:['40.059','40.060','40.061','40.062'], next:['40.063','40.064'],
    dist:['40.065','40.053','40.073','40.163'],
    guided:true, hint:'40.062 + 0.001 = 40.063, then 40.064.' },
  { lbl:'c', seq:['3.275','3.276','3.277','3.278'], next:['3.279','3.280'],
    dist:['3.281','3.270','3.289','3.378'] },
  { lbl:'d', seq:['16.026','16.027','16.028','16.029'], next:['16.030','16.031'],
    dist:['16.032','16.020','16.039','16.130'] },
  { lbl:'e', seq:['0.097','0.098','0.099','0.100'], next:['0.101','0.102'],
    dist:['0.103','0.090','0.200','0.111'] },
  { lbl:'f', seq:['5.118','5.119','5.120','5.121'], next:['5.122','5.123'],
    dist:['5.124','5.110','5.222','5.021'] },
];

// ── Helpers ──
function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }
function shuffle(a){ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; }

// Shows a number with one digit highlighted red (at index redIdx in original string).
function RedDigitNum({ num, redIdx }) {
  return (
    <span style={{ fontFamily:'monospace', fontSize:22, fontWeight:900, letterSpacing:2 }}>
      {num.split('').map((ch,i) => (
        <span key={i} style={i === redIdx ? { color:'var(--red)' } : undefined}>{ch}</span>
      ))}
    </span>
  );
}

// Visual fraction tile (whole + num/1000).
function FracTile({ whole, num }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'stretch',
      background:'#DBEAFE', border:'1.5px solid #93C3FD', borderRadius:8,
      overflow:'hidden', verticalAlign:'middle', margin:'0 4px',
    }}>
      {whole && (
        <span style={{
          fontSize:22, fontWeight:900, color:'#1E40AF',
          padding:'4px 10px', borderRight:'2.5px solid #93C3FD',
          background:'#BFDBFE', display:'flex', alignItems:'center',
        }}>{whole}</span>
      )}
      <span style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3px 10px', gap:1 }}>
        <span style={{ fontSize:14, fontWeight:900, color:'#1E40AF', borderBottom:'2px solid #1E40AF', padding:'0 4px 1px', lineHeight:1.3, minWidth:28, textAlign:'center' }}>{num}</span>
        <span style={{ fontSize:14, fontWeight:900, color:'#1E40AF', lineHeight:1.3, textAlign:'center' }}>1000</span>
      </span>
    </span>
  );
}

// Drag-chip for the sequence bank (s3).
function SeqChip({ value, disabled }) {
  const handleDragStart = (e) => {
    if (disabled) { e.preventDefault(); return; }
    e.dataTransfer.setData('text/plain', `seq:${value}`);
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      style={{
        background: disabled ? '#CBD5E1' : 'var(--blue)',
        color: '#fff',
        border: `2px solid ${disabled ? '#94A3B8' : 'var(--blue-dark)'}`,
        borderRadius: 9, padding: '8px 14px',
        fontSize: 15, fontWeight: 800,
        cursor: disabled ? 'default' : 'grab', userSelect: 'none',
        opacity: disabled ? 0.35 : 1, transition: 'transform .1s',
      }}>
      {value}
    </div>
  );
}

// Drop zone for a sequence blank.
function SeqDrop({ value, state, onDrop, onClick }) {
  const [over, setOver] = useState(false);
  const bg = state === 'correct' ? 'var(--green-bg)' : state === 'wrong' ? 'var(--red-bg)' : over ? 'var(--blue-light)' : value ? '#EEF4FF' : '#F8FAFF';
  const bd = state === 'correct' ? '2.5px solid var(--green)' : state === 'wrong' ? '2.5px solid var(--red)' : over ? '2.5px solid var(--blue)' : value ? '2.5px solid var(--blue)' : '2.5px dashed var(--border)';
  const color = state === 'correct' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : value ? 'var(--blue)' : 'var(--muted)';
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const d = e.dataTransfer.getData('text/plain'); if (d.startsWith('seq:')) onDrop(d.slice(4)); }}
      onClick={onClick}
      style={{
        minWidth: 88, height: 46, borderRadius: 9,
        border: bd, background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 800, padding: '0 8px',
        cursor: value ? 'pointer' : 'default', transition: 'all .2s',
      }}>
      {value || '?'}
    </div>
  );
}

export default function L2_Thousandths() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── s1 state: { [lbl]: { words, place } } ──
  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1St  = state.s1St  || {}, setS1St  = setField('s1St');
  const s1FB  = state.s1FB  || {}, setS1FB  = setField('s1FB');

  // ── s2 state ──
  const s2D  = state.s2D  || {}, setS2D  = setField('s2D');
  const s2St = state.s2St || {}, setS2St = setField('s2St');
  const s2FB = state.s2FB || {}, setS2FB = setField('s2FB');

  // ── s3 state ──
  const s3Filled = state.s3Filled || {}, setS3Filled = setField('s3Filled');
  const s3St     = state.s3St     || {}, setS3St     = setField('s3St');
  const s3FB     = state.s3FB     || {}, setS3FB     = setField('s3FB');
  // Stable shuffled bank per question (6 chips = 2 correct + 4 distractors).
  const [s3Banks] = useState(() =>
    Object.fromEntries(SEQ_Q.map(q => [q.lbl, shuffle([...q.next, ...q.dist])]))
  );

  // ═══ s1 checking ═══
  const checkS1Group = (ga, gi) => {
    increment(`s1g${gi}`); const att = getAtt(`s1g${gi}`) + 1;
    let okParts = 0; let totalParts = 0;
    const ns = { ...s1St };
    ga.forEach(q => {
      totalParts += 2;
      const sel = s1Sel[q.lbl] || {};
      if (sel.words === q.words) { ns[`${q.lbl}-words-${sel.words}`] = 'correct'; okParts++; }
      else if (sel.words)         { ns[`${q.lbl}-words-${sel.words}`] = 'wrong'; }
      if (sel.place === q.place) { ns[`${q.lbl}-place-${sel.place}`] = 'correct'; okParts++; }
      else if (sel.place)         { ns[`${q.lbl}-place-${sel.place}`] = 'wrong'; }
    });
    setS1St(ns);
    let fb;
    if (okParts === totalParts) fb = { type:'correct', text:`🎉 ${okParts}/${totalParts} correct!` };
    else if (att >= 3)          fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)         fb = { type:'hint',    text:`💡 ${okParts}/${totalParts} correct. Say each decimal digit separately and count its position after the point.` };
    else                         fb = { type:'wrong',   text:`✗ ${okParts}/${totalParts} correct. Check both the words and the place value.` };
    setS1FB(p => ({ ...p, [gi]: fb }));

    // Section complete when every group passed.
    if (okParts === totalParts) {
      const allG = grp(WORDS_Q, 2);
      const correctGroups = Object.values({ ...s1FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        const totalItems = WORDS_Q.length * 2;
        prog.markDone('s1', { correct: totalItems, total: totalItems, attempts: att });
      }
    }
  };

  // ═══ s2 drag handlers & check ═══
  const s2Drop = (lbl) => (raw) => {
    if (s2St[lbl] === 'correct') return;
    if (raw === 'del') setS2D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) {
      const d = raw.split(':')[1];
      setS2D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), d] }));
    }
  };
  const s2Remove = (lbl) => (idx) => {
    if (s2St[lbl] === 'correct') return;
    setS2D(p => { const a=[...(p[lbl]||[])]; a.splice(idx,1); return { ...p, [lbl]:a }; });
  };
  const checkS2Group = (ga, gi) => {
    increment(`s2g${gi}`); const att = getAtt(`s2g${gi}`) + 1;
    let ok = 0; const ns = { ...s2St };
    ga.forEach(q => {
      const got = (s2D[q.lbl]||[]).join('');
      if (got === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else { ns[q.lbl] = 'wrong'; setTimeout(() => setS2St(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200); }
    });
    setS2St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct! Remember /1000 → 3 decimal places.` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Count digits after the dot — must always be exactly 3.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Pad with leading zeros so there are 3 digits after the point.` };
    setS2FB(p => ({ ...p, [gi]: fb }));

    if (ok === total) {
      const allG = grp(FRAC_Q, 2);
      const correctGroups = Object.values({ ...s2FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        prog.markDone('s2', { correct: FRAC_Q.length, total: FRAC_Q.length, attempts: att });
      }
    }
  };

  // ═══ s3 drag handlers & check ═══
  const s3DropAt = (lbl, slotIdx) => (val) => {
    if (s3St[lbl] === 'correct') return;
    setS3Filled(p => {
      const a = [...(p[lbl] || [undefined, undefined])];
      a[slotIdx] = val;
      return { ...p, [lbl]: a };
    });
  };
  const s3Clear = (lbl, slotIdx) => () => {
    if (s3St[lbl] === 'correct') return;
    setS3Filled(p => {
      const a = [...(p[lbl] || [undefined, undefined])];
      a[slotIdx] = undefined;
      return { ...p, [lbl]: a };
    });
  };
  const checkS3Group = (ga, gi) => {
    increment(`s3g${gi}`); const att = getAtt(`s3g${gi}`) + 1;
    let ok = 0; const ns = { ...s3St };
    ga.forEach(q => {
      const f = s3Filled[q.lbl] || [];
      const correct = f[0] === q.next[0] && f[1] === q.next[1];
      if (correct) { ns[q.lbl] = 'correct'; ok++; }
      else { ns[q.lbl] = 'wrong'; setTimeout(() => setS3St(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200); }
    });
    setS3St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct! The pattern adds 0.001 each step.` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Each step adds 0.001 — watch the last digit, and digits roll over past 9.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Look at the gap between numbers in the sequence.` };
    setS3FB(p => ({ ...p, [gi]: fb }));

    if (ok === total) {
      const allG = grp(SEQ_Q, 2);
      const correctGroups = Object.values({ ...s3FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        const totalItems = SEQ_Q.length;
        prog.markDone('s3', { correct: totalItems, total: totalItems, attempts: att });
      }
    }
  };

  // ── Groups ──
  const s1Groups = grp(WORDS_Q, 2);
  const s2Groups = grp(FRAC_Q, 2);
  const s3Groups = grp(SEQ_Q, 2);

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 2 · Thousandths" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Read, write and identify digits in decimal numbers up to thousandths — like 3.275"/>
        <ExplainPanel title="Key Concept: Thousandths">
          <RuleBox>
            The <strong>thousandths</strong> place is the <strong>3rd digit after the decimal point</strong>.<br/>
            <strong>0.001 = 1/1000</strong>. A fraction with 1000 on the bottom always has <strong>3 decimal places</strong>.<br/>
            Example: <strong>3.275</strong> → 3 units · 2 tenths · 7 hundredths · 5 thousandths.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* ── s1: words + place MCQ ── */}
        <SectionCard badge={1}
          title="Write each number in words and find the red digit's place"
          tagType="mcq" tagLabel="MCQ"
          subtitle="Pick the correct words · Then pick the place value of the red digit. ★ Guided a–c"
          score={prog.done['s1']}>
          {s1Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const wOpts = q.wordsOpts.map(o => ({
                  id: o, label: o,
                  state: s1St[`${q.lbl}-words-${o}`] || ((s1Sel[q.lbl]||{}).words === o ? 'selected' : 'default'),
                }));
                const pOpts = q.placeOpts.map(o => ({
                  id: o, label: o,
                  state: s1St[`${q.lbl}-place-${o}`] || ((s1Sel[q.lbl]||{}).place === o ? 'selected' : 'default'),
                }));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
                        💡 {q.hint}
                      </div>
                    )}
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <RedDigitNum num={q.num} redIdx={q.redIdx}/>
                    </QItemLabel>
                    <div style={{ fontSize:14, fontWeight:800, color:'var(--muted)', margin:'8px 0 6px' }}>
                      Part 1 — Choose the correct words
                    </div>
                    <MCQOptions options={wOpts} onSelect={o => setS1Sel(p => ({ ...p, [q.lbl]: { ...(p[q.lbl]||{}), words:o } }))}/>
                    <div style={{ fontSize:14, fontWeight:800, color:'var(--muted)', margin:'12px 0 6px' }}>
                      Part 2 — The red digit is in the …
                    </div>
                    <MCQOptions options={pOpts} onSelect={o => setS1Sel(p => ({ ...p, [q.lbl]: { ...(p[q.lbl]||{}), place:o } }))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS1Group(ga, gi)} disabled={prog.done['s1']}/>
              {s1FB[gi] && <FeedbackBox type={s1FB[gi].type} message={s1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s2: fractions /1000 → decimals ── */}
        <SectionCard badge={2}
          title="Write these fractions as decimals"
          tagType="drag" tagLabel="Drag Digits"
          subtitle="All fractions have 1000 on the bottom → always 3 decimal places. ★ Guided a–c"
          score={prog.done['s2']}>
          {s2Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`s2pal_${gi}`}/>
              {ga.map((q, qi) => (
                <QItem key={q.lbl} last={qi === ga.length - 1}>
                  {q.guided && (
                    <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
                      💡 {q.hint}
                    </div>
                  )}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <FracTile whole={q.whole} num={q.num}/>
                    <span style={{ fontSize:18, fontWeight:800 }}>=</span>
                    {q.whole && <span style={{ fontSize:22, fontWeight:900, color:'var(--blue-dark)' }}>{q.whole}.</span>}
                    {!q.whole && <span style={{ fontSize:22, fontWeight:900, color:'var(--blue-dark)' }}>0.</span>}
                    <DigitDropZone
                      digits={s2D[q.lbl] || []}
                      zoneState={s2St[q.lbl] || 'default'}
                      onDrop={s2Drop(q.lbl)}
                      onRemove={s2Remove(q.lbl)}
                    />
                    <span style={{ fontSize:12, color:'var(--muted)', marginLeft:4 }}>← 3 digits</span>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS2Group(ga, gi)} disabled={prog.done['s2']}/>
              {s2FB[gi] && <FeedbackBox type={s2FB[gi].type} message={s2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s3: count in thousandths ── */}
        <SectionCard badge={3}
          title="Count in thousandths — write the next two numbers"
          tagType="drag" tagLabel="Drag Chips"
          subtitle="Look at the pattern. Drag two chips from the pool to fill the blanks. ★ Guided a & b"
          score={prog.done['s3']}>
          {s3Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled = s3Filled[q.lbl] || [undefined, undefined];
                const usedSet = new Set(filled.filter(Boolean));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
                        💡 {q.hint}
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <LblCircle letter={q.lbl}/>
                      <span style={{ fontSize:14, fontWeight:800, color:'var(--muted)' }}>Continue the sequence:</span>
                    </div>
                    {/* Sequence row */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', margin:'10px 0' }}>
                      {q.seq.map((n, i) => (
                        <React.Fragment key={i}>
                          <div style={{ background:'#EEF4FF', border:'2px solid var(--border)', borderRadius:8, padding:'7px 12px', fontSize:17, fontWeight:800 }}>{n}</div>
                          <span style={{ fontSize:18, color:'var(--muted)', fontWeight:700 }}>→</span>
                        </React.Fragment>
                      ))}
                      <SeqDrop
                        value={filled[0]}
                        state={s3St[q.lbl]}
                        onDrop={s3DropAt(q.lbl, 0)}
                        onClick={s3Clear(q.lbl, 0)}
                      />
                      <span style={{ fontSize:18, color:'var(--muted)', fontWeight:700 }}>→</span>
                      <SeqDrop
                        value={filled[1]}
                        state={s3St[q.lbl]}
                        onDrop={s3DropAt(q.lbl, 1)}
                        onClick={s3Clear(q.lbl, 1)}
                      />
                    </div>
                    {/* Chip bank */}
                    <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:6 }}>
                      <div style={{ fontSize:12, fontWeight:800, color:'var(--blue)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.4px' }}>
                        🎯 Pool for {q.lbl.toUpperCase()}
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {s3Banks[q.lbl].map(v => (
                          <SeqChip key={v} value={v} disabled={usedSet.has(v)}/>
                        ))}
                      </div>
                    </div>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS3Group(ga, gi)} disabled={prog.done['s3']}/>
              {s3FB[gi] && <FeedbackBox type={s3FB[gi].type} message={s3FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Brilliant! You can read, write and count decimals down to thousandths!" />}
      </div>
    </div>
  );
}

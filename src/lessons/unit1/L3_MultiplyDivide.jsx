// ============================================================
//  lessons/unit1/L3_MultiplyDivide.jsx
//  Unit 1 · Lesson 3: Multiply & Divide by 10 / 100
//  4 sections (matches HTML structure):
//    s1 Multiply (×10, ×100)         — MCQ pairs
//    s2 Divide (÷10, ÷100)           — MCQ pairs
//    s3 Find the missing operation    — MCQ pairs
//    s4 Word problems                 — MCQ pairs
// ============================================================

import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── s1: Multiply by 10 / 100 ──
const MULT_Q = [
  { lbl:'a', expr:'0.413 × 10',  ans:'4.13',   opts:['4.13','41.3','0.0413','0.413'], guided:true, hint:'×10 shifts digits 1 place left: 0.413 → 4.13' },
  { lbl:'b', expr:'9.281 × 10',  ans:'92.81',  opts:['92.81','9.281','928.1','0.9281'], guided:true, hint:'×10: move the decimal one place to the right.' },
  { lbl:'c', expr:'5.116 × 10',  ans:'51.16',  opts:['51.16','5.116','511.6','0.5116'] },
  { lbl:'d', expr:'0.522 × 10',  ans:'5.22',   opts:['5.22','52.2','0.0522','0.522'] },
  { lbl:'e', expr:'1.017 × 10',  ans:'10.17',  opts:['10.17','101.7','1.017','0.1017'] },
  { lbl:'f', expr:'6.305 × 10',  ans:'63.05',  opts:['63.05','6.305','630.5','0.6305'] },
  { lbl:'g', expr:'1.602 × 100', ans:'160.2',  opts:['160.2','16.02','1602','0.1602'] },
  { lbl:'h', expr:'15.925 × 100',ans:'1592.5', opts:['1592.5','159.25','15925','15.925'] },
  { lbl:'i', expr:'34.007 × 100',ans:'3400.7', opts:['3400.7','340.07','3.4007','34.007'] },
  { lbl:'j', expr:'0.632 × 100', ans:'63.2',   opts:['63.2','6.32','632','0.632'] },
  { lbl:'k', expr:'1.052 × 100', ans:'105.2',  opts:['105.2','10.52','1052','1.052'] },
  { lbl:'l', expr:'86.927 × 100',ans:'8692.7', opts:['8692.7','869.27','86927','86.927'] },
];

// ── s2: Divide by 10 / 100 ──
const DIV_Q = [
  { lbl:'a', expr:'14.6 ÷ 10', ans:'1.46',  opts:['1.46','146','0.146','14.6'],  guided:true, hint:'÷10 shifts digits 1 place right: 14.6 → 1.46' },
  { lbl:'b', expr:'81.7 ÷ 10', ans:'8.17',  opts:['8.17','817','0.817','81.7'],  guided:true, hint:'÷10: move the decimal one place left.' },
  { lbl:'c', expr:'4.35 ÷ 10', ans:'0.435', opts:['0.435','43.5','4.35','0.0435'] },
  { lbl:'d', expr:'0.6 ÷ 10',  ans:'0.06',  opts:['0.06','6','0.6','0.006'] },
  { lbl:'e', expr:'4.31 ÷ 10', ans:'0.431', opts:['0.431','43.1','0.0431','4.31'] },
  { lbl:'f', expr:'8.25 ÷ 10', ans:'0.825', opts:['0.825','82.5','8.25','0.0825'] },
  { lbl:'g', expr:'3.4 ÷ 100', ans:'0.034', opts:['0.034','340','0.34','0.0034'] },
  { lbl:'h', expr:'18.2 ÷ 100',ans:'0.182', opts:['0.182','1820','1.82','0.0182'] },
  { lbl:'i', expr:'7.5 ÷ 100', ans:'0.075', opts:['0.075','750','0.75','0.0075'] },
  { lbl:'j', expr:'34.6 ÷ 100',ans:'0.346', opts:['0.346','3460','3.46','0.0346'] },
  { lbl:'k', expr:'1.8 ÷ 100', ans:'0.018', opts:['0.018','180','0.18','0.0018'] },
  { lbl:'l', expr:'0.4 ÷ 100', ans:'0.004', opts:['0.004','40','0.04','0.0004'] },
];

// ── s3: Find the missing operation ──
const OP_OPTS = ['×10','×100','÷10','÷100'];
const OP_Q = [
  { lbl:'a', from:'3.2',   to:'0.032',  ans:'÷100', guided:true, hint:'3.2 ÷ 100 = 0.032 (decimal moves 2 places right).' },
  { lbl:'b', from:'6.213', to:'621.3',  ans:'×100', guided:true, hint:'6.213 × 100 = 621.3 (decimal moves 2 places left).' },
  { lbl:'c', from:'45.382',to:'453.82', ans:'×10' },
  { lbl:'d', from:'8.271', to:'827.1',  ans:'×100' },
  { lbl:'e', from:'0.006', to:'0.6',    ans:'×100' },
  { lbl:'f', from:'14.8',  to:'0.148',  ans:'÷100' },
  { lbl:'g', from:'27.385',to:'2738.5', ans:'×100' },
  { lbl:'h', from:'8.07',  to:'0.807',  ans:'÷10' },
];

// ── s4: Word problems ──
const WORD_Q = [
  { lbl:'a', q:'What number does 4.145 have to be multiplied by to get 414.5?',  ans:'100',   opts:['100','10','1000','0.1'], guided:true, hint:'4.145 × 100 = 414.5 (decimal moves 2 places left).' },
  { lbl:'b', q:'What number does 17.1 have to be divided by to get 0.171?',      ans:'100',   opts:['100','10','1000','0.01'], guided:true, hint:'17.1 ÷ 100 = 0.171.' },
  { lbl:'c', q:'A number is multiplied by 10 to give 6.15. What is the number?', ans:'0.615', opts:['0.615','61.5','0.0615','6.15'] },
  { lbl:'d', q:'What number divided by 100 gives 0.125?',                        ans:'12.5',  opts:['12.5','1.25','125','0.125'] },
  { lbl:'e', q:'A number is divided by 100 to give 0.041. What is the number?',  ans:'4.1',   opts:['4.1','0.41','41','0.041'] },
  { lbl:'f', q:'A number is multiplied by 100 to give 34.8. What is the number?',ans:'0.348', opts:['0.348','3.48','0.0348','34.8'] },
  { lbl:'g', q:'What number multiplied by 100 gives 7.8?',                       ans:'0.078', opts:['0.078','0.78','0.0078','7.8'] },
  { lbl:'h', q:'What number divided by 100 gives 0.399?',                        ans:'39.9',  opts:['39.9','3.99','399','0.399'] },
];

// ── Helpers ──
function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }

// Generic group-of-MCQ check that fits the lesson's pattern.
function makeChecker(QS, sid, perGroup, sectionTitle, getAtt, increment, sel, setSt, fbState, setFB, prog) {
  return (ga, gi) => {
    increment(`${sid}g${gi}`); const att = getAtt(`${sid}g${gi}`) + 1;
    let ok = 0;
    setSt(prev => {
      const ns = { ...prev };
      ga.forEach(q => {
        const s = sel[q.lbl];
        if (s === q.ans) { ns[`${q.lbl}-${s}`] = 'correct'; ok++; }
        else if (s)      { ns[`${q.lbl}-${s}`] = 'wrong'; }
      });
      return ns;
    });
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. ${sectionTitle}` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Check the decimal point movement carefully.` };
    setFB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const allG = grp(QS, perGroup);
      const correctGroups = Object.values({ ...fbState, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        prog.markDone(sid, { correct: QS.length, total: QS.length, attempts: att });
      }
    }
  };
}

export default function L3_MultiplyDivide() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(4, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1St  = state.s1St  || {}, setS1St  = setField('s1St');
  const s1FB  = state.s1FB  || {}, setS1FB  = setField('s1FB');
  const s2Sel = state.s2Sel || {}, setS2Sel = setField('s2Sel');
  const s2St  = state.s2St  || {}, setS2St  = setField('s2St');
  const s2FB  = state.s2FB  || {}, setS2FB  = setField('s2FB');
  const s3Sel = state.s3Sel || {}, setS3Sel = setField('s3Sel');
  const s3St  = state.s3St  || {}, setS3St  = setField('s3St');
  const s3FB  = state.s3FB  || {}, setS3FB  = setField('s3FB');
  const s4Sel = state.s4Sel || {}, setS4Sel = setField('s4Sel');
  const s4St  = state.s4St  || {}, setS4St  = setField('s4St');
  const s4FB  = state.s4FB  || {}, setS4FB  = setField('s4FB');

  const checkS1 = makeChecker(MULT_Q, 's1', 2, '×10 → 1 place left, ×100 → 2 places left.', getAtt, increment, s1Sel, setS1St, s1FB, setS1FB, prog);
  const checkS2 = makeChecker(DIV_Q,  's2', 2, '÷10 → 1 place right, ÷100 → 2 places right.', getAtt, increment, s2Sel, setS2St, s2FB, setS2FB, prog);
  const checkS3 = makeChecker(OP_Q,   's3', 2, 'Count how many places the decimal moved, and which direction.', getAtt, increment, s3Sel, setS3St, s3FB, setS3FB, prog);
  const checkS4 = makeChecker(WORD_Q, 's4', 2, 'To undo ×, divide. To undo ÷, multiply.', getAtt, increment, s4Sel, setS4St, s4FB, setS4FB, prog);

  const renderArith = (QS, sid, sel, setSel, st, fb, checkFn) => grp(QS, 2).map((ga, gi) => (
    <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
      {ga.map((q, qi) => {
        const opts = q.opts.map(o => ({
          id: o, label: o,
          state: st[`${q.lbl}-${o}`] || (sel[q.lbl] === o ? 'selected' : 'default'),
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
              <span style={{ display:'inline-flex', alignItems:'center', background:'#DBEAFE', color:'#1E40AF', border:'1.5px solid #93C3FD', borderRadius:8, padding:'4px 12px', fontSize:22, fontWeight:900, fontFamily:'monospace' }}>
                {q.expr} =
              </span>
            </QItemLabel>
            <MCQOptions options={opts} onSelect={o => setSel(p => ({ ...p, [q.lbl]: o }))}/>
          </QItem>
        );
      })}
      <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkFn(ga, gi)} disabled={prog.done[sid]}/>
      {fb[gi] && <FeedbackBox type={fb[gi].type} message={fb[gi].text}/>}
    </QGroup>
  ));

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 3" completed={prog.completedCount} total={4}/>
      <div className="page">
        <ObjectiveCard text="Multiply and divide whole numbers and decimals by 10 and 100"/>
        <ExplainPanel title="Key Concept: Powers of 10">
          <RuleBox>
            <strong>×10</strong>: digits move <strong>1 place left</strong> (number gets bigger).<br/>
            <strong>×100</strong>: digits move <strong>2 places left</strong>.<br/>
            <strong>÷10</strong>: digits move <strong>1 place right</strong> (number gets smaller).<br/>
            <strong>÷100</strong>: digits move <strong>2 places right</strong>. Pad with zeros if needed.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={4}/>

        {/* s1: multiply */}
        <SectionCard badge={1} title="Multiply — answer these" tagType="mcq" tagLabel="MCQ"
          subtitle="Pick the correct answer. ★ Guided a & b"
          score={prog.done['s1']}>
          {renderArith(MULT_Q, 's1', s1Sel, setS1Sel, s1St, s1FB, checkS1)}
        </SectionCard>

        {/* s2: divide */}
        <SectionCard badge={2} title="Divide — answer these" tagType="mcq" tagLabel="MCQ"
          subtitle="Pick the correct answer. ★ Guided a & b"
          score={prog.done['s2']}>
          {renderArith(DIV_Q, 's2', s2Sel, setS2Sel, s2St, s2FB, checkS2)}
        </SectionCard>

        {/* s3: missing operation */}
        <SectionCard badge={3} title="Find the missing operation" tagType="mcq" tagLabel="MCQ"
          subtitle="Which operation turns the first number into the second? ★ Guided a & b"
          score={prog.done['s3']}>
          {grp(OP_Q, 2).map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const opts = OP_OPTS.map(o => ({
                  id: o, label: o,
                  state: s3St[`${q.lbl}-${o}`] || (s3Sel[q.lbl] === o ? 'selected' : 'default'),
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
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                        <span style={{ background:'#DBEAFE', color:'#1E40AF', border:'1.5px solid #93C3FD', borderRadius:8, padding:'4px 12px', fontSize:22, fontWeight:900, fontFamily:'monospace' }}>{q.from}</span>
                        <span style={{ fontSize:22, fontWeight:900, color:'var(--muted)' }}>→</span>
                        <span style={{ background:'#FEF3C7', color:'#92400E', border:'2px dashed var(--amber-border)', borderRadius:8, padding:'4px 14px', fontSize:22, fontWeight:900 }}>?</span>
                        <span style={{ fontSize:22, fontWeight:900, color:'var(--muted)' }}>→</span>
                        <span style={{ background:'#DCFCE7', color:'#15803D', border:'1.5px solid var(--green-border)', borderRadius:8, padding:'4px 12px', fontSize:22, fontWeight:900, fontFamily:'monospace' }}>{q.to}</span>
                      </div>
                    </QItemLabel>
                    <MCQOptions options={opts} onSelect={o => setS3Sel(p => ({ ...p, [q.lbl]: o }))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS3(ga, gi)} disabled={prog.done['s3']}/>
              {s3FB[gi] && <FeedbackBox type={s3FB[gi].type} message={s3FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* s4: word problems */}
        <SectionCard badge={4} title="Word problems" tagType="mcq" tagLabel="MCQ"
          subtitle="Read each problem carefully. ★ Guided a & b"
          score={prog.done['s4']}>
          {grp(WORD_Q, 2).map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const opts = q.opts.map(o => ({
                  id: o, label: o,
                  state: s4St[`${q.lbl}-${o}`] || (s4Sel[q.lbl] === o ? 'selected' : 'default'),
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
                      <span style={{ fontSize:16, fontWeight:700 }}>{q.q}</span>
                    </QItemLabel>
                    <MCQOptions options={opts} onSelect={o => setS4Sel(p => ({ ...p, [q.lbl]: o }))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS4(ga, gi)} disabled={prog.done['s4']}/>
              {s4FB[gi] && <FeedbackBox type={s4FB[gi].type} message={s4FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You can multiply and divide by 10 and 100 with confidence!" />}
      </div>
    </div>
  );
}

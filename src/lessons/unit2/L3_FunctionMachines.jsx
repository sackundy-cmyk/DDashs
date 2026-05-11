// ============================================================
//  lessons/unit2/L3_FunctionMachines.jsx
//  s1: drag digits → complete OUT row (Q1 · 4 machines, groups of 2)
//  s2: MCQ → identify the function machine rule (Q2 · 4 tables)
// ============================================================
import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import {
  ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
  FeedbackBox, LblCircle, CheckButton, Summary, GuidedHint,
} from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette } from '../../components/interactions/DigitComponents.jsx';
import { digitPickState } from '../../components/interactions/digitPickState.js';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

// Q1 — complete the output table (IN: 0–5)
const TABLE_QS = [
  { lbl:'a', rule:'+5',    ins:[0,1,2,3,4,5], outs:[5,6,7,8,9,10],     guided:true,  hint:'Add 5 to each input number.' },
  { lbl:'b', rule:'−3',    ins:[0,1,2,3,4,5], outs:[-3,-2,-1,0,1,2],   guided:true,  hint:'Subtract 3 from each input. Drag the − card first for negative answers.' },
  { lbl:'c', rule:'×4 −1', ins:[0,1,2,3,4,5], outs:[-1,3,7,11,15,19],  guided:false },
  { lbl:'d', rule:'×3 +1', ins:[0,1,2,3,4,5], outs:[1,4,7,10,13,16],   guided:false },
];

// Q2 — identify the rule (MCQ, one correct answer + three close distractors)
const RULE_QS = [
  { lbl:'a', ins:[0,1,2,3,4,5], outs:[0,2,4,6,8,10],  rule:'×2',    opts:['×2','+2','×3','×2−2'],    guided:true,  hint:'Which rule gives IN=1 → OUT=2 and IN=3 → OUT=6?' },
  { lbl:'b', ins:[0,1,2,3,4,5], outs:[3,4,5,6,7,8],   rule:'+3',    opts:['+3','+4','+2','×2+3'],    guided:true,  hint:'OUT − IN is the same every row. What is OUT − IN?' },
  { lbl:'c', ins:[0,1,2,3,4,5], outs:[2,4,6,8,10,12], rule:'×2+2',  opts:['×2+2','×2','×2+1','×3'],  guided:false },
  { lbl:'d', ins:[0,1,2,3,4,5], outs:[-1,2,5,8,11,14],rule:'×3−1',  opts:['×3−1','×3','×3+1','×2−1'],guided:false },
];

function grp(arr, n) {
  const out = [];
  for(let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i+n));
  return out;
}

export default function L3_FunctionMachines() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // Q1 state
  const tabD  = state.tabD  || {}, setTabD  = setField('tabD',  {});
  const tabSt = state.tabSt || {}, setTabSt = setField('tabSt', {});
  const tabFB = state.tabFB || {}, setTabFB = setField('tabFB', {});

  // Q2 state
  const ruleSel = state.ruleSel || {}, setRuleSel = setField('ruleSel', {});
  const ruleSt  = state.ruleSt  || {}, setRuleSt  = setField('ruleSt',  {});
  const ruleFB  = state.ruleFB  || {}, setRuleFB  = setField('ruleFB',  {});

  // Shuffle MCQ options once on mount
  const [shuf] = useState(() =>
    Object.fromEntries(RULE_QS.map(q => [q.lbl, shuffle(q.opts)]))
  );

  // ── Q1 check ──────────────────────────────────────────────
  const checkTable = (ga, gi) => {
    increment(`t${gi}`);
    const att = getAtt(`t${gi}`) + 1;
    let ok = 0;
    const ns = {...tabSt};
    ga.forEach(q => {
      const placed = tabD[q.lbl] || {};
      const allOk = q.outs.every((v, i) => parseInt(placed[i]) === v);
      ns[q.lbl] = allOk ? 'correct' : 'wrong';
      if(allOk) ok++;
    });
    setTabSt(ns);

    const total = ga.length;
    let fb;
    if(ok === total)   fb = { type:'correct', text:`All ${total} correct!` };
    else if(att >= 3)  fb = { type:'hint',    text:`Check each step carefully — apply the rule to one input at a time.` };
    else if(att === 2) fb = { type:'hint',    text:`${ok}/${total} correct. Work through each IN value step by step.` };
    else               fb = { type:'wrong',   text:`${ok}/${total} correct. Apply the rule to every input number.` };

    const newTabFB = {...tabFB, [gi]: fb};
    setTabFB(newTabFB);

    if(ok === total) {
      const numGroups = grp(TABLE_QS, 2).length;
      const doneCount = Object.values(newTabFB).filter(f => f.type === 'correct').length;
      if(doneCount >= numGroups) {
        const totalCells = TABLE_QS.reduce((n, q) => n + q.outs.length, 0);
        prog.markDone('s1', { correct: totalCells, total: totalCells, attempts: att });
      }
    }
  };

  // ── Q2 check ──────────────────────────────────────────────
  const checkRule = (ga, gi) => {
    increment(`r${gi}`);
    const att = getAtt(`r${gi}`) + 1;
    let ok = 0;
    const ns = {...ruleSt};
    ga.forEach(q => {
      const sel = ruleSel[q.lbl];
      if(sel === q.rule) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else if(sel)       { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setRuleSt(ns);

    const total = ga.length;
    let fb;
    if(ok === total)   fb = { type:'correct', text:`${total}/${total} rules correct!` };
    else if(att >= 3)  fb = { type:'hint',    text:`Try substituting IN=0 and IN=1 into each option to check.` };
    else if(att === 2) fb = { type:'hint',    text:`${ok}/${total} correct. Test each option — does it work for ALL IN values?` };
    else               fb = { type:'wrong',   text:`${ok}/${total} correct. Find what operation turns every IN into the matching OUT.` };

    const newRuleFB = {...ruleFB, [gi]: fb};
    setRuleFB(newRuleFB);

    if(ok === total) {
      const numGroups = grp(RULE_QS, 2).length;
      const doneCount = Object.values(newRuleFB).filter(f => f.type === 'correct').length;
      if(doneCount >= numGroups) {
        prog.markDone('s2', { correct: RULE_QS.length, total: RULE_QS.length, attempts: att });
      }
    }
  };

  // ── Click handler for table cells ─────────────────────────
  const handleCellClick = (q, idx, paletteId, st) => () => {
    if(st === 'correct') return;
    const sel = digitPickState.get(paletteId);
    if(sel === null) {
      // no digit selected — clear the cell
      setTabD(p => ({...p, [q.lbl]: {...(p[q.lbl]||{}), [idx]: ''}}));
      return;
    }
    setTabD(p => {
      const cur = (p[q.lbl]?.[idx]) || '';
      let next;
      if(sel === '-') {
        next = cur.startsWith('-') ? cur.slice(1) : '-' + cur;
      } else {
        next = cur + sel;
      }
      return {...p, [q.lbl]: {...(p[q.lbl]||{}), [idx]: next}};
    });
  };

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 2 · Lesson 3" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Use function machines to complete tables of results and identify function machine rules"/>
        <ExplainPanel title="Key Concept: Function Machines">
          <RuleBox>
            A <strong>function machine</strong> takes an IN number, applies an operation, and gives an OUT.<br/>
            <strong>Single step:</strong> IN=4 → +5 → OUT=9<br/>
            <strong>Two steps:</strong> IN=2 → ×4 → −1 → OUT=7 (do 2×4=8 first, then 8−1=7)
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* Q1: Complete the output table */}
        <SectionCard badge={1} title="Copy and complete the table of results for each function machine" tagType="drag" tagLabel="Drag Digits" subtitle="★ Guided: a & b" score={prog.done['s1']}>
          {grp(TABLE_QS, 2).map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`tp${gi}`} decimal={false} minus={true}/>
              {ga.map((q, qi) => {
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <span style={{fontSize:17, fontWeight:800}}>
                        Rule: <strong style={{color:'var(--blue)'}}>{q.rule}</strong>
                      </span>
                    </QItemLabel>
                    <div style={{overflowX:'auto', marginTop:8}}>
                      <table style={{borderCollapse:'separate', borderSpacing:0, borderRadius:10, overflow:'hidden', border:'2px solid var(--border)', minWidth:420}}>
                        <thead>
                          <tr>
                            <th style={{padding:'10px 14px', background:'#334155', color:'#fff', textAlign:'center', fontWeight:900, fontSize:15, whiteSpace:'nowrap'}}>IN</th>
                            {q.ins.map((v, idx) => (
                              <td key={idx} style={{padding:'10px 12px', textAlign:'center', fontSize:17, fontWeight:900, background:'#F8FAFF', color:'#334155', border:'1px solid var(--border)'}}>{v}</td>
                            ))}
                          </tr>
                          <tr>
                            <th style={{padding:'10px 14px', background:'var(--blue)', color:'#fff', textAlign:'center', fontWeight:900, fontSize:15, whiteSpace:'nowrap'}}>OUT</th>
                            {q.outs.map((v, idx) => {
                              const placed = tabD[q.lbl]?.[idx];
                              const st = tabSt[q.lbl];
                              const pid = `tp${gi}`;
                              const cellOk = st === 'correct' || (placed !== undefined && placed !== '' && parseInt(placed) === v);
                              const cellWrong = st === 'wrong' && placed !== undefined && placed !== '' && parseInt(placed) !== v;
                              return (
                                <td key={idx} style={{
                                  padding: 4, textAlign:'center',
                                  background: cellOk ? 'var(--green-bg)' : cellWrong ? 'var(--red-bg)' : 'var(--blue-light)',
                                  border: '1px solid var(--border)',
                                }}>
                                  <input
                                    type="text"
                                    value={placed || ''}
                                    readOnly
                                    onClick={handleCellClick(q, idx, pid, st)}
                                    style={{
                                      width: 52, height: 38, textAlign:'center',
                                      fontWeight: 900, fontSize: 17, border: 'none',
                                      background: 'transparent',
                                      cursor: st === 'correct' ? 'default' : 'pointer',
                                      color: cellOk ? 'var(--green)' : cellWrong ? 'var(--red)' : 'var(--blue-dark)',
                                    }}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkTable(ga, gi)}/>
              {tabFB[gi] && <FeedbackBox type={tabFB[gi].type} message={tabFB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q2: Identify the rule (MCQ) */}
        <SectionCard badge={2} title="Draw function machines for these tables of results — choose the correct rule" tagType="mcq" tagLabel="MCQ" subtitle="★ Guided: a & b" score={prog.done['s2']}>
          {grp(RULE_QS, 2).map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const opts = shuf[q.lbl] || q.opts;
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                    <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
                      <LblCircle letter={q.lbl}/>
                    </div>
                    <div style={{overflowX:'auto', marginBottom:12}}>
                      <table style={{borderCollapse:'separate', borderSpacing:0, borderRadius:10, overflow:'hidden', border:'2px solid var(--border)', minWidth:320}}>
                        <tbody>
                          <tr>
                            <th style={{padding:'8px 12px', background:'#334155', color:'#fff', textAlign:'center', fontWeight:900, fontSize:15}}>IN</th>
                            {q.ins.map((v, i) => (
                              <td key={i} style={{padding:'8px 10px', textAlign:'center', fontSize:17, fontWeight:900, background:'#F8FAFF', color:'#334155', border:'1px solid var(--border)'}}>{v}</td>
                            ))}
                          </tr>
                          <tr>
                            <th style={{padding:'8px 12px', background:'var(--blue)', color:'#fff', textAlign:'center', fontWeight:900, fontSize:15}}>OUT</th>
                            {q.outs.map((v, i) => (
                              <td key={i} style={{padding:'8px 10px', textAlign:'center', fontSize:17, fontWeight:900, background:'var(--blue-light)', color:'var(--blue-dark)', border:'1px solid var(--border)'}}>{v}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                      {opts.map(o => {
                        const oSt = ruleSt[`${q.lbl}-${o}`] || (ruleSel[q.lbl] === o ? 'selected' : 'default');
                        const locked = ['correct','wrong'].includes(oSt);
                        return (
                          <button
                            key={o}
                            onClick={() => !locked && setRuleSel(p => ({...p, [q.lbl]: o}))}
                            style={{
                              padding: '10px 20px', borderRadius: 10, fontSize: 16, fontWeight: 700,
                              fontFamily: 'var(--font)', cursor: locked ? 'default' : 'pointer',
                              border: `2px solid ${oSt==='correct'?'var(--green)':oSt==='wrong'?'var(--red)':oSt==='selected'?'#9333EA':'var(--border)'}`,
                              background: oSt==='correct'?'var(--green-bg)':oSt==='wrong'?'var(--red-bg)':oSt==='selected'?'#CE82FF':'white',
                              color: oSt==='correct'?'var(--green)':oSt==='wrong'?'var(--red)':oSt==='selected'?'white':'var(--text)',
                            }}
                          >
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkRule(ga, gi)}/>
              {ruleFB[gi] && <FeedbackBox type={ruleFB[gi].type} message={ruleFB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Well done! You can complete function machine tables and identify the rules!"/>}
      </div>
    </div>
  );
}

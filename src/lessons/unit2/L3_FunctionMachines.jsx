// ============================================================
//  lessons/unit2/L3_FunctionMachines.jsx
// ============================================================
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack, FeedbackBox, LblCircle, CheckButton, Summary, GuidedHint } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

// Q1: complete the output table
const TABLE_QS = [
  { lbl:'a', rule:'×4',     ins:[1,2,3,4], outs:[4,8,12,16],   guided:true,  hint:'Multiply each input by 4.' },
  { lbl:'b', rule:'+7',     ins:[3,6,9,12],outs:[10,13,16,19], guided:true,  hint:'Add 7 to each input.' },
  { lbl:'c', rule:'×5 −1',  ins:[1,2,3,4], outs:[4,9,14,19],   guided:false },
  { lbl:'d', rule:'÷2 +3',  ins:[4,6,8,10],outs:[5,6,7,8],     guided:false },
];

// Q2: identify the rule (MCQ)
const RULE_QS2 = [
  { lbl:'a', ins:[2,4,6,8], outs:[10,20,30,40], rule:'×5',   opts:['×5','+8','+4','×4'],  guided:true,  hint:'OUT = 5 × IN. Check: 2×5=10 ✓' },
  { lbl:'b', ins:[1,3,5,7], outs:[4,10,16,22],  rule:'×3+1', opts:['×3+1','×2+2','×3−1','+9'], guided:true },
  { lbl:'c', ins:[0,2,4,6], outs:[3,7,11,15],   rule:'×2+3', opts:['×2+3','×2+2','÷2+3','×3'], guided:false },
  { lbl:'d', ins:[5,10,15,20],outs:[1,2,3,4],   rule:'÷5',   opts:['÷5','−4','÷10','×5'], guided:false },
];

function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n)); return out; }

export default function L3_FunctionMachines() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();
  const tabD    = state.tabD    || {}, setTabD    = setField('tabD');
  const tabSt   = state.tabSt   || {}, setTabSt   = setField('tabSt');
  const tabFB   = state.tabFB   || {}, setTabFB   = setField('tabFB');
  const ruleSel = state.ruleSel || {}, setRuleSel = setField('ruleSel');
  const ruleSt  = state.ruleSt  || {}, setRuleSt  = setField('ruleSt');
  const ruleFB  = state.ruleFB  || {}, setRuleFB  = setField('ruleFB');

  const checkTable=(ga,gi)=>{
    increment(`t${gi}`);const att=getAtt(`t${gi}`)+1;
    let ok=0;const ns={...tabSt};
    ga.forEach(q=>{
      const placed=tabD[q.lbl]||{};
      const allOk=q.outs.every((v,i)=>parseInt(placed[i])===v);
      ns[q.lbl]=allOk?'correct':'wrong';
      if(allOk)ok++;
    });
    setTabSt(ns);
    const total=ga.length;
    let fb;
    if(ok===total) fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${total} correct. Apply the operations step by step.`};
    else fb={type:'wrong',text:'✗ Not all correct. Apply the rule to each input number.'};
    setTabFB(p=>({...p,[gi]:fb}));
    if(ok===total){
      const allG=grp(TABLE_QS,2);
      const correctGroups=Object.values({...tabFB,[gi]:fb}).filter(f=>f.type==='correct').length;
      if(correctGroups>=allG.length){
        const totalCells=TABLE_QS.reduce((n,q)=>n+q.outs.length,0);
        prog.markDone('s1',{correct:totalCells,total:totalCells,attempts:att});
      }
    }
  };

  const checkRule=(ga,gi)=>{
    increment(`r${gi}`);const att=getAtt(`r${gi}`)+1;
    let ok=0;const ns={...ruleSt};
    ga.forEach(q=>{
      const s=ruleSel[q.lbl];
      if(s===q.rule){ns[`${q.lbl}-${s}`]='correct';ok++;}
      else{if(s)ns[`${q.lbl}-${s}`]='wrong';}
    });
    setRuleSt(ns);
    const total=ga.length;
    let fb;
    if(ok===total) fb={type:'correct',text:`🎉 ${ok}/${total} rules correct!`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${total} correct. Try substituting IN=1 — does it give the right OUT?`};
    else fb={type:'wrong',text:'✗ Find what operation turns each IN into the matching OUT.'};
    setRuleFB(p=>({...p,[gi]:fb}));
    if(ok===total){
      const allG=grp(RULE_QS2,2);
      const correctGroups=Object.values({...ruleFB,[gi]:fb}).filter(f=>f.type==='correct').length;
      if(correctGroups>=allG.length){
        prog.markDone('s2',{correct:RULE_QS2.length,total:RULE_QS2.length,attempts:att});
      }
    }
  };

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 2 · Lesson 3" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Use function machines to complete tables of results and identify rules"/>
        <ExplainPanel title="Key Concept: Function Machines">
          <RuleBox>
            A <strong>function machine</strong> takes an IN number, applies an operation, and gives an OUT.<br/>
            <strong>Two operations:</strong> IN=3 → ×4 → −1 → OUT=11 (do 3×4=12 first, then 12−1=11)<br/>
            <strong>Finding the rule:</strong> Test each option — does it work for ALL IN values?
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>
        <SectionCard badge={1} title="Complete the output table for each function machine" tagType="drag" tagLabel="Drag Digits" subtitle="★ Guided: a & b" score={prog.done['s1']}>
          {grp(TABLE_QS,2).map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`tp${gi}`}/>
              {ga.map((q,qi)=>(
                <QItem key={q.lbl} last={qi===ga.length-1}>
                  {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:17,fontWeight:800}}>Rule: <strong style={{color:'var(--blue)'}}>{q.rule}</strong></span></QItemLabel>
                  <div style={{overflowX:'auto',marginTop:8}}>
                    <table style={{borderCollapse:'separate',borderSpacing:0,borderRadius:10,overflow:'hidden',border:'2px solid var(--border)',minWidth:360}}>
                      <thead>
                        <tr>
                          <th style={{padding:'10px 14px',background:'#334155',color:'#fff',textAlign:'center',fontWeight:900,fontSize:15}}>IN</th>
                          {q.ins.map((v,i)=><td key={i} style={{padding:'10px 12px',textAlign:'center',fontSize:17,fontWeight:900,background:'#F8FAFF',color:'#334155',border:'1px solid var(--border)'}}>{v}</td>)}
                        </tr>
                        <tr>
                          <th style={{padding:'10px 14px',background:'var(--blue)',color:'#fff',textAlign:'center',fontWeight:900,fontSize:15}}>OUT</th>
                          {q.outs.map((v,i)=>{
                            const placed=tabD[q.lbl]?.[i];
                            const st=tabSt[q.lbl];
                            const isOk=st==='correct'||(placed&&parseInt(placed)===v);
                            return (
                              <td key={i} style={{padding:4,textAlign:'center',background:isOk?'var(--green-bg)':st==='wrong'&&placed&&parseInt(placed)!==v?'var(--red-bg)':'var(--blue-light)',border:'1px solid var(--border)'}}>
                                <input type="text" value={placed||''} readOnly
                                  onDragOver={e=>e.preventDefault()}
                                  onDrop={e=>{e.preventDefault();const d=e.dataTransfer.getData('text/plain');if(d.startsWith('digit:')){const v2=d.split(':')[1];setTabD(p=>({...p,[q.lbl]:{...(p[q.lbl]||{}),[i]:(p[q.lbl]?.[i]||'')+v2}}));}}}
                                  onClick={()=>{if(tabSt[q.lbl]!=='correct')setTabD(p=>({...p,[q.lbl]:{...(p[q.lbl]||{}),[i]:''}}));}}
                                  style={{width:44,height:36,textAlign:'center',fontWeight:900,fontSize:17,border:'none',background:'transparent',cursor:tabSt[q.lbl]==='correct'?'default':'pointer',color:isOk?'var(--green)':st==='wrong'?'var(--red)':'var(--blue-dark)'}}/>
                              </td>
                            );
                          })}
                        </tr>
                      </thead>
                    </table>
                  </div>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkTable(ga,gi)}/>
              {tabFB[gi]&&<FeedbackBox type={tabFB[gi].type} message={tabFB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>
        <SectionCard badge={2} title="What is the rule for each function machine?" tagType="mcq" tagLabel="MCQ" score={prog.done['s2']}>
          {grp(RULE_QS2,2).map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q,qi)=>{
                const opts=shuffle(q.opts).map(o=>({id:o,label:o,state:ruleSt[`${q.lbl}-${o}`]||(ruleSel[q.lbl]===o?'selected':'default')}));
                return (
                  <QItem key={q.lbl} last={qi===ga.length-1}>
                    {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <LblCircle letter={q.lbl}/>
                    </div>
                    <div style={{overflowX:'auto',marginBottom:12}}>
                      <table style={{borderCollapse:'separate',borderSpacing:0,borderRadius:10,overflow:'hidden',border:'2px solid var(--border)',minWidth:280}}>
                        <tbody>
                          <tr>
                            <th style={{padding:'8px 12px',background:'#334155',color:'#fff',textAlign:'center',fontWeight:900,fontSize:15}}>IN</th>
                            {q.ins.map((v,i)=><td key={i} style={{padding:'8px 12px',textAlign:'center',fontSize:17,fontWeight:900,background:'#F8FAFF',color:'#334155',border:'1px solid var(--border)'}}>{v}</td>)}
                          </tr>
                          <tr>
                            <th style={{padding:'8px 12px',background:'var(--blue)',color:'#fff',textAlign:'center',fontWeight:900,fontSize:15}}>OUT</th>
                            {q.outs.map((v,i)=><td key={i} style={{padding:'8px 12px',textAlign:'center',fontSize:17,fontWeight:900,background:'var(--blue-light)',color:'var(--blue-dark)',border:'1px solid var(--border)'}}>{v}</td>)}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
                      {opts.map(o=>{
                        const locked=['correct','wrong','reveal'].includes(o.state);
                        return (
                          <button key={o.id} onClick={()=>!locked&&setRuleSel(p=>({...p,[q.lbl]:o.id}))} style={{
                            padding:'10px 18px',borderRadius:10,fontSize:16,fontWeight:700,
                            fontFamily:'var(--font)',cursor:locked?'default':'pointer',
                            border:`2px solid ${o.state==='correct'?'var(--green)':o.state==='wrong'?'var(--red)':o.state==='selected'?'#9333EA':'var(--border)'}`,
                            background:o.state==='correct'?'var(--green-bg)':o.state==='wrong'?'var(--red-bg)':o.state==='selected'?'#CE82FF':'white',
                            color:o.state==='correct'?'var(--green)':o.state==='wrong'?'var(--red)':o.state==='selected'?'white':'var(--text)',
                          }}>{o.label}</button>
                        );
                      })}
                    </div>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkRule(ga,gi)}/>
              {ruleFB[gi]&&<FeedbackBox type={ruleFB[gi].type} message={ruleFB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>
        {prog.allDone&&<Summary message="Well done! You can complete and identify function machine rules!"/>}
      </div>
    </div>
  );
}

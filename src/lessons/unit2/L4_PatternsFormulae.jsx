// ============================================================
//  lessons/unit2/L4_PatternsFormulae.jsx
// ============================================================
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack, FeedbackBox, LblCircle, CheckButton, Summary, GuidedHint } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

// Each question: a table with A row and B row; find formula for B in terms of A
const FORMULA_QS = [
  { lbl:'a', aVals:[1,2,3,4,5], bVals:[3,6,9,12,15], rule:'3n',   opts:['3n','n+3','2n+1','n×4'],  guided:true,  hint:'B = 3 × A. When A=1, B=3; when A=2, B=6.' },
  { lbl:'b', aVals:[1,2,3,4,5], bVals:[5,8,11,14,17],rule:'3n+2', opts:['3n+2','3n','n+5','2n+3'], guided:true,  hint:'B increases by 3 each time, so coefficient is 3. When A=1, B=5: 3×1+2=5 ✓' },
  { lbl:'c', aVals:[1,2,3,4,5], bVals:[2,4,6,8,10],  rule:'2n',   opts:['2n','n+2','2n+1','n×3'],  guided:false },
  { lbl:'d', aVals:[1,2,3,4,5], bVals:[4,7,10,13,16],rule:'3n+1', opts:['3n+1','4n','3n','n+3'],   guided:false },
  { lbl:'e', aVals:[1,2,3,4,5], bVals:[1,4,9,16,25], rule:'n²',   opts:['n²','2n','n+1','n×n+1'], guided:false },
  { lbl:'f', aVals:[0,1,2,3,4], bVals:[7,8,9,10,11], rule:'n+7',  opts:['n+7','7n','2n+7','n+8'], guided:false },
  { lbl:'g', aVals:[1,2,3,4,5], bVals:[6,11,16,21,26],rule:'5n+1',opts:['5n+1','5n','6n','5n+2'],  guided:false },
];

function grp(arr,n){const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out;}

export default function L4_PatternsFormulae() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(1, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();
  const sel  = state.sel  || {}, setSel  = setField('sel');
  const st   = state.st   || {}, setSt   = setField('st');
  const fb   = state.fb   || {}, setFb   = setField('fb');
  const done = state.done || {}, setDone = setField('done');

  const check = (ga, gi) => {
    increment(`g${gi}`); const att=getAtt(`g${gi}`)+1;
    let ok=0; const ns={...st};
    ga.forEach(q=>{
      const s=sel[q.lbl];
      if(s===q.rule){ns[`${q.lbl}-${s}`]='correct';ok++;}
      else{if(s)ns[`${q.lbl}-${s}`]='wrong';}
    });
    setSt(ns);
    const total=ga.length;
    let f;
    if(ok===total) f={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3) f={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) f={type:'hint',text:`💡 ${ok}/${total} correct. Find how much B increases each step — that's the coefficient of n.`};
    else f={type:'wrong',text:'✗ Substitute n=1 into each option. Which gives the right B value?'};
    setFb(p=>({...p,[gi]:f}));
    if(ok===total){
      const nd={...done,[gi]:true};setDone(nd);
      if(Object.keys(nd).length>=grp(FORMULA_QS,2).length) prog.markDone('s1','✓');
    }
  };

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 2 · Lesson 4" completed={prog.completedCount} total={1}/>
      <div className="page">
        <ObjectiveCard text="Identify and write formulae (rules) describing the relationship between two sets of numbers"/>
        <ExplainPanel title="Key Concept: Patterns and Formulae">
          <RuleBox>
            A <strong>formula</strong> uses <strong>n</strong> to represent any value in row A. Apply it to get row B.<br/>
            <strong>Finding the formula:</strong> 1) How much does B change for each step in A? That's the coefficient of n.<br/>
            2) When n=1, what is B? Adjust the constant. Check with n=2.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={1}/>
        <SectionCard badge={1} title="Find the formula for row B in terms of n (row A)" tagType="mcq" tagLabel="MCQ" subtitle="★ Guided: a & b">
          {grp(FORMULA_QS,2).map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q,qi)=>{
                const opts=shuffle(q.opts).map(o=>({id:o,label:`B = ${o}`,state:st[`${q.lbl}-${o}`]||(sel[q.lbl]===o?'selected':'default')}));
                return (
                  <QItem key={q.lbl} last={qi===ga.length-1}>
                    {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel><LblCircle letter={q.lbl}/></QItemLabel>
                    <div style={{overflowX:'auto',marginBottom:12}}>
                      <table style={{borderCollapse:'separate',borderSpacing:0,borderRadius:10,overflow:'hidden',border:'2px solid var(--border)',minWidth:360}}>
                        <tbody>
                          <tr>
                            <td style={{padding:'10px 14px',background:'#334155',color:'#fff',fontWeight:900,textAlign:'center',fontSize:15}}>A</td>
                            {q.aVals.map((v,i)=><td key={i} style={{padding:'10px 10px',textAlign:'center',fontSize:17,fontWeight:900,background:'#F8FAFF',color:'#334155',border:'1px solid var(--border)'}}>{v}</td>)}
                            <td style={{padding:'10px 14px',background:'#FEF3C7',color:'#92400E',fontWeight:900,textAlign:'center',fontSize:15,border:'2px solid #FCD34D'}}>n</td>
                          </tr>
                          <tr>
                            <td style={{padding:'10px 14px',background:'var(--blue)',color:'#fff',fontWeight:900,textAlign:'center',fontSize:15}}>B</td>
                            {q.bVals.map((v,i)=><td key={i} style={{padding:'10px 10px',textAlign:'center',fontSize:17,fontWeight:900,background:'#EEF4FF',color:'var(--blue)',border:'1px solid var(--border)'}}>{v}</td>)}
                            <td style={{padding:'10px 14px',background:'#FEF9E7',color:'#92400E',fontWeight:900,textAlign:'center',fontSize:15,border:'2px solid #FCD34D'}}>?</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <MCQOptions options={opts} onSelect={o=>setSel(p=>({...p,[q.lbl]:o}))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>check(ga,gi)}/>
              {fb[gi]&&<FeedbackBox type={fb[gi].type} message={fb[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>
        {prog.allDone&&<Summary message="Excellent! You can identify and write formulae for patterns!"/>}
      </div>
    </div>
  );
}



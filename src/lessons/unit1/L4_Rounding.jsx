// ============================================================
//  lessons/unit1/L4_Rounding.jsx
//  Unit 1 · Lesson 4: Rounding Decimals
// ============================================================
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, NumChip, CheckButton, Summary, GuidedHint } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

const ROUND_WHOLE = [
  { lbl:'a', n:3.7,  ans:4,  guided:true,  hint:'3.7 → tenths digit is 7 ≥ 5, so round up to 4.' },
  { lbl:'b', n:8.2,  ans:8,  guided:true,  hint:'8.2 → tenths digit is 2 < 5, so round down to 8.' },
  { lbl:'c', n:15.6, ans:16, guided:false },
  { lbl:'d', n:9.4,  ans:9,  guided:false },
  { lbl:'e', n:24.5, ans:25, guided:false },
  { lbl:'f', n:7.3,  ans:7,  guided:false },
  { lbl:'g', n:42.8, ans:43, guided:false },
  { lbl:'h', n:106.4,ans:106,guided:false },
];

const ROUND_1DP = [
  { lbl:'a', n:3.74,  ans:3.7,  guided:true,  hint:'3.74 → hundredths digit is 4 < 5, so keep 3.7.' },
  { lbl:'b', n:8.26,  ans:8.3,  guided:true,  hint:'8.26 → hundredths digit is 6 ≥ 5, so round up to 8.3.' },
  { lbl:'c', n:5.83,  ans:5.8,  guided:false },
  { lbl:'d', n:12.47, ans:12.5, guided:false },
  { lbl:'e', n:0.95,  ans:1.0,  guided:false },
  { lbl:'f', n:7.62,  ans:7.6,  guided:false },
];

function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }

export default function L4_Rounding() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();
  const sel1 = state.sel1 || {}, setSel1 = setField('sel1');
  const st1  = state.st1  || {}, setSt1  = setField('st1');
  const fb1  = state.fb1  || {}, setFb1  = setField('fb1');
  const sel2 = state.sel2 || {}, setSel2 = setField('sel2');
  const st2  = state.st2  || {}, setSt2  = setField('st2');
  const fb2  = state.fb2  || {}, setFb2  = setField('fb2');

  const buildOpts = (q, dp) => {
    const base = dp ? q.n : Math.floor(q.n);
    const opts = dp ? [q.n.toFixed(1), (q.n + 0.1).toFixed(1), (q.n - 0.1).toFixed(1), (parseFloat(q.n.toFixed(0))).toFixed(1)] : [q.ans, q.ans+1, q.ans-1, q.ans+2];
    return [...new Set(opts)].slice(0, 4).map((v, i) => ({ id: String(v), label: String(v), isCorrect: String(v) === (dp ? q.ans.toFixed(1) : String(q.ans)) }));
  };

  const check = (ga, gi, selState, setSelState, stState, setStState, fbState, setFbState, sid, qs) => {
    increment(`${sid}${gi}`); const att = getAtt(`${sid}${gi}`) + 1;
    let ok = 0; const ns = { ...stState };
    ga.forEach(q => {
      const sel = selState[q.lbl];
      if (sel === (sid === 's2' ? q.ans.toFixed(1) : String(q.ans))) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else { if (sel) ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setStState(ns);
    const total = ga.length;
    let fb;
    if (ok === total) fb = { type: 'correct', text: `🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type: 'hint', text: 'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type: 'hint', text: `💡 ${ok}/${total} correct. Look at the next decimal place — is it 5 or more?` };
    else fb = { type: 'wrong', text: '✗ Check the rounding digit. ≥ 5 rounds up, < 5 rounds down.' };
    setFbState(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const allG = grp(qs, 2);
      const correctGroups = Object.values({ ...fbState, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        prog.markDone(sid, { correct: qs.length, total: qs.length, attempts: att });
      }
    }
  };

  const renderSection = (qs, sid, selState, setSelState, stState, setStState, fbState, setFbState) => grp(qs, 2).map((ga, gi) => (
    <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
      {ga.map((q, qi) => {
        const opts = buildOpts(q, sid === 's2').map(o => ({ ...o, state: stState[`${q.lbl}-${o.id}`] || (selState[q.lbl] === o.id ? 'selected' : 'default') }));
        return (
          <QItem key={q.lbl} last={qi === ga.length - 1}>
            {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
            <QItemLabel><LblCircle letter={q.lbl} /><span style={{ fontSize: 18, fontWeight: 700 }}>Round</span><NumChip value={q.n} /><span style={{ fontSize: 18, fontWeight: 700 }}>{sid === 's1' ? 'to the nearest whole number' : 'to 1 decimal place'}</span></QItemLabel>
            <MCQOptions options={opts} onSelect={id => setSelState(p => ({ ...p, [q.lbl]: id }))} />
          </QItem>
        );
      })}
      <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => check(ga, gi, selState, setSelState, stState, setStState, fbState, setFbState, sid, qs)} />
      {fbState[gi] && <FeedbackBox type={fbState[gi].type} message={fbState[gi].text} />}
    </QGroup>
  ));

  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 4" completed={prog.completedCount} total={2} />
      <div className="page">
        <ObjectiveCard text="Round decimal numbers to the nearest whole number and to 1 decimal place" />
        <ExplainPanel title="Key Concept: Rounding Decimals">
          <RuleBox>
            Look at the digit after the place you are rounding to:<br />
            <strong>5 or more</strong> → round UP &nbsp;&nbsp; <strong>4 or less</strong> → round DOWN (stay the same)<br />
            e.g. 3.7 rounded to nearest whole = <strong>4</strong> (7 ≥ 5) &nbsp;&nbsp; 8.23 to 1 dp = <strong>8.2</strong> (3 &lt; 5)
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2} />
        <SectionCard badge={1} title="Round to the nearest whole number" tagType="mcq" tagLabel="MCQ" subtitle="★ Guided: a & b" score={prog.done['s1']}>
          {renderSection(ROUND_WHOLE, 's1', sel1, setSel1, st1, setSt1, fb1, setFb1)}
        </SectionCard>
        <SectionCard badge={2} title="Round to 1 decimal place" tagType="mcq" tagLabel="MCQ" subtitle="★ Guided: a & b" score={prog.done['s2']}>
          {renderSection(ROUND_1DP, 's2', sel2, setSel2, st2, setSt2, fb2, setFb2)}
        </SectionCard>
        {prog.allDone && <Summary message="Excellent! You can round decimals accurately!" />}
      </div>
    </div>
  );
}

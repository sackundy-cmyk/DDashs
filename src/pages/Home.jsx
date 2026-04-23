// ============================================================
//  pages/Home.jsx — dashboard: unit cards → UnitPage
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import curriculum from '../data/curriculum.json';

const UNIT_ICONS = { 1:'🔢', 2:'🔤', 3:'🔍', 4:'📏', 5:'🧮' };

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--font)' }}>

      <header style={{
        background:'var(--blue)', color:'#fff',
        padding:'18px 24px', display:'flex', alignItems:'center', gap:16,
        boxShadow:'var(--shadow-header)',
      }}>
        <div style={{ fontSize:28, fontWeight:900, letterSpacing:-1 }}>
          D<span style={{ color:'#93C5FD' }}>-DASH</span>
        </div>
        <div style={{ fontSize:15, fontWeight:700, opacity:0.8 }}>Interactive Maths</div>
      </header>

      <div style={{
        background:'linear-gradient(135deg,var(--blue-dark),var(--blue))',
        color:'#fff', padding:'40px 24px 48px', textAlign:'center',
      }}>
        <div style={{ fontSize:44, marginBottom:12 }}>📚</div>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:8 }}>Ready to practise maths?</h1>
        <p style={{ fontSize:16, opacity:0.85, maxWidth:480, margin:'0 auto' }}>
          Choose a unit to start. Each lesson has drag-and-drop activities, instant feedback, and progress tracking.
        </p>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 16px 80px' }}>

        <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:20 }}>All Units</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16, marginBottom:48 }}>
          {curriculum.units.map(unit => (
            <div key={unit.id} onClick={() => navigate('/unit/'+unit.id)}
              style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', cursor:'pointer', transition:'all .18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px '+unit.colour+'30'; e.currentTarget.style.borderColor=unit.colour; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--border)'; }}>
              <div style={{ background:unit.colour, padding:'16px 20px', color:'#fff' }}>
                <div style={{ fontSize:26, marginBottom:4 }}>{UNIT_ICONS[unit.id]||'📖'}</div>
                <div style={{ fontSize:11, fontWeight:700, opacity:0.8, textTransform:'uppercase', letterSpacing:'.5px' }}>Unit {unit.id}</div>
                <div style={{ fontSize:18, fontWeight:900, marginTop:2 }}>{unit.title}</div>
              </div>
              <div style={{ padding:'14px 20px' }}>
                {unit.lessons.slice(0,3).map(l=>(
                  <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'5px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:unit.colour, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, flexShrink:0 }}>{l.id}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', lineHeight:1.3 }}>{l.title}</div>
                  </div>
                ))}
                {unit.lessons.length > 3 && <div style={{ fontSize:12, color:'var(--muted)', fontWeight:700, marginTop:6 }}>+{unit.lessons.length-3} more</div>}
                <div style={{ marginTop:10, fontSize:13, fontWeight:800, color:unit.colour }}>Start unit →</div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize:20, fontWeight:800, color:'var(--text)', marginBottom:14 }}>Jump to any lesson</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
          {curriculum.units.flatMap(unit => unit.lessons.map(lesson => (
            <div key={unit.id+'-'+lesson.id}
              onClick={() => navigate('/unit/'+unit.id+'/lesson/'+lesson.id)}
              style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius-md)', padding:'11px 16px', cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:10 }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=unit.colour; e.currentTarget.style.background='var(--blue-light)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='#fff'; }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:unit.colour, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, flexShrink:0 }}>{unit.id}.{lesson.id}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', lineHeight:1.3 }}>{lesson.title}</div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}

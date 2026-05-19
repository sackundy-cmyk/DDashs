// ============================================================
//  src/pages/student/Certificates.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, LiftButton } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const TYPE_LABEL  = { lesson: 'Lesson Certificate', unit: 'Unit Certificate', course: 'Course Certificate' };
const TYPE_COLOR  = { lesson: '#1E40AF', unit: '#7C3AED', course: '#D97706' };
const TYPE_LIGHT  = { lesson: '#EFF6FF', unit: '#F5F3FF', course: '#FFFBEB' };

// Map curriculum units to titles
const UNIT_TITLES = {
  1:'Decimals', 2:'Algebra & Patterns', 3:'Multiples, Factors & Primes',
  4:'Addition & Subtraction', 5:'Mental & Written Calculations',
  6:'Geometry', 7:'Unit 1 — Integers', 8:'Unit 2 — Number',
};

// Small SVG seal / medal for the certificate card
function CertSeal({ color }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill={color} opacity="0.12"/>
      <circle cx="36" cy="36" r="28" fill={color} opacity="0.18"/>
      <circle cx="36" cy="36" r="22" fill={color}/>
      <text x="36" y="33" textAnchor="middle" dominantBaseline="middle"
        fill="#fff" fontFamily="Georgia,serif" fontSize="9" fontWeight="700"
        letterSpacing="0.5">D-DASH</text>
      <text x="36" y="44" textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.75)" fontFamily="sans-serif" fontSize="6">★ ★ ★</text>
      {/* outer ring decoration */}
      {Array.from({length:16},(_,i)=>{
        const a = (i/16)*Math.PI*2, r1=30, r2=33;
        return <line key={i}
          x1={36+Math.cos(a)*r1} y1={36+Math.sin(a)*r1}
          x2={36+Math.cos(a)*r2} y2={36+Math.sin(a)*r2}
          stroke={color} strokeWidth="1.5" opacity="0.5"/>;
      })}
    </svg>
  );
}

// Decorative corner for the card
function Corner({ flip }) {
  const sx = flip === 'h' || flip === 'both' ? -1 : 1;
  const sy = flip === 'v' || flip === 'both' ? -1 : 1;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" style={{
      position:'absolute',
      top: sy < 0 ? 'auto' : 0, bottom: sy < 0 ? 0 : 'auto',
      left: sx < 0 ? 'auto' : 0, right: sx < 0 ? 0 : 'auto',
    }} aria-hidden="true">
      <path d={`M2,14 L2,2 L14,2`} fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"
        transform={`translate(14,14) scale(${sx},${sy}) translate(-14,-14)`}/>
      <circle cx={sx<0?26:2} cy={sy<0?26:2} r="2.5" fill="#D97706"/>
    </svg>
  );
}

export default function Certificates() {
  const { user, token } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/certificates/student/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setCerts(d.certificates || []))
      .finally(() => setLoading(false));
  }, [user.id, token]);

  const downloadPdf = (cert) => {
    fetch(`${API}/certificates/${cert.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${cert.type}-${cert.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign:'center', padding:60, color:'#64748B' }}>Loading certificates…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Page header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#D97706,#92400E)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(217,119,6,0.30)' }}>
          <Icon name="award" size={26} color="#fff"/>
        </div>
        <div>
          <h2 style={{ fontSize:'var(--font-h1)', fontWeight:900, color:'#0F172A', margin:0, letterSpacing:'-0.03em' }}>
            My Certificates
          </h2>
          <p style={{ color:'#64748B', margin:'2px 0 0', fontSize:'var(--font-small)' }}>
            {certs.length} certificate{certs.length !== 1 ? 's' : ''} awarded
          </p>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className={s.card} style={{ textAlign:'center', padding:56, background:'#FDFCF8', border:'2px dashed #E2E8F0' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Icon name="award" size={34} color="#94A3B8"/>
          </div>
          <div style={{ fontSize:16, fontWeight:800, color:'#475569', marginBottom:6 }}>No certificates yet</div>
          <p style={{ color:'#94A3B8', margin:0, fontSize:14, maxWidth:320, marginInline:'auto' }}>
            Complete your lessons and your teacher will issue certificates to celebrate your progress.
          </p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:22 }}>
          {certs.map(c => {
            const color = TYPE_COLOR[c.type] || '#1E40AF';
            const light = TYPE_LIGHT[c.type] || '#EFF6FF';
            let subject = c.class_name;
            if (c.type === 'unit')   subject = UNIT_TITLES[c.unit] || `Unit ${c.unit}`;
            if (c.type === 'lesson') subject = `Lesson ${c.lesson_num}`;
            const issued = new Date(c.issued_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
            return (
              <div key={c.id} style={{
                borderRadius:20, overflow:'hidden',
                background:'#FDFCF8',
                border:`2px solid ${color}22`,
                boxShadow:'0 4px 18px rgba(15,23,42,0.08)',
                position:'relative',
                transition:'transform 0.18s, box-shadow 0.18s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 14px 36px ${color}30`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 18px rgba(15,23,42,0.08)';}}
              >
                {/* Corner decorations */}
                <Corner flip={false}/>
                <Corner flip="h"/>
                <Corner flip="v"/>
                <Corner flip="both"/>

                {/* Top accent bar */}
                <div style={{ height:6, background:`linear-gradient(90deg,${color},${color}88)` }}/>

                {/* Header area */}
                <div style={{ padding:'24px 24px 16px', display:'flex', gap:16, alignItems:'flex-start' }}>
                  <CertSeal color={color}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      display:'inline-block',
                      background:light, color, border:`1.5px solid ${color}33`,
                      borderRadius:20, padding:'3px 10px',
                      fontSize:10, fontWeight:800, letterSpacing:'0.08em',
                      textTransform:'uppercase', marginBottom:8,
                    }}>
                      {TYPE_LABEL[c.type]}
                    </div>
                    <div style={{ fontSize:17, fontWeight:900, color:'#0F172A', lineHeight:1.25, letterSpacing:'-0.02em' }}>
                      {subject}
                    </div>
                    {c.type !== 'course' && (
                      <div style={{ fontSize:12, color:'#64748B', fontWeight:600, marginTop:3 }}>
                        {c.class_name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ margin:'0 24px', height:1, background:`linear-gradient(90deg,transparent,${color}44,transparent)` }}/>

                {/* Footer */}
                <div style={{ padding:'14px 24px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
                  <div>
                    {c.score != null && (
                      <div style={{ fontSize:13, fontWeight:800, color, marginBottom:3 }}>
                        Score: {c.score}%
                      </div>
                    )}
                    <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>
                      Issued {issued}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadPdf(c)}
                    style={{
                      background:`linear-gradient(135deg,${color},${color}cc)`,
                      color:'#fff', border:'none', borderRadius:10,
                      padding:'9px 18px', fontSize:13, fontWeight:800,
                      cursor:'pointer', display:'flex', alignItems:'center', gap:7,
                      boxShadow:`0 3px 12px ${color}40`,
                      transition:'opacity 0.15s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                  >
                    <Icon name="download" size={14} color="#fff"/>
                    Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

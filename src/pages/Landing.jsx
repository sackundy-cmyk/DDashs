// ============================================================
//  src/pages/Landing.jsx — Splash screen (Screen 1)
//  User sees this first → clicks Sign In → goes to /login
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { DDashSplashMark } from '../components/DDashLogo.jsx';

// Deterministic star field — no Math.random in render
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 17.31 + 11.7) % 97).toFixed(2),
  y: ((i * 23.67 + 6.3)  % 93).toFixed(2),
  r: i % 5 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1.0,
  o: +(0.1 + (i % 6) * 0.08).toFixed(2),
}));

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [score, setScore]           = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  useEffect(() => {
    let frame;
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setScore(Math.round(e * 72));
      setLessonCount(Math.round(e * 23));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSignIn = () => {
    if (isAuthenticated) {
      const home = role === 'admin'    ? '/admin/dashboard'
                 : role === 'teacher'  ? '/teacher/dashboard'
                 : '/student/dashboard';
      navigate(home);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 120% 60% at 50% -10%, #0D2260 0%, #080E23 55%, #0A0D2E 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "'Nunito', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes floatLogo  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
        @keyframes floatCardA { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-6px)}  }
        @keyframes floatCardB { 0%,100%{transform:translateY(-4px)} 50%{transform:translateY(4px)}  }
        @keyframes shimmer    { 0%,100%{opacity:.55} 50%{opacity:1} }
        @keyframes pulseGlow  { 0%,100%{box-shadow:0 0 24px rgba(28,176,246,.25),0 0 0 1px rgba(28,176,246,.18)}
                                50%{box-shadow:0 0 48px rgba(28,176,246,.45),0 0 0 1px rgba(28,176,246,.35)} }
        @keyframes ringDraw   { from{stroke-dasharray:0 100.5} to{stroke-dasharray:72.36 100.5} }
        .land-btn:hover { transform:translateY(-3px)!important; box-shadow:0 16px 48px rgba(28,176,246,.55)!important; }
      `}</style>

      {/* ── Star field ── */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} aria-hidden>
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o} />
        ))}
      </svg>

      {/* ── Atmospheric glows ── */}
      <div style={{ position:'absolute', top:-120, left:'50%', transform:'translateX(-50%)',
        width:600, height:440, borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(21,101,192,.40) 0%, transparent 70%)',
        pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, right:-60,
        width:380, height:380,
        background:'radial-gradient(ellipse, rgba(100,40,200,.32) 0%, transparent 68%)',
        pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:0, left:-40,
        width:280, height:280,
        background:'radial-gradient(ellipse, rgba(21,101,192,.22) 0%, transparent 70%)',
        pointerEvents:'none' }} />

      {/* ── Main scrollable content ── */}
      <div style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', maxWidth:520,
        padding:'48px 24px 32px',
        flex:1,
      }}>

        {/* ── Logo ── */}
        <div style={{ animation:'floatLogo 4s ease-in-out infinite', marginBottom:16 }}>
          <DDashSplashMark size={168} />
        </div>

        {/* ── D-DASH wordmark ── */}
        <div style={{ display:'flex', alignItems:'baseline', gap:0, marginBottom:8, lineHeight:1 }}>
          <span style={{
            fontSize:56, fontWeight:900, letterSpacing:'-0.02em',
            background:'linear-gradient(135deg, #1CB0F6 0%, #00E5FF 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>D-</span>
          <span style={{ fontSize:56, fontWeight:900, color:'#FFFFFF', letterSpacing:'-0.02em' }}>DASH</span>
        </div>

        {/* ── Tagline ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          fontSize:11.5, fontWeight:800, letterSpacing:'0.20em',
          textTransform:'uppercase', color:'rgba(255,255,255,0.65)',
          marginBottom:16,
        }}>
          <span>LEARN</span>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#1CB0F6', display:'inline-block', flexShrink:0 }} />
          <span>PROGRESS</span>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#58CC02', display:'inline-block', flexShrink:0 }} />
          <span>ACHIEVE</span>
        </div>

        {/* ── Description ── */}
        <p style={{
          textAlign:'center', fontSize:15, lineHeight:1.7,
          color:'rgba(255,255,255,0.60)', maxWidth:320,
          margin:'0 auto 28px', fontWeight:500,
        }}>
          The all-in-one learning platform for smarter teaching and stronger learning.
        </p>

        {/* ── Floating stat cards ── */}
        <div style={{ display:'flex', gap:14, marginBottom:28, flexWrap:'wrap', justifyContent:'center' }}>

          {/* Avg Score — animated ring + smiley + count-up */}
          <div style={{
            background:'rgba(255,255,255,0.07)', backdropFilter:'blur(14px)',
            border:'1px solid rgba(255,255,255,0.13)', borderRadius:18,
            padding:'12px 18px', display:'flex', alignItems:'center', gap:12,
            animation:'floatCardA 3.6s ease-in-out infinite',
          }}>
            <div style={{ position:'relative', width:42, height:42, flexShrink:0 }}>
              <svg width="42" height="42" viewBox="0 0 42 42" style={{ position:'absolute', inset:0 }}>
                <circle cx="21" cy="21" r="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4.5" />
                <circle cx="21" cy="21" r="16" fill="none" stroke="#1CB0F6" strokeWidth="4.5"
                  strokeDasharray="0 100.5" strokeDashoffset="25.1"
                  strokeLinecap="round" transform="rotate(-90 21 21)"
                  style={{ animation:'ringDraw 1.5s ease-out forwards' }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>😊</div>
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:'white', lineHeight:1 }}>{score}%</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.50)', fontWeight:600, marginTop:3 }}>Avg. Score</div>
            </div>
          </div>

          {/* Lessons Live — smiley + count-up */}
          <div style={{
            background:'rgba(255,255,255,0.07)', backdropFilter:'blur(14px)',
            border:'1px solid rgba(255,255,255,0.13)', borderRadius:18,
            padding:'12px 18px', display:'flex', alignItems:'center', gap:12,
            animation:'floatCardB 4.2s ease-in-out infinite',
          }}>
            <div style={{
              width:42, height:42, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #58CC02, #47A301)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, boxShadow:'0 3px 12px rgba(88,204,2,0.4)',
            }}>😄</div>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:'white', lineHeight:1 }}>{lessonCount}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.50)', fontWeight:600, marginTop:3 }}>Lessons Live</div>
            </div>
          </div>
        </div>

        {/* ── Character illustration + wave ── */}
        <div style={{ width:'100%', position:'relative', marginBottom:4 }}>
          {/* Characters row */}
          <div style={{
            display:'flex', justifyContent:'space-around', alignItems:'flex-end',
            padding:'0 12px', position:'relative', zIndex:2, marginBottom:-14,
          }}>
            {/* Student boy */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                width:62, height:62, borderRadius:'50%',
                background:'linear-gradient(145deg, #1565C0, #1CB0F6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:30, boxShadow:'0 6px 20px rgba(28,176,246,0.45)',
                border:'2.5px solid rgba(255,255,255,0.18)',
              }}>👦</div>
              <div style={{
                background:'rgba(255,255,255,0.10)', borderRadius:8, padding:'4px 10px',
                fontSize:18, backdropFilter:'blur(8px)',
              }}>💻</div>
            </div>

            {/* Green checkmark */}
            <div style={{
              width:36, height:36, borderRadius:'50%', background:'#58CC02',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, fontWeight:900, color:'white',
              boxShadow:'0 4px 16px rgba(88,204,2,0.5)',
              alignSelf:'center', marginBottom:14,
            }}>✓</div>

            {/* Student girl */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                width:62, height:62, borderRadius:'50%',
                background:'linear-gradient(145deg, #FF9600, #FFC800)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:30, boxShadow:'0 6px 20px rgba(255,150,0,0.45)',
                border:'2.5px solid rgba(255,255,255,0.18)',
              }}>👧</div>
              <div style={{
                background:'rgba(255,255,255,0.10)', borderRadius:8, padding:'4px 10px',
                fontSize:18, backdropFilter:'blur(8px)',
              }}>📱</div>
            </div>

            {/* Teacher */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                width:62, height:62, borderRadius:'50%',
                background:'linear-gradient(145deg, #47A301, #58CC02)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:30, boxShadow:'0 6px 20px rgba(88,204,2,0.45)',
                border:'2.5px solid rgba(255,255,255,0.18)',
              }}>👩‍🏫</div>
              <div style={{
                background:'rgba(255,255,255,0.10)', borderRadius:8, padding:'4px 10px',
                fontSize:18, backdropFilter:'blur(8px)',
              }}>💻</div>
            </div>
          </div>

          {/* Purple/indigo wave */}
          <svg viewBox="0 0 520 80" width="100%" style={{ display:'block' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B1A8C" />
                <stop offset="100%" stopColor="#1A0D5A" />
              </linearGradient>
            </defs>
            <path d="M0 40 Q130 5 260 40 Q390 75 520 40 L520 80 L0 80 Z" fill="url(#wave-g)" />
          </svg>
        </div>

        {/* ── Mr. Mustafa Creator Credit ── */}
        <div style={{
          width:'100%', maxWidth:380,
          background:'rgba(6,14,42,0.72)',
          backdropFilter:'blur(18px)',
          border:'1px solid rgba(28,176,246,0.28)',
          borderRadius:22,
          padding:'20px 28px',
          textAlign:'center',
          margin:'0 auto 24px',
          animation:'pulseGlow 3s ease-in-out infinite',
          position:'relative',
          overflow:'hidden',
        }}>
          {/* Subtle inner glow top */}
          <div style={{
            position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
            width:'60%', height:1,
            background:'linear-gradient(90deg, transparent, rgba(28,176,246,0.6), transparent)',
          }} />

          <div style={{
            fontSize:10, fontWeight:800, letterSpacing:'0.22em',
            textTransform:'uppercase', color:'rgba(255,255,255,0.38)',
            marginBottom:8,
          }}>
            ✦&nbsp;&nbsp;Crafted with passion by&nbsp;&nbsp;✦
          </div>

          <div style={{
            fontSize:32, fontWeight:900, letterSpacing:'-0.02em',
            background:'linear-gradient(120deg, #1CB0F6 0%, #00E5FF 45%, #58CC02 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            lineHeight:1.1, marginBottom:6,
          }}>
            Mr. Mustafa
          </div>

          <div style={{
            fontSize:12, color:'rgba(255,255,255,0.48)', fontWeight:700,
            letterSpacing:'0.06em', textTransform:'uppercase',
          }}>
            Mathematics Educator&nbsp;·&nbsp;Platform Creator
          </div>
        </div>

        {/* ── Sign In button ── */}
        <button
          className="land-btn"
          onClick={handleSignIn}
          style={{
            background:'linear-gradient(135deg, #1565C0 0%, #1CB0F6 100%)',
            color:'white', border:'none',
            padding:'15px 52px', borderRadius:50,
            fontWeight:800, fontSize:16,
            cursor:'pointer', width:'100%', maxWidth:320,
            boxShadow:'0 8px 28px rgba(28,176,246,0.38)',
            transition:'transform 0.2s ease, box-shadow 0.2s ease',
            fontFamily:'inherit', letterSpacing:'0.03em',
            marginBottom:24,
          }}
        >
          {isAuthenticated ? 'Go to Dashboard →' : 'Sign In →'}
        </button>

        {/* ── Footer text ── */}
        <div style={{
          fontSize:14.5, fontWeight:600,
          color:'rgba(255,255,255,0.45)', textAlign:'center',
          marginBottom:16,
        }}>
          Your progress.{' '}
          <span style={{ color:'#1CB0F6', fontWeight:900 }}>Our mission.</span>
        </div>

        {/* ── Pagination dots ── */}
        <div style={{ display:'flex', gap:7, marginBottom:8 }}>
          {[true, false, false, false].map((active, i) => (
            <div key={i} style={{
              width: active ? 22 : 7, height:7, borderRadius:4,
              background: active ? '#1CB0F6' : 'rgba(255,255,255,0.22)',
              transition:'all 0.3s ease',
            }} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ============================================================
//  src/pages/Landing.jsx — Public landing page
// ============================================================

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const features = [
  { icon: '🎯', title: '14 Interactive Lessons', desc: 'Drag-and-drop, MCQ, digit building and Venn diagrams across 4 curriculum units' },
  { icon: '📊', title: 'Real-Time Progress',     desc: 'Teachers and admins track every student\'s performance at a glance' },
  { icon: '🏆', title: 'Curriculum-Aligned',     desc: 'Grade 5 Mathematics — Decimals, Algebra, Multiples, Factors & more' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  // If already logged in, send to correct dashboard
  const handleStart = () => {
    if (isAuthenticated) {
      const home = role === 'admin' ? '/admin/dashboard'
                 : role === 'teacher' ? '/teacher/dashboard'
                 : '/student/dashboard';
      navigate(home);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0b2b5e 0%, #1e4a8b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Inter', 'Nunito', sans-serif",
    }}>
      {/* Hero card */}
      <div style={{
        background: 'white',
        borderRadius: 32,
        padding: '48px 44px',
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #2563eb, #1e40af)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 20px',
          boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
        }}>
          📐
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0b2b5e', marginBottom: 8, letterSpacing: '-0.5px' }}>
          D-Dash
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', marginBottom: 36, lineHeight: 1.5 }}>
          Interactive Mathematics Learning for Primary School Students
        </p>

        <button
          onClick={handleStart}
          style={{
            background: '#2563eb', color: 'white', border: 'none',
            padding: '16px 40px', borderRadius: 40, fontWeight: 700,
            fontSize: 17, cursor: 'pointer', width: '100%',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; }}
          onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'; }}
        >
          {isAuthenticated ? 'Go to Dashboard →' : 'Sign In to Start →'}
        </button>
      </div>

      {/* Feature highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, maxWidth: 800, width: '100%', marginTop: 32,
      }}>
        {features.map(f => (
          <div key={f.title} style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '20px 22px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: '#a8c4e8', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 32 }}>
        D-Dash Platform · Grade 5 Mathematics · v1.0
      </p>
    </div>
  );
}

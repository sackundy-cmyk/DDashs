// ============================================================
//  src/pages/Login.jsx — Split-screen brand login
// ============================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { DDashSplashMark } from '../components/DDashLogo.jsx';

const ROLE_HOME = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const { login, loading, error } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email.trim(), password);
      const dest = from && from.startsWith(`/${user.role}`) ? from : ROLE_HOME[user.role];
      navigate(dest, { replace: true });
    } catch { /* error shown from context */ }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Nunito', sans-serif",
    }}>

      {/* ── LEFT: Brand / Splash panel ── */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(160deg, #0A1628 0%, #0D1F45 45%, #0C2A5C 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid dots */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} width="100%" height="100%">
          <defs>
            <pattern id="login-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>

        {/* Blue glow blobs */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(21,101,192,0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(0,180,216,0.18)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        {/* Main brand content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center', maxWidth: 380 }}>

          {/* Logo mark */}
          <div style={{
            padding: 4,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #1565C0, #00B4D8)',
            boxShadow: '0 8px 32px rgba(21,101,192,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            <DDashSplashMark size={120} />
          </div>

          {/* Wordmark */}
          <div>
            <div style={{
              fontSize: 52, fontWeight: 900, color: '#fff',
              letterSpacing: '0.10em', lineHeight: 1,
              textShadow: '0 2px 20px rgba(0,180,216,0.4)',
            }}>
              D-DASH
            </div>
            <div style={{
              marginTop: 10, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.25em', color: '#64B5F6',
              textTransform: 'uppercase',
            }}>
              LEARN &nbsp;·&nbsp; PROGRESS &nbsp;·&nbsp; ACHIEVE
            </div>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.6, maxWidth: 300 }}>
            The all-in-one learning platform for smarter teaching and stronger learning.
          </div>

          {/* Floating stat cards */}
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #58CC02,#47A301)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>72%</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Avg Score</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1CB0F6,#0E8DC8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="10" width="4" height="11" rx="1" fill="white" opacity="0.8"/>
                  <rect x="10" y="6" width="4" height="15" rx="1" fill="white" opacity="0.9"/>
                  <rect x="17" y="2" width="4" height="19" rx="1" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>22</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Lessons</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 8 }}>
            Your progress. <span style={{ color: '#1CB0F6' }}>Our mission.</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        padding: '40px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Small logo top for mobile / small screens */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: 'linear-gradient(135deg, #1565C0, #00B4D8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(21,101,192,0.35)',
              flexShrink: 0,
            }}>
              <DDashSplashMark size={36} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0D1B4B', letterSpacing: '0.06em', lineHeight: 1 }}>D-DASH</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Grade 5 · Mathematics</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0D1B4B', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 32px', fontWeight: 500 }}>
            Sign in to access your learning dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#94A3B8" strokeWidth="2"/>
                  <path d="M2 8l10 6 10-6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 18px 14px 46px',
                  borderRadius: 14, border: '2px solid #E2E8F0',
                  fontSize: 15, fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                  background: '#F8FAFC', color: '#0D1B4B',
                }}
                onFocus={e => { e.target.style.borderColor = '#1565C0'; e.target.style.boxShadow = '0 0 0 4px rgba(21,101,192,0.10)'; e.target.style.background = '#fff'; }}
                onBlur={e  => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="12" rx="2" stroke="#94A3B8" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 46px 14px 46px',
                  borderRadius: 14, border: '2px solid #E2E8F0',
                  fontSize: 15, fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                  background: '#F8FAFC', color: '#0D1B4B',
                }}
                onFocus={e => { e.target.style.borderColor = '#1565C0'; e.target.style.boxShadow = '0 0 0 4px rgba(21,101,192,0.10)'; e.target.style.background = '#fff'; }}
                onBlur={e  => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC'; }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPwd ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                )}
              </button>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1.5px solid #FCA5A5',
                borderRadius: 12, padding: '10px 14px',
                color: '#B91C1C', fontSize: 13.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B91C1C" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#B91C1C"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1565C0, #0288D1)',
                color: 'white', border: 'none', padding: '15px',
                width: '100%', borderRadius: 14,
                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 16, fontFamily: 'inherit',
                transition: 'opacity 0.2s, transform 0.15s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(21,101,192,0.40)',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: '#94A3B8' }}>
            ← <a href="/" style={{ color: '#1565C0', textDecoration: 'none', fontWeight: 700 }}>Back to home</a>
          </p>
        </div>
      </div>

      {/* Mobile: hide left panel below 768px */}
      <style>{`
        @media (max-width: 768px) {
          [data-login-left] { display: none !important; }
          [data-login-right] { padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  );
}

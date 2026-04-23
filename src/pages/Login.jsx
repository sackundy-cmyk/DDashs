// ============================================================
//  src/pages/Login.jsx — Role-based login
// ============================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLES = [
  { id: 'student', label: 'Student', icon: '👤' },
  { id: 'teacher', label: 'Teacher', icon: '📈' },
  { id: 'admin',   label: 'Admin',   icon: '🛡️' },
];

const DEMO_ACCOUNTS = [
  { role: 'admin',   email: 'admin1@ddash.com',   password: 'Admin@123',   label: 'Admin 1' },
  { role: 'teacher', email: 'teacher1@ddash.com', password: 'Teacher@123', label: 'Teacher 1' },
  { role: 'student', email: 'demo@ddash.com',     password: 'Demo@123',    label: 'Demo Student (all classes)' },
];

const ROLE_HOME = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);
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

  const fillDemo = (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setShowDemo(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0b2b5e 0%, #1e4a8b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: "'Inter', 'Nunito', sans-serif",
    }}>
      <div style={{
        background: 'white', borderRadius: 32, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            📐
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0b2b5e', lineHeight: 1 }}>D-Dash</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Sign in to continue</div>
          </div>
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 40,
                border: selectedRole === r.id ? 'none' : '1.5px solid #e2e8f0',
                background: selectedRole === r.id ? '#2563eb' : 'white',
                color: selectedRole === r.id ? 'white' : '#475569',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              <span>{r.icon}</span> {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 40,
              border: '1.5px solid #e2e8f0', marginBottom: 12,
              fontSize: 15, fontFamily: 'inherit', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 40,
              border: '1.5px solid #e2e8f0', marginBottom: 16,
              fontSize: 15, fontFamily: 'inherit', outline: 'none',
              boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
          />

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 12, padding: '10px 14px',
              color: '#b91c1c', fontSize: 14, marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', padding: '14px', width: '100%',
              borderRadius: 40, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16, fontFamily: 'inherit', transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <button
            type="button"
            onClick={() => setShowDemo(v => !v)}
            style={{
              background: 'none', border: 'none', color: '#2563eb',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              width: '100%', textAlign: 'center', padding: 4,
            }}
          >
            {showDemo ? '▲ Hide demo accounts' : '▼ Show demo accounts'}
          </button>

          {showDemo && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ACCOUNTS.map(a => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => fillDemo(a)}
                  style={{
                    background: '#f8fafd', border: '1.5px solid #e2e8f0',
                    borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0b2b5e' }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{a.email}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#2563eb',
                    background: '#dbeafe', padding: '3px 8px', borderRadius: 20,
                  }}>
                    {a.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
          ← <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Back to home</a>
        </p>
      </div>
    </div>
  );
}

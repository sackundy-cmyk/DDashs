// ============================================================
//  src/pages/student/Certificates.jsx
//  Lists every certificate the student has been issued.
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, LiftButton } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const TYPE_LABEL = {
  lesson: 'Lesson Certificate',
  unit:   'Unit Certificate',
  course: 'Course Certificate',
};

const TYPE_COLOR = {
  lesson: '#1CB0F6',
  unit:   '#CE82FF',
  course: '#58CC02',
};

const UNIT_TITLES = {
  1: 'Decimals',
  2: 'Algebra & Patterns',
  3: 'Multiples, Factors & Primes',
  4: 'Addition & Subtraction',
  5: 'Mental & Written Calculations',
};

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
    const url = `${API}/certificates/${cert.id}/pdf`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `certificate-${cert.type}-${cert.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      });
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading certificates…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
          My Certificates
        </h2>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 'var(--font-small)' }}>
          {certs.length} certificate{certs.length !== 1 ? 's' : ''} earned
        </p>
      </div>

      {certs.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <Icon name="award" size={40} color="#94A3B8" />
          <p style={{ color: '#64748B', marginTop: 12, fontSize: 14 }}>
            No certificates yet — complete lessons and your teacher will issue them.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {certs.map(c => {
            const color = TYPE_COLOR[c.type];
            let subject = c.class_name;
            if (c.type === 'unit') subject = `Unit ${c.unit} · ${UNIT_TITLES[c.unit] || ''}`.trim();
            if (c.type === 'lesson') subject = `Unit ${c.unit} · Lesson ${c.lesson_num}`;
            return (
              <div key={c.id} style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '2px solid #F0F4FF',
                boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${color}28`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,0.06)'; }}
              >
                {/* Vivid header */}
                <div style={{
                  height: 120,
                  background: `linear-gradient(145deg, ${color}, ${color}bb)`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="award" size={30} color="#fff" />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
                    {TYPE_LABEL[c.type]}
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4 }}>
                    {subject}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                    {c.class_name}
                  </div>
                  {c.score != null && (
                    <div style={{ fontSize: 13, color: '#58CC02', marginTop: 8, fontWeight: 800 }}>
                      Score: {c.score}%
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, fontWeight: 600 }}>
                    Issued {new Date(c.issued_at).toLocaleDateString()}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <LiftButton variant="primary" size="sm" icon="download" onClick={() => downloadPdf(c)}>
                      Download PDF
                    </LiftButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

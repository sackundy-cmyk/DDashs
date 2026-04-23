// ============================================================
//  pages/UnitPage.jsx — unit overview with lesson cards
// ============================================================

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import curriculum from '../data/curriculum.json';

export default function UnitPage() {
  const { unitId } = useParams();
  const navigate   = useNavigate();
  const unit = curriculum.units.find(u => u.id === parseInt(unitId));

  if (!unit) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font)' }}>
        Unit not found. <Link to="/" style={{ color: 'var(--blue)' }}>Go home</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)' }}>
      {/* Header */}
      <header style={{
        background: unit.colour, color: '#fff', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,.15)',
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff',
          borderRadius: 999, padding: '6px 14px', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, fontFamily: 'var(--font)',
        }}>
          ← Home
        </button>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 700 }}>Unit {unit.id}</div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{unit.title}</div>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px 80px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
          {unit.lessons.length} Lessons
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {unit.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/unit/${unit.id}/lesson/${lesson.id}`)}
              style={{
                background: '#fff', border: '1.5px solid var(--border)',
                borderRadius: 16, padding: '20px 24px',
                cursor: 'pointer', transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 16,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = unit.colour;
                e.currentTarget.style.boxShadow = `0 4px 16px ${unit.colour}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Number badge */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: unit.colour, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900, flexShrink: 0,
              }}>
                {lesson.id}
              </div>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>
                  Lesson {lesson.id} of {unit.lessons.length}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ color: unit.colour, fontSize: 22, fontWeight: 900 }}>›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  NetFoldViewer.jsx
//  Shows a flat net SVG, animates a "fold" into the 3D shape.
//  After fold animation, shows Shape3DViewer for the result.
//
//  Props:
//    netId   : string  — key into NET_DEFS (see below)
//    onFold  : fn()    — called when fold animation completes
// ============================================================

import { useState } from 'react';
import Shape3DViewer from './Shape3DViewer.jsx';

// ── SVG net definitions ──────────────────────────────────────
// Each net is a simple SVG drawing of the unfolded shape

function NetTriangularPrism() {
  // Two triangles + 3 rectangles
  return (
    <svg viewBox="0 0 260 200" width="100%" style={{ maxWidth: 300 }}>
      {/* 3 rectangles (side faces) */}
      <rect x={10}  y={70}  width={70} height={80} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
      <rect x={80}  y={70}  width={70} height={80} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
      <rect x={150} y={70}  width={70} height={80} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
      {/* Top triangle */}
      <polygon points="45,70 115,70 80,20" fill="#34D399" stroke="#1E293B" strokeWidth={2}/>
      {/* Bottom triangle */}
      <polygon points="45,150 115,150 80,200" fill="#34D399" stroke="#1E293B" strokeWidth={2}/>
    </svg>
  );
}

function NetSquarePyramid() {
  return (
    <svg viewBox="0 0 220 220" width="100%" style={{ maxWidth: 280 }}>
      {/* Square base */}
      <rect x={70} y={70} width={80} height={80} fill="#FBBF24" stroke="#1E293B" strokeWidth={2}/>
      {/* 4 triangle faces */}
      <polygon points="70,70 150,70 110,20"   fill="#F87171" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="150,70 150,150 200,110" fill="#F87171" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="70,150 150,150 110,200" fill="#F87171" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="70,70 70,150 20,110"    fill="#F87171" stroke="#1E293B" strokeWidth={2}/>
    </svg>
  );
}

function NetTetrahedron() {
  return (
    <svg viewBox="0 0 260 220" width="100%" style={{ maxWidth: 300 }}>
      {/* 4 equilateral triangles in a strip */}
      <polygon points="80,10 160,10 120,80"    fill="#A78BFA" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="80,10 120,80 40,80"     fill="#A78BFA" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="120,80 200,80 160,150"  fill="#A78BFA" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="40,80 120,80 80,150"    fill="#A78BFA" stroke="#1E293B" strokeWidth={2}/>
    </svg>
  );
}

function NetCuboid() {
  return (
    <svg viewBox="0 0 360 240" width="100%" style={{ maxWidth: 360 }}>
      {/* Cross-shaped net */}
      <rect x={100} y={10}  width={80} height={60} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
      <rect x={10}  y={70}  width={80} height={60} fill="#34D399" stroke="#1E293B" strokeWidth={2}/>
      <rect x={100} y={70}  width={80} height={60} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
      <rect x={180} y={70}  width={80} height={60} fill="#34D399" stroke="#1E293B" strokeWidth={2}/>
      <rect x={260} y={70}  width={80} height={60} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
      <rect x={100} y={130} width={80} height={60} fill="#60A5FA" stroke="#1E293B" strokeWidth={2}/>
    </svg>
  );
}

function NetPentagonalPrism() {
  return (
    <svg viewBox="0 0 360 220" width="100%" style={{ maxWidth: 360 }}>
      {/* 5 rectangles + 2 pentagons */}
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={10 + i*66} y={70} width={60} height={80}
          fill="#38BDF8" stroke="#1E293B" strokeWidth={2}/>
      ))}
      <polygon points="50,70 90,70 110,40 70,15 30,40" fill="#FBBF24" stroke="#1E293B" strokeWidth={2}/>
      <polygon points="50,150 90,150 110,180 70,205 30,180" fill="#FBBF24" stroke="#1E293B" strokeWidth={2}/>
    </svg>
  );
}

const NET_DEFS = {
  'triangular-prism':   { Component: NetTriangularPrism,  shape3d: 'triangular-prism',   label: 'Triangular Prism' },
  'square-pyramid':     { Component: NetSquarePyramid,    shape3d: 'square-pyramid',     label: 'Square-based Pyramid' },
  'triangular-pyramid': { Component: NetTetrahedron,      shape3d: 'triangular-pyramid', label: 'Triangular Pyramid (Tetrahedron)' },
  'cuboid':             { Component: NetCuboid,           shape3d: 'cuboid',             label: 'Cuboid' },
  'pentagonal-prism':   { Component: NetPentagonalPrism,  shape3d: 'pentagonal-prism',   label: 'Pentagonal Prism' },
};

export default function NetFoldViewer({ netId = 'square-pyramid', onFold }) {
  const [phase, setPhase] = useState('net'); // 'net' | 'folding' | 'shape'
  const def = NET_DEFS[netId] || NET_DEFS['square-pyramid'];
  const NetSvg = def.Component;

  const handleFold = () => {
    setPhase('folding');
    setTimeout(() => {
      setPhase('shape');
      onFold?.();
    }, 1800);
  };

  return (
    <div style={{ fontFamily: 'var(--font)', textAlign: 'center' }}>
      {phase === 'net' && (
        <>
          <div style={{
            border: '2px dashed var(--border)', borderRadius: 16,
            padding: 20, background: 'var(--bg)',
            display: 'inline-block', minWidth: 280,
          }}>
            <NetSvg />
          </div>
          <div style={{ marginTop: 14 }}>
            <button
              onClick={handleFold}
              style={{
                background: 'var(--blue)', color: 'white', border: 'none',
                borderRadius: 12, padding: '12px 36px', fontFamily: 'var(--font)',
                fontSize: 16, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30,111,217,0.35)',
              }}
            >
              ▶ Fold
            </button>
          </div>
        </>
      )}

      {phase === 'folding' && (
        <div style={{
          height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, border: '6px solid var(--blue)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 15 }}>Folding…</p>
        </div>
      )}

      {phase === 'shape' && (
        <>
          <p style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
            ✓ This net folds into a {def.label}!
          </p>
          <Shape3DViewer shape={def.shape3d} height={260} />
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            Drag to rotate the shape
          </p>
        </>
      )}
    </div>
  );
}

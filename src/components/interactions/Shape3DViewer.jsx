// ============================================================
//  Shape3DViewer.jsx
//  Interactive 3D shape viewer — Three.js + OrbitControls
//  Props:
//    shape  : string ID (see SHAPE_DEFS below)
//    mode   : 'view' | 'count-faces' | 'count-edges' | 'count-vertices'
//    height : number (px, default 320)
// ============================================================

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ── Pastel face colours ─────────────────────────────────────
const FACE_COLOURS = [
  '#60A5FA','#34D399','#F87171','#FBBF24',
  '#A78BFA','#FB923C','#38BDF8','#4ADE80',
];

// ── Shape geometry factories ────────────────────────────────
function makePrism(sides, radiusTop = 1, radiusBottom = 1, height = 1.6) {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides, 1, false);
}
function makePyramid(sides, radius = 1, height = 1.8) {
  return new THREE.CylinderGeometry(0, radius, height, sides, 1, false);
}

const SHAPE_DEFS = {
  'cube':               { geo: () => new THREE.BoxGeometry(1.8, 1.8, 1.8), faces: 6,  edges: 12, vertices: 8 },
  'cuboid':             { geo: () => new THREE.BoxGeometry(2.4, 1.4, 1.4), faces: 6,  edges: 12, vertices: 8 },
  'triangular-prism':   { geo: () => makePrism(3),  faces: 5,  edges: 9,  vertices: 6 },
  'pentagonal-prism':   { geo: () => makePrism(5),  faces: 7,  edges: 15, vertices: 10 },
  'hexagonal-prism':    { geo: () => makePrism(6),  faces: 8,  edges: 18, vertices: 12 },
  'triangular-pyramid': { geo: () => makePyramid(3), faces: 4,  edges: 6,  vertices: 4 },
  'square-pyramid':     { geo: () => makePyramid(4), faces: 5,  edges: 8,  vertices: 5 },
  'pentagonal-pyramid': { geo: () => makePyramid(5), faces: 6,  edges: 10, vertices: 6 },
};

// ── Build scene objects ─────────────────────────────────────
function buildMesh(shape) {
  const def = SHAPE_DEFS[shape];
  const geo = def.geo();

  // Colour faces by group (Three.js CylinderGeometry has groups for caps/barrel)
  const mats = FACE_COLOURS.map(c =>
    new THREE.MeshPhongMaterial({ color: c, transparent: true, opacity: 0.92, side: THREE.DoubleSide })
  );
  // For box geometry — 6 face groups
  if (geo instanceof THREE.BoxGeometry) {
    return new THREE.Mesh(geo, mats.slice(0, 6));
  }
  // For cylinder-based — assign per group
  const sides = geo.parameters.radialSegments;
  const matArr = [];
  // barrel faces (sides pieces → but we want uniform side colour)
  matArr.push(mats[0]);  // barrel/lateral
  matArr.push(mats[1]);  // top cap
  matArr.push(mats[2]);  // bottom cap
  return new THREE.Mesh(geo, matArr);
}

function buildEdgeLines(mesh) {
  const edges = new THREE.EdgesGeometry(mesh.geometry);
  const mat = new THREE.LineBasicMaterial({ color: '#1E293B', linewidth: 2 });
  return new THREE.LineSegments(edges, mat);
}

function buildVertexDots(mesh) {
  const pos = mesh.geometry.attributes.position;
  const seen = new Set();
  const points = [];
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    if (!seen.has(key)) {
      seen.add(key);
      points.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    }
  }
  const dotGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: '#DC2626' });
  const group = new THREE.Group();
  points.forEach(p => {
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(p);
    group.add(dot);
  });
  return group;
}

// ── Component ───────────────────────────────────────────────
export default function Shape3DViewer({ shape = 'cube', mode = 'view', height = 320 }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = height;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(3, 2.5, 4);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 8, 5);
    scene.add(dir);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;

    // Shape mesh
    const mesh = buildMesh(shape);
    scene.add(mesh);

    // Edge lines (always visible for structure)
    const edgeLines = buildEdgeLines(mesh);
    scene.add(edgeLines);

    // Vertex dots (shown in count-vertices mode)
    const vertexDots = buildVertexDots(mesh);
    scene.add(vertexDots);
    vertexDots.visible = false;

    stateRef.current = { mesh, edgeLines, vertexDots };

    // Animation loop
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize observer
    const ro = new ResizeObserver(() => {
      const nw = el.clientWidth;
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [shape, height]);

  // React to mode changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const { mesh, edgeLines, vertexDots } = s;

    // Reset
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => { m.opacity = 0.92; m.wireframe = false; });
    } else {
      mesh.material.opacity = 0.92;
      mesh.material.wireframe = false;
    }
    edgeLines.material.color.set('#1E293B');
    edgeLines.material.linewidth = 2;
    vertexDots.visible = false;

    if (mode === 'count-faces') {
      // Make faces more distinct — keep colours, slightly increase opacity
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => { m.opacity = 0.98; });
      }
    } else if (mode === 'count-edges') {
      edgeLines.material.color.set('#F59E0B');
      edgeLines.material.linewidth = 4;
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => { m.opacity = 0.5; });
      } else {
        mesh.material.opacity = 0.5;
      }
    } else if (mode === 'count-vertices') {
      vertexDots.visible = true;
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => { m.opacity = 0.4; });
      } else {
        mesh.material.opacity = 0.4;
      }
    }
  }, [mode]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #EEF4FF 0%, #F0F9FF 100%)',
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}

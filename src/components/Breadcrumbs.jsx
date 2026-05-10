// ============================================================
//  Breadcrumbs.jsx — path strip shown under the dashboard topbar
// ============================================================

import { Link, useLocation, useParams, matchPath } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import curriculum from '../data/curriculum.json';

const ROLE_HOME = {
  student: { path: '/student/dashboard', label: 'Home' },
  teacher: { path: '/teacher/dashboard', label: 'Home' },
  admin:   { path: '/admin/dashboard',   label: 'Home' },
};

const STATIC_LABELS = {
  '/student/dashboard': 'Dashboard',
  '/student/classes':   'My Classes',
  '/teacher/dashboard': 'Dashboard',
  '/teacher/classes':   'Classes',
  '/teacher/students':  'Students',
  '/teacher/reports':   'Reports',
  '/admin/dashboard':   'Dashboard',
  '/admin/teachers':    'Teachers',
  '/admin/students':    'Students',
  '/admin/classes':     'Classes',
  '/admin/reports':     'Reports',
};

function buildCrumbs(pathname, role) {
  const home = ROLE_HOME[role] || { path: '/', label: 'Home' };
  const crumbs = [home];

  // Lesson route: /student/lesson/:unitId/:lessonId
  const lesson = matchPath('/student/lesson/:unitId/:lessonId', pathname);
  if (lesson) {
    const u = parseInt(lesson.params.unitId, 10);
    const l = parseInt(lesson.params.lessonId, 10);
    const unit = curriculum.units.find(x => x.id === u);
    const lObj = unit?.lessons.find(x => x.id === l);
    crumbs.push({ path: '/student/classes', label: 'My Classes' });
    if (unit) crumbs.push({ path: '/student/classes', label: `Unit ${unit.id} · ${unit.title}` });
    if (lObj) crumbs.push({ path: pathname, label: `Lesson ${lObj.id} · ${lObj.title}` });
    return crumbs;
  }

  if (STATIC_LABELS[pathname] && pathname !== home.path) {
    crumbs.push({ path: pathname, label: STATIC_LABELS[pathname] });
  }
  return crumbs;
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { role } = useAuth();
  const crumbs = buildCrumbs(pathname, role);
  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 8, padding: '10px 28px',
      background: '#fff', borderBottom: '1px solid var(--border)',
      fontSize: 15, fontFamily: 'var(--font)',
    }}>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {last
              ? <span style={{ color: 'var(--text)', fontWeight: 800 }}>{c.label}</span>
              : <Link to={c.path} style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>{c.label}</Link>}
            {!last && <span style={{ color: 'var(--muted)', fontWeight: 700 }}>›</span>}
          </span>
        );
      })}
    </nav>
  );
}

// ============================================================
//  src/components/DashboardLayout.jsx — shared nav shell
// ============================================================

import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import s from './DashboardLayout.module.css';

// ── Nav configs per role ──────────────────────────────────────

const STUDENT_NAV = [
  { label: 'Dashboard', icon: '⊞',  path: '/student/dashboard' },
  { label: 'My Classes', icon: '📚', path: '/student/classes'   },
];

const TEACHER_NAV = [
  { label: 'Dashboard', icon: '⊞',  path: '/teacher/dashboard' },
  { label: 'Classes',   icon: '📚', path: '/teacher/classes'   },
  { label: 'Students',  icon: '👥', path: '/teacher/students'  },
  { label: 'Reports',   icon: '📊', path: '/teacher/reports'   },
  { label: 'Settings',  icon: '⚙',  path: '/teacher/settings'  },
];

const ADMIN_NAV = [
  { label: 'Dashboard', icon: '⊞',  path: '/admin/dashboard' },
  { label: 'Teachers',  icon: '🎓', path: '/admin/teachers'  },
  { label: 'Students',  icon: '👥', path: '/admin/students'  },
  { label: 'Classes',   icon: '📚', path: '/admin/classes'   },
  { label: 'Reports',   icon: '📊', path: '/admin/reports'   },
  { label: 'Settings',  icon: '⚙',  path: '/admin/settings'  },
];

const NAV_MAP = { student: STUDENT_NAV, teacher: TEACHER_NAV, admin: ADMIN_NAV };

const ROLE_LABELS = { student: 'Student Portal', teacher: 'Teacher Portal', admin: 'Admin Panel' };
const ROLE_ICONS  = { student: '👤', teacher: '📈', admin: '🛡️' };

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({ user, role }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const navItems   = NAV_MAP[role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className={s.sidebar}>
      {/* Logo */}
      <div className={s.logoArea}>
        <div className={s.logoIcon}>{ROLE_ICONS[role]}</div>
        <div>
          <div className={s.logoText}>D-Dash</div>
          <div className={s.logoRole}>{ROLE_LABELS[role]}</div>
        </div>
      </div>

      {/* Nav items */}
      <div className={s.navMenu}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${s.navItem} ${isActive ? s.navItemActive : ''}`
            }
          >
            <span className={s.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* User block + logout */}
      <div className={s.sidebarBottom}>
        <div className={s.sidebarUser}>
          <div className={s.userAvatar}>{initials(user?.name)}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className={s.userName}>{user?.name}</div>
            <div className={s.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button className={s.logoutBtn} onClick={handleLogout}>
          <span className={s.navIcon}>🚪</span>
          Log out
        </button>
      </div>
    </nav>
  );
}

// ── Top bar ───────────────────────────────────────────────────

const PAGE_TITLES = {
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

function TopBar({ user }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'D-Dash';

  return (
    <header className={s.topBar}>
      <span className={s.pageTitle}>{title}</span>
      <div className={s.topBarRight}>
        <span className={s.topBarName}>{user?.name}</span>
        <div className={s.topBarAvatar}>{initials(user?.name)}</div>
      </div>
    </header>
  );
}

// ── Layout wrapper ────────────────────────────────────────────

export default function DashboardLayout({ children }) {
  const { user, role } = useAuth();

  return (
    <div className={s.app}>
      <Sidebar user={user} role={role} />
      <div className={s.mainArea}>
        <TopBar user={user} />
        <Breadcrumbs />
        <main className={s.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}

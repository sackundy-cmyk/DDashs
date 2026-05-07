// ============================================================
//  DashboardLayout.jsx — enhanced shell (sidebar + topbar)
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import { Icon, Avatar } from './EnhancedUI.jsx';
import { DDashIcon } from './DDashLogo.jsx';
import s from './DashboardLayout.module.css';

// ── Nav configs per role ──────────────────────────────────────

const STUDENT_NAV = [
  { label: 'Dashboard',    icon: 'dashboard', path: '/student/dashboard'    },
  { label: 'My Classes',   icon: 'classes',   path: '/student/classes'      },
  { label: 'Quizzes',      icon: 'reports',   path: '/student/quizzes'      },
  { label: 'Certificates', icon: 'award',     path: '/student/certificates' },
];

const TEACHER_NAV = [
  { label: 'Dashboard', icon: 'dashboard', path: '/teacher/dashboard' },
  { label: 'Classes',   icon: 'classes',   path: '/teacher/classes'   },
  { label: 'Students',  icon: 'students',  path: '/teacher/students'  },
  { label: 'Quizzes',   icon: 'reports',   path: '/teacher/quizzes'   },
  { label: 'Reports',   icon: 'chart',     path: '/teacher/reports'   },
  { label: 'Settings',  icon: 'settings',  path: '/teacher/settings'  },
];

const ADMIN_NAV = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
  { label: 'Teachers',  icon: 'teachers',  path: '/admin/teachers'  },
  { label: 'Students',  icon: 'students',  path: '/admin/students'  },
  { label: 'Classes',   icon: 'classes',   path: '/admin/classes'   },
  { label: 'Reports',   icon: 'reports',   path: '/admin/reports'   },
  { label: 'Settings',  icon: 'settings',  path: '/admin/settings'  },
];

const NAV_MAP = { student: STUDENT_NAV, teacher: TEACHER_NAV, admin: ADMIN_NAV };

const ROLE_LABELS = { student: 'Student Portal', teacher: 'Teacher Portal', admin: 'Admin Panel' };

const ROLE_AVATAR_BG = {
  student: '#58CC02',
  teacher: '#1CB0F6',
  admin:   '#CE82FF',
};

// Per-path accent color for nav icon boxes and active dot
const NAV_ACCENT = {
  '/student/dashboard':    '#58CC02',
  '/student/classes':      '#1CB0F6',
  '/student/quizzes':      '#CE82FF',
  '/student/certificates': '#FFC800',
  '/teacher/dashboard': '#58CC02',
  '/teacher/classes':   '#1CB0F6',
  '/teacher/students':  '#FF9600',
  '/teacher/quizzes':   '#CE82FF',
  '/teacher/reports':   '#FFC800',
  '/teacher/settings':  '#94A3B8',
  '/admin/dashboard': '#58CC02',
  '/admin/teachers':  '#1CB0F6',
  '/admin/students':  '#FF9600',
  '/admin/classes':   '#CE82FF',
  '/admin/reports':   '#FFC800',
  '/admin/settings':  '#94A3B8',
};

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({ user, role, isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const navItems   = NAV_MAP[role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };
  const avatarBg = ROLE_AVATAR_BG[role] || '#1E6FD9';

  return (
    <nav className={`${s.sidebar} ${isOpen ? s.sidebarOpen : ''}`} onClick={onClose}>
      {/* Logo */}
      <div className={s.logoArea}>
        <div className={s.logoIcon}>
          <DDashIcon size={28} />
        </div>
        <div>
          <div className={s.logoText}>D-DASH</div>
          <div className={s.logoRole}>{ROLE_LABELS[role]}</div>
        </div>
      </div>

      <div className={s.divider} />

      {/* Nav items */}
      <div className={s.navMenu}>
        {navItems.map(item => {
          const accent = NAV_ACCENT[item.path] || '#818CF8';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${s.navItem} ${isActive ? s.navItemActive : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={s.navIconBox}
                    style={isActive ? { background: `${accent}30` } : {}}
                  >
                    <Icon name={item.icon} size={17} color={isActive ? accent : '#94A3B8'} />
                  </span>
                  {item.label}
                  {isActive && (
                    <span
                      className={s.activeDot}
                      style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User block + logout */}
      <div className={s.sidebarBottom}>
        <div className={s.sidebarUser}>
          <Avatar name={user?.name || ''} size={32} bg={avatarBg} />
          <div className={s.userInfo}>
            <div className={s.userName}>{user?.name}</div>
            <div className={s.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button className={s.logoutBtn} onClick={handleLogout}>
          <Icon name="logout" size={14} color="currentColor" />
          Log out
        </button>
      </div>
    </nav>
  );
}

// ── Top bar ───────────────────────────────────────────────────

const PAGE_TITLES = {
  '/student/dashboard':    'Dashboard',
  '/student/classes':      'My Classes',
  '/student/quizzes':      'Quizzes',
  '/student/certificates': 'Certificates',
  '/teacher/dashboard': 'Dashboard',
  '/teacher/classes':   'Classes',
  '/teacher/students':  'Students',
  '/teacher/quizzes':   'Quizzes',
  '/teacher/reports':   'Reports',
  '/teacher/settings':  'Settings',
  '/admin/dashboard':   'Dashboard',
  '/admin/teachers':    'Teachers',
  '/admin/students':    'Students',
  '/admin/classes':     'Classes',
  '/admin/reports':     'Reports',
  '/admin/settings':    'Settings',
};

function TopBar({ user, role, onHamburger }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'D-Dash';
  const avatarBg = ROLE_AVATAR_BG[role] || '#1E6FD9';

  return (
    <header className={s.topBar}>
      <div className={s.titleArea}>
        <button className={s.hamburger} onClick={onHamburger} aria-label="Open menu">
          <Icon name="menu" size={20} color="currentColor" />
        </button>
        <span className={s.pageTitle}>{title}</span>
      </div>
      <div className={s.topBarRight}>
        <button className={s.bellBtn} aria-label="Notifications">
          <Icon name="bell" size={16} color="currentColor" />
          <span className={s.bellDot} />
        </button>
        <div className={s.userLockup}>
          <Avatar name={user?.name || ''} size={32} bg={avatarBg} />
          <span className={s.topBarName}>{user?.name}</span>
          <Icon name="chevron_down" size={14} color="#64748B" />
        </div>
      </div>
    </header>
  );
}

// ── Layout wrapper ────────────────────────────────────────────

export default function DashboardLayout({ children }) {
  const { user, role } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change so navigating doesn't leave it hanging open
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  return (
    <div className={s.app}>
      <Sidebar user={user} role={role} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div
        className={`${s.drawerBackdrop} ${drawerOpen ? s.drawerBackdropOpen : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div className={s.mainArea}>
        <TopBar user={user} role={role} onHamburger={() => setDrawerOpen(true)} />
        <Breadcrumbs />
        <main className={s.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}

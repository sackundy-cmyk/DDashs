// ============================================================
//  DashboardLayout.jsx — enhanced shell (sidebar + topbar)
// ============================================================

import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';
import { Icon, Avatar } from './EnhancedUI.jsx';
import s from './DashboardLayout.module.css';

// ── Nav configs per role ──────────────────────────────────────

const STUDENT_NAV = [
  { label: 'Dashboard',  icon: 'dashboard', path: '/student/dashboard' },
  { label: 'My Classes', icon: 'classes',   path: '/student/classes'   },
];

const TEACHER_NAV = [
  { label: 'Dashboard', icon: 'dashboard', path: '/teacher/dashboard' },
  { label: 'Classes',   icon: 'classes',   path: '/teacher/classes'   },
  { label: 'Students',  icon: 'students',  path: '/teacher/students'  },
  { label: 'Reports',   icon: 'reports',   path: '/teacher/reports'   },
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
  student: '#1E6FD9',
  teacher: '#0891B2',
  admin:   '#7C3AED',
};

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({ user, role }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const navItems   = NAV_MAP[role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };
  const avatarBg = ROLE_AVATAR_BG[role] || '#1E6FD9';

  return (
    <nav className={s.sidebar}>
      {/* Logo */}
      <div className={s.logoArea}>
        <div className={s.logoIcon}>
          <Icon name="zap" size={18} color="#fff" />
        </div>
        <div>
          <div className={s.logoText}>D-Dash</div>
          <div className={s.logoRole}>{ROLE_LABELS[role]}</div>
        </div>
      </div>

      <div className={s.divider} />

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
            {({ isActive }) => (
              <>
                <span className={s.navIconBox}>
                  <Icon name={item.icon} size={16} color={isActive ? '#fff' : '#94A3B8'} />
                </span>
                {item.label}
                {isActive && <span className={s.activeDot} />}
              </>
            )}
          </NavLink>
        ))}
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
  '/student/dashboard': 'Dashboard',
  '/student/classes':   'My Classes',
  '/teacher/dashboard': 'Dashboard',
  '/teacher/classes':   'Classes',
  '/teacher/students':  'Students',
  '/teacher/reports':   'Reports',
  '/teacher/settings':  'Settings',
  '/admin/dashboard':   'Dashboard',
  '/admin/teachers':    'Teachers',
  '/admin/students':    'Students',
  '/admin/classes':     'Classes',
  '/admin/reports':     'Reports',
  '/admin/settings':    'Settings',
};

function TopBar({ user, role }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'D-Dash';
  const avatarBg = ROLE_AVATAR_BG[role] || '#1E6FD9';

  return (
    <header className={s.topBar}>
      <span className={s.pageTitle}>{title}</span>
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

  return (
    <div className={s.app}>
      <Sidebar user={user} role={role} />
      <div className={s.mainArea}>
        <TopBar user={user} role={role} />
        <Breadcrumbs />
        <main className={s.pageBody}>
          {children}
        </main>
      </div>
    </div>
  );
}

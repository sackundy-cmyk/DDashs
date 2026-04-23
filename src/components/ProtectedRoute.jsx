// ============================================================
//  src/components/ProtectedRoute.jsx
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Wrap a route to require authentication and optionally a specific role.
 * <ProtectedRoute roles={['teacher','admin']}> redirects to /login if wrong role.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    // Redirect to the correct dashboard for the actual role
    const home = role === 'admin' ? '/admin/dashboard'
               : role === 'teacher' ? '/teacher/dashboard'
               : '/student/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}

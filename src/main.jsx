// ============================================================
//  main.jsx — application entry point
// ============================================================

import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-tokens/tokens.css';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { StudentProvider } from './contexts/StudentContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { initTouchDrag } from './utils/touchDragPolyfill.js';

// Enable drag-and-drop on touch devices (tablets, phones)
initTouchDrag();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <StudentProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </StudentProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

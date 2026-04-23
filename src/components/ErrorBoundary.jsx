// ============================================================
//  components/ErrorBoundary.jsx
//  Catches render errors and shows a friendly fallback.
// ============================================================

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you could send to an error tracking service here
    console.error('D-DASH error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', fontFamily: 'var(--font)', padding: 24,
        }}>
          <div style={{
            background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16,
            padding: 40, maxWidth: 480, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 24 }}>
              An unexpected error occurred. Your progress has been saved.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              style={{
                background: 'var(--blue)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              Go back home
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                marginTop: 24, textAlign: 'left', fontSize: 12, color: 'var(--red)',
                background: 'var(--red-bg)', borderRadius: 8, padding: 12, overflow: 'auto',
              }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

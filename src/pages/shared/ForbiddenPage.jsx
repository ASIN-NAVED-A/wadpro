import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function ForbiddenPage({ requiredRole, userRole }) {
  const navigate = useNavigate();
  const { switchDemoRole } = useAuth();

  return (
    <div
      className="container page-wrapper"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          textAlign: 'center',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-warning-soft)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Access Restricted (403)
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          You don't have permission to view this section. This page requires an{' '}
          <strong>{requiredRole || 'authorized'}</strong> account, but you are currently signed in as an{' '}
          <strong>{userRole || 'unauthorized role'}</strong>.
        </p>

        {/* Demo switcher convenience */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            width: '100%',
          }}
        >
          Testing role boundaries? You can switch to the required role for demonstration:
          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => switchDemoRole(requiredRole || 'employer')}
              className="btn btn-sm btn-secondary"
            >
              Switch to {requiredRole || 'Other'} Account
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

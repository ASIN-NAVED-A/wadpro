import React from 'react';
import { HelpCircle, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
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
          maxWidth: '500px',
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
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HelpCircle size={32} />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Page Not Found (404)
        </h1>

        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          The link you followed might be broken, or the job posting or page has been removed.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/jobs" className="btn btn-secondary">
            <Search size={16} />
            <span>Browse Jobs</span>
          </Link>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Briefcase, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0 24px 0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={16} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>
              Smart<span style={{ color: 'var(--color-primary)' }}>JobPortal</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
            <Link to="/jobs">Find Jobs</Link>
            <Link to="/employee/recommendations">Recommendations</Link>
            <Link to="/login">Employer Portal</Link>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Smart Job Portal with Personalized Recommendation System. All rights reserved.
          </div>
          <div>
            API Base: <code>http://localhost:5000/api/v1</code> · Client CORS: <code>http://localhost:5173</code>
          </div>
        </div>
      </div>
    </footer>
  );
}

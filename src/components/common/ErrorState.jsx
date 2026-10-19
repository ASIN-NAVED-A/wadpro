import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while retrieving data. Please check your connection and try again.',
  onRetry,
  isNetworkError = false,
}) {
  return (
    <div
      className="card"
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-danger-soft)',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-danger-soft)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertTriangle size={26} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
        {message}
      </p>
      {isNetworkError && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            maxWidth: '460px',
          }}
        >
          Tip: Ensure the Node.js backend server is running on port 5000 and CORS client URL matches <code>http://localhost:5173</code>.
        </div>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary"
          style={{ marginTop: '8px' }}
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

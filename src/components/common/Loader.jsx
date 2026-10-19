import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading...', size = 28 }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '32px 16px',
        color: 'var(--color-text-secondary)',
      }}
    >
      <Loader2 size={size} className="spin" color="var(--color-primary)" />
      {message && <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>}
    </div>
  );
}

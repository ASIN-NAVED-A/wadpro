import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No items found',
  description = 'Try adjusting your search criteria or resetting active filters.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--color-surface)',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-soft)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px',
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary"
          style={{ marginTop: '8px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

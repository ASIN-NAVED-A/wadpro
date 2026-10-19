import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Skeleton width="48px" height="48px" borderRadius="10px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Skeleton width="80px" height="24px" borderRadius="9999px" />
        <Skeleton width="90px" height="24px" borderRadius="9999px" />
      </div>
      <Skeleton width="50%" height="16px" />
      <div style={{ display: 'flex', gap: '6px' }}>
        <Skeleton width="70px" height="22px" borderRadius="6px" />
        <Skeleton width="85px" height="22px" borderRadius="6px" />
        <Skeleton width="60px" height="22px" borderRadius="6px" />
      </div>
    </div>
  );
}

export default Skeleton;

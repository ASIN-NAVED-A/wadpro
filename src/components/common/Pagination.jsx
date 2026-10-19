import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and neighbours
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '32px',
      }}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn btn-secondary btn-sm"
        aria-label="Previous page"
        style={{ padding: '6px 10px' }}
      >
        <ChevronLeft size={16} />
        <span>Prev</span>
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} style={{ padding: '0 6px', color: 'var(--color-text-muted)' }}>
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            aria-current={p === currentPage ? 'page' : undefined}
            style={{ minWidth: '36px', padding: '6px 8px' }}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn btn-secondary btn-sm"
        aria-label="Next page"
        style={{ padding: '6px 10px' }}
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

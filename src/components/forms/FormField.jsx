import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function FormField({
  id,
  label,
  error,
  hint,
  reviewFlag,
  reviewHint,
  required = false,
  children,
}) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-group">
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label htmlFor={id} className="form-label" style={{ margin: 0 }}>
            <span>
              {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
            </span>
          </label>
          {reviewFlag && (
            <span className="review-flag" title={reviewHint || 'Extracted from resume, please verify'}>
              <AlertTriangle size={12} />
              <span>Please review</span>
            </span>
          )}
        </div>
      )}

      {/* Render child with aria-describedby and error props */}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id,
            'aria-invalid': Boolean(error),
            'aria-describedby': describedBy,
            className: `${children.props.className || ''} ${error ? 'has-error' : ''}`.trim(),
          })
        : children}

      {hint && !error && (
        <div id={hintId} className="form-hint">
          {hint}
        </div>
      )}

      {reviewHint && reviewFlag && !error && (
        <div className="form-hint" style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} />
          <span>{reviewHint}</span>
        </div>
      )}

      {error && (
        <div id={errorId} className="form-error" role="alert">
          <AlertCircle size={14} />
          <span>{typeof error === 'string' ? error : error.message}</span>
        </div>
      )}
    </div>
  );
}

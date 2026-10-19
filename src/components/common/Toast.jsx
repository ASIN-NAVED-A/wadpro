import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error' }),
    info: (message, title = 'Information') => addToast({ title, message, type: 'info' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="alert"
            style={{
              pointerEvents: 'auto',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: `1px solid ${
                item.type === 'success'
                  ? 'var(--color-success)'
                  : item.type === 'error'
                  ? 'var(--color-danger)'
                  : 'var(--color-primary)'
              }`,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'toastIn 200ms ease',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {item.type === 'success' && <CheckCircle2 size={18} color="var(--color-success)" />}
              {item.type === 'error' && <AlertCircle size={18} color="var(--color-danger)" />}
              {item.type === 'info' && <Info size={18} color="var(--color-primary)" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {item.title && (
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  {item.title}
                </div>
              )}
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {item.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              aria-label="Close notification"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function TagInput({
  id,
  value = [],
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags = 25,
  hasError = false,
  'aria-describedby': ariaDescribedBy,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (val) => {
    const trimmed = (val || inputValue).trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setInputValue('');
      return;
    }
    if (value.length >= maxTags) return;

    onChange([...value, trimmed]);
    setInputValue('');
  };

  const handleRemove = (indexToRemove) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemove(value.length - 1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        minHeight: '44px',
      }}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            aria-label={`Remove ${tag}`}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              display: 'flex',
              padding: '0',
            }}
          >
            <X size={13} />
          </button>
        </span>
      ))}

      <div style={{ display: 'flex', flex: 1, minWidth: '130px', alignItems: 'center' }}>
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : 'Add more...'}
          aria-describedby={ariaDescribedBy}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            width: '100%',
            background: 'transparent',
            padding: '4px 0',
            color: 'var(--color-text-primary)',
          }}
        />
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => handleAdd()}
            aria-label="Add tag"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              padding: '2px',
            }}
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

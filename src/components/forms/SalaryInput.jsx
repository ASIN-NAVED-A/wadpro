import React from 'react';

export default function SalaryInput({
  minSalary,
  maxSalary,
  period = 'Annual',
  currency = 'INR',
  type = 'CTC',
  onChangeMin,
  onChangeMax,
  onChangePeriod,
  onChangeCurrency,
  onChangeType,
  errors = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        <div>
          <label
            htmlFor="salary-min"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}
          >
            Minimum Amount ({currency})
          </label>
          <input
            id="salary-min"
            type="number"
            min="0"
            step="1000"
            value={minSalary ?? ''}
            onChange={(e) => onChangeMin(e.target.value)}
            className={`form-input ${errors.minSalary ? 'has-error' : ''}`}
            placeholder="e.g. 800000"
          />
          {errors.minSalary && (
            <div style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '2px' }}>
              {errors.minSalary}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="salary-max"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}
          >
            Maximum Amount ({currency})
          </label>
          <input
            id="salary-max"
            type="number"
            min="0"
            step="1000"
            value={maxSalary ?? ''}
            onChange={(e) => onChangeMax(e.target.value)}
            className={`form-input ${errors.maxSalary ? 'has-error' : ''}`}
            placeholder="e.g. 1400000"
          />
          {errors.maxSalary && (
            <div style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '2px' }}>
              {errors.maxSalary}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="salary-currency"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}
          >
            Currency
          </label>
          <select
            id="salary-currency"
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value)}
            className="form-select"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="salary-period"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}
          >
            Period
          </label>
          <select
            id="salary-period"
            value={period}
            onChange={(e) => onChangePeriod(e.target.value)}
            className="form-select"
          >
            <option value="Annual">Annual (Per Year)</option>
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
            <option value="Daily">Daily</option>
            <option value="Hourly">Hourly</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="salary-type"
            style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}
          >
            Salary Type
          </label>
          <select
            id="salary-type"
            value={type}
            onChange={(e) => onChangeType(e.target.value)}
            className="form-select"
          >
            <option value="CTC">CTC (Cost to Company)</option>
            <option value="Gross">Gross Salary</option>
            <option value="Take-home">Take-home / In-hand</option>
          </select>
        </div>
      </div>
    </div>
  );
}

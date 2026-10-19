import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, RotateCcw, X, SlidersHorizontal, Info } from 'lucide-react';
import TagInput from '../forms/TagInput';

export default function JobFilters({
  filters,
  onChange,
  onReset,
  isMobileOpen = false,
  onCloseMobile,
  clientFiltered = false,
}) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleFieldChange = (field, val) => {
    onChange({ ...filters, [field]: val, page: 1 });
  };

  const handleSkillsChange = (newSkills) => {
    onChange({ ...filters, skills: newSkills, page: 1 });
  };

  const activeFilterCount = [
    filters.search,
    filters.location,
    filters.workMode && filters.workMode !== 'All' ? filters.workMode : null,
    filters.employmentType && filters.employmentType !== 'All' ? filters.employmentType : null,
    filters.experienceLevel && filters.experienceLevel !== 'All' ? filters.experienceLevel : null,
    filters.minSalary ? filters.minSalary : null,
    filters.skills?.length ? filters.skills : null,
  ].filter(Boolean).length;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Filters</h2>
          {activeFilterCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                padding: '1px 6px',
                borderRadius: '9999px',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 8px', fontSize: '12px', color: 'var(--color-primary)' }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {clientFiltered && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px',
            backgroundColor: 'var(--color-info-soft)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--color-info)',
          }}
        >
          <Info size={14} flexShrink={0} />
          <span>Skills/Experience filters are evaluated locally on this page.</span>
        </div>
      )}

      {/* Keyword Search */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-search" className="form-label" style={{ fontSize: '13px' }}>
          Keyword, Title, or Company
        </label>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-muted)' }}
          />
          <input
            id="filter-search"
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="e.g. Frontend, React, Nexus..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-location" className="form-label" style={{ fontSize: '13px' }}>
          Location
        </label>
        <div style={{ position: 'relative' }}>
          <MapPin
            size={16}
            style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-muted)' }}
          />
          <input
            id="filter-location"
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="e.g. Bangalore, Remote..."
            value={filters.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
          />
        </div>
      </div>

      {/* Work Mode */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-work-mode" className="form-label" style={{ fontSize: '13px' }}>
          Work Mode
        </label>
        <select
          id="filter-work-mode"
          className="form-select"
          value={filters.workMode || 'All'}
          onChange={(e) => handleFieldChange('workMode', e.target.value)}
        >
          <option value="All">All Work Modes</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Employment Type */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-employment-type" className="form-label" style={{ fontSize: '13px' }}>
          Employment Type
        </label>
        <select
          id="filter-employment-type"
          className="form-select"
          value={filters.employmentType || 'All'}
          onChange={(e) => handleFieldChange('employmentType', e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Required Skills (Multi) */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-skills" className="form-label" style={{ fontSize: '13px' }}>
          Required Skills
        </label>
        <TagInput
          id="filter-skills"
          value={filters.skills || []}
          onChange={handleSkillsChange}
          placeholder="Filter by skill (e.g. React)..."
        />
      </div>

      {/* Experience Level */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-experience" className="form-label" style={{ fontSize: '13px' }}>
          Experience Level
        </label>
        <select
          id="filter-experience"
          className="form-select"
          value={filters.experienceLevel || 'All'}
          onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
        >
          <option value="All">Any Experience</option>
          <option value="0">Entry / Fresher (0-1 yrs)</option>
          <option value="2">Junior / Mid (2-3 yrs)</option>
          <option value="4">Senior (4-6 yrs)</option>
          <option value="7">Lead / Staff (7+ yrs)</option>
        </select>
      </div>

      {/* Minimum Salary Filter */}
      <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor="filter-min-salary" className="form-label" style={{ fontSize: '13px' }}>
          Minimum Annual Salary (₹ INR)
        </label>
        <input
          id="filter-min-salary"
          type="number"
          step="100000"
          min="0"
          className="form-input"
          placeholder="e.g. 1000000 (₹10 LPA)"
          value={filters.minSalary || ''}
          onChange={(e) => handleFieldChange('minSalary', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <aside
        className="card desktop-filter-card"
        style={{
          width: '280px',
          flexShrink: 0,
          position: 'sticky',
          top: '88px',
          height: 'fit-content',
        }}
      >
        {content}
      </aside>

      {/* Mobile Bottom Sheet Drawer */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '24px 20px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Filter Vacancies</h2>
              <button
                type="button"
                onClick={onCloseMobile}
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            {content}
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={onCloseMobile}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-filter-card { display: none !important; }
        }
      `}</style>
    </>
  );
}

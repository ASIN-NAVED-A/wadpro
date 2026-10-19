import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, ArrowUpDown, Sparkles } from 'lucide-react';
import jobService from '../../api/services/jobService';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import Pagination from '../../components/common/Pagination';
import { JobCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';

export default function JobListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse initial filters from URL search params
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    workMode: searchParams.get('workMode') || 'All',
    employmentType: searchParams.get('employmentType') || 'All',
    experienceLevel: searchParams.get('experienceLevel') || 'All',
    minSalary: searchParams.get('minSalary') || '',
    skills: searchParams.get('skills') ? searchParams.get('skills').split(',') : [],
    page: Number(searchParams.get('page')) || 1,
  }));

  const [sortBy, setSortBy] = useState('newest');
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientFiltered, setClientFiltered] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state into URL query params
  const syncUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.workMode && newFilters.workMode !== 'All') params.set('workMode', newFilters.workMode);
    if (newFilters.employmentType && newFilters.employmentType !== 'All')
      params.set('employmentType', newFilters.employmentType);
    if (newFilters.experienceLevel && newFilters.experienceLevel !== 'All')
      params.set('experienceLevel', newFilters.experienceLevel);
    if (newFilters.minSalary) params.set('minSalary', newFilters.minSalary);
    if (newFilters.skills?.length > 0) params.set('skills', newFilters.skills.join(','));
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));

    setSearchParams(params, { replace: true });
  };

  const fetchJobs = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await jobService.getJobs({
        ...currentFilters,
        limit: 6,
      });

      let loadedJobs = res.jobs || [];

      // Sort client-side
      if (sortBy === 'salary-high') {
        loadedJobs = [...loadedJobs].sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
      } else if (sortBy === 'salary-low') {
        loadedJobs = [...loadedJobs].sort((a, b) => (a.salary?.min || 0) - (b.salary?.min || 0));
      }

      setJobs(loadedJobs);
      setTotalCount(res.total);
      setTotalPages(res.totalPages || 1);
      setClientFiltered(res.clientFiltered);
      setIsDemoData(res.isDemo);
    } catch (err) {
      setError(err.mapped || { title: 'Failed to load jobs', message: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchJobs(filters);
    syncUrlParams(filters);
  }, [filters, fetchJobs]);

  const handleFilterChange = (updated) => {
    setFilters(updated);
  };

  const handleResetFilters = () => {
    const cleared = {
      search: '',
      location: '',
      workMode: 'All',
      employmentType: 'All',
      experienceLevel: 'All',
      minSalary: '',
      skills: [],
      page: 1,
    };
    setFilters(cleared);
  };

  const removeChip = (key, val) => {
    if (key === 'skills') {
      const nextSkills = filters.skills.filter((s) => s !== val);
      setFilters({ ...filters, skills: nextSkills, page: 1 });
    } else {
      setFilters({ ...filters, [key]: key === 'workMode' || key === 'employmentType' || key === 'experienceLevel' ? 'All' : '', page: 1 });
    }
  };

  return (
    <div className="container page-wrapper">
      {/* Header Bar */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
        <div>
          <div className="breadcrumb-bar">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Job Vacancies</span>
          </div>
          <h1 className="page-title">Find Your Next Opportunity</h1>
          <p className="page-subtitle">
            Explore verified career openings across top technology leaders and high-velocity startups.
          </p>
        </div>

        {/* Demo indicator & Mobile Filter Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDemoData && <StatusBadge isDemo={true} />}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-secondary mobile-filter-btn"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Sticky Filters */}
        <JobFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isMobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
          clientFiltered={clientFiltered}
        />

        {/* Right Content / Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Active Filter Chips & Sort Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingBottom: '16px',
              marginBottom: '16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Showing <strong style={{ color: 'var(--color-text-primary)' }}>{totalCount}</strong> open {totalCount === 1 ? 'position' : 'positions'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="job-sort" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Sort:
              </label>
              <select
                id="job-sort"
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px', width: 'auto' }}
              >
                <option value="newest">Most Recent</option>
                <option value="salary-high">Highest Salary</option>
                <option value="salary-low">Lowest Salary</option>
              </select>
            </div>
          </div>

          {/* Active Chips Row */}
          {(filters.search ||
            filters.location ||
            (filters.workMode && filters.workMode !== 'All') ||
            (filters.employmentType && filters.employmentType !== 'All') ||
            filters.minSalary ||
            filters.skills?.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {filters.search && (
                <span className="badge" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  Search: "{filters.search}"
                  <button type="button" onClick={() => removeChip('search')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.location && (
                <span className="badge" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  Location: {filters.location}
                  <button type="button" onClick={() => removeChip('location')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.workMode && filters.workMode !== 'All' && (
                <span className="badge" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  {filters.workMode}
                  <button type="button" onClick={() => removeChip('workMode')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.skills?.map((sk) => (
                <span key={sk} className="badge" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                  {sk}
                  <button type="button" onClick={() => removeChip('skills', sk)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Grid / List */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : error ? (
            <ErrorState
              title={error.title}
              message={error.message}
              isNetworkError={error.isNetworkError}
              onRetry={() => fetchJobs(filters)}
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No vacancies match your criteria"
              description="Try broadening your search keywords, resetting location preferences, or clearing applied skill tags."
              actionLabel="Clear all filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={(p) => setFilters({ ...filters, page: p })}
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1025px) {
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Calendar, MapPin, Building, ArrowUpRight, Search } from 'lucide-react';
import applicationService from '../../api/services/applicationService';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../components/jobs/JobCard';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      setIsLoading(true);
      try {
        const data = await applicationService.getMyApplications();
        setApplications(data || []);
      } catch (err) {
        console.error('Failed to load applications', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadApps();
  }, []);

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading your submitted applications..." />
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="breadcrumb-bar">
            <Link to="/employee/dashboard">Dashboard</Link>
            <span>/</span>
            <span>My Applications</span>
          </div>
          <h1 className="page-title">My Job Applications</h1>
          <p className="page-subtitle">
            Track the status of your applications and interview progress in real time.
          </p>
        </div>
        <StatusBadge isDemo={true} />
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications submitted yet"
          description="You haven't applied to any job postings. Browse current openings to find roles that match your skillset."
          actionLabel="Browse Vacancies"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Desktop Table */}
          <div className="desktop-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Job Position</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Company</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Applied Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    className="app-table-row"
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      <Link to={`/jobs/${app.jobId}`} style={{ color: 'inherit' }}>
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                      {app.company}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                      {app.location || 'Remote'}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-muted)' }}>
                      {new Date(app.appliedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      <span style={{ fontSize: '11px' }}>({formatTimeAgo(app.appliedDate)})</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <Link to={`/jobs/${app.jobId}`} className="btn btn-sm btn-ghost">
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards (<768px) */}
          <div className="mobile-cards-container" style={{ display: 'none', flexDirection: 'column' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Link to={`/jobs/${app.jobId}`} style={{ fontWeight: 600, fontSize: '16px' }}>
                      {app.jobTitle}
                    </Link>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {app.company}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  <span>{app.location || 'Remote'}</span>
                  <span>Applied {formatTimeAgo(app.appliedDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-table-container { display: none !important; }
          .mobile-cards-container { display: flex !important; }
        }
        .app-table-row:hover {
          background-color: var(--color-surface-hover);
        }
      `}</style>
    </div>
  );
}

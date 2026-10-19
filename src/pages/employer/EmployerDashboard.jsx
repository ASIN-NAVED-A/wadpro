import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  PlusCircle,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  MoreVertical,
  SlidersHorizontal,
} from 'lucide-react';
import jobService from '../../api/services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { formatSalary, formatTimeAgo } from '../../components/jobs/JobCard';
import { useAuth } from '../../auth/AuthContext';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const data = await jobService.getEmployerDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load employer dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading employer recruitment dashboard..." />
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    activeJobs: 4,
    closedJobs: 1,
    totalApplicants: 28,
    newThisWeek: 9,
  };
  const recentJobs = dashboardData?.recentJobs || [];

  return (
    <div className="container page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Bar */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="page-title">Employer Recruitment Hub</h1>
          <p className="page-subtitle">
            Manage your open positions, track talent pipelines, and source qualified candidates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge isDemo={true} />
          <Link to="/employer/jobs/create" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Post a Job</span>
          </Link>
        </div>
      </div>

      {/* Row of Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-success-soft)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Active Vacancies</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.activeJobs}
            </div>
            <Link to="/employer/jobs" style={{ fontSize: '12px', fontWeight: 600 }}>
              Manage Vacancies →
            </Link>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-info-soft)',
              color: 'var(--color-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Total Applicants</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.totalApplicants}
            </div>
            <Link to="/employer/applicants" style={{ fontSize: '12px', fontWeight: 600 }}>
              Review Candidates →
            </Link>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>New This Week</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              +{stats.newThisWeek}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>High candidate velocity</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Closed / Archived</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats.closedJobs}
            </div>
            <Link to="/employer/jobs" style={{ fontSize: '12px', fontWeight: 600 }}>
              View History →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Postings Table Section */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Recent Job Postings
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Summary of your recent listings and quick management actions.
            </div>
          </div>
          <Link to="/employer/jobs" className="btn btn-secondary btn-sm">
            View All Jobs
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Job Title</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Applicants</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Posted</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    <Link to={`/jobs/${job.id}`} style={{ color: 'var(--color-text-primary)' }}>
                      {job.title}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {job.workMode} · {job.location}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link
                      to={`/employer/applicants?jobId=${job.id}`}
                      style={{ fontWeight: 600, color: 'var(--color-primary)' }}
                    >
                      {job.applicantsCount || 0} candidates
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    {formatTimeAgo(job.createdAt)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link to={`/employer/jobs/${job.id}/edit`} className="btn btn-sm btn-secondary">
                        Edit
                      </Link>
                      <Link to={`/employer/applicants?jobId=${job.id}`} className="btn btn-sm btn-ghost">
                        Applicants
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

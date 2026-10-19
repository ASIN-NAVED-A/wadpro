import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Send,
  Loader2,
  Building,
} from 'lucide-react';
import jobService from '../../api/services/jobService';
import applicationService from '../../api/services/applicationService';
import { formatSalary, formatTimeAgo } from '../../components/jobs/JobCard';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await jobService.getJobById(id);
        if (!data) {
          throw new Error('Position not found');
        }
        setJob(data);

        // Check if user already applied
        if (isAuthenticated) {
          const apps = await applicationService.getMyApplications();
          const already = apps.some((a) => a.jobId === id);
          setHasApplied(already);
        }
      } catch (err) {
        setError(err.mapped || { title: 'Job not found', message: err.message });
      } finally {
        setIsLoading(false);
      }
    }
    loadJob();
  }, [id, isAuthenticated]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    setIsSubmittingApp(true);
    try {
      await applicationService.applyToJob(id, job, { coverLetter });
      toast.success(`Application submitted for ${job.title}!`);
      setHasApplied(true);
      setIsApplyModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading job posting details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container page-wrapper">
        <ErrorState
          title={error?.title || 'Job Not Found'}
          message={error?.message || 'This job vacancy could not be located.'}
          onRetry={() => navigate('/jobs')}
        />
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ position: 'relative' }}>
      {/* Back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          to="/jobs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to all vacancies</span>
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Column: Job Overview & Description */}
        <div style={{ flex: '1 1 640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {job.company}
                  </span>
                  {job.isDemo && <StatusBadge isDemo={true} />}
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.25 }}>
                  {job.title}
                </h1>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Meta Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--color-text-muted)" />
                <span>{job.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={16} color="var(--color-text-muted)" />
                <span>
                  {job.workMode} · {job.employmentType}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--color-text-muted)" />
                <span>{job.experienceYears === 0 ? 'Entry level' : `${job.experienceYears}+ years experience`}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="var(--color-text-muted)" />
                <span>Posted {formatTimeAgo(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              About the Role
            </h2>
            <div
              style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
              }}
            >
              {job.description}
            </div>
          </div>

          {/* Skills Required */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Key Technical Skills & Qualifications
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {job.skills?.map((skill) => (
                <span
                  key={skill}
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '6px 12px',
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Salary & Apply Card */}
        <div style={{ flex: '0 0 340px', width: '100%', maxWidth: '380px', position: 'sticky', top: '88px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}>
                Compensation Package
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formatSalary(job.salary)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Period: <strong>{job.salary.period}</strong> · Type: <strong>{job.salary.type}</strong> ({job.salary.currency})
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                {hasApplied
                  ? 'You have already submitted your candidate application for this opening.'
                  : 'Interested in this role? Submit your profile to the hiring team.'}
              </div>

              {hasApplied ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-success-soft)',
                    color: 'var(--color-success)',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Applied</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Send size={16} />
                  <span>Apply Now</span>
                </button>
              )}
            </div>

            {role === 'employer' && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Viewing as an employer account. To test candidate applications, switch to an employee profile.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Apply Bar (<640px) */}
      <div
        className="mobile-apply-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '12px 16px',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.06)',
          zIndex: 80,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Offered Salary</div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatSalary(job.salary)}</div>
        </div>
        {hasApplied ? (
          <span className="badge badge-success">
            <CheckCircle2 size={14} /> Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            Apply Now
          </button>
        )}
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => !isSubmittingApp && setIsApplyModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '520px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Apply for {job.title}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {job.company} · {job.location}
              </div>
            </div>

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="apply-cover" className="form-label">
                  Cover Note / Pitch (Optional)
                </label>
                <textarea
                  id="apply-cover"
                  rows={4}
                  className="form-textarea"
                  placeholder="Share a short note explaining why your background is a strong fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Your saved candidate profile and parsed resume will be submitted alongside this application.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={isSubmittingApp}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="btn btn-primary"
                >
                  {isSubmittingApp ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .mobile-apply-bar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

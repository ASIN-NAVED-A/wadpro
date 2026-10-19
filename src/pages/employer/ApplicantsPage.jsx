import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
  Phone,
  Mail,
  Briefcase,
} from 'lucide-react';
import applicationService from '../../api/services/applicationService';
import jobService from '../../api/services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../components/jobs/JobCard';

export default function ApplicantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId') || 'all';

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [jobsRes, applicantsRes] = await Promise.all([
          jobService.getJobs({ limit: 50 }),
          applicationService.getApplicants(selectedJobId === 'all' ? null : selectedJobId),
        ]);
        setJobs(jobsRes.jobs || []);
        setApplicants(applicantsRes || []);
      } catch (err) {
        toast.error('Failed to load applicants data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedJobId, toast]);

  const handleJobSelect = (jobId) => {
    const params = new URLSearchParams(searchParams);
    if (jobId === 'all') {
      params.delete('jobId');
    } else {
      params.set('jobId', jobId);
    }
    setSearchParams(params);
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await applicationService.updateApplicantStatus(applicantId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
      );
      if (selectedApplicant?.id === applicantId) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Applicant status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading candidates pipeline..." />
      </div>
    );
  }

  return (
    <div className="container page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="breadcrumb-bar">
            <Link to="/employer/dashboard">Dashboard</Link>
            <span>/</span>
            <span>Applicants Pipeline</span>
          </div>
          <h1 className="page-title">Candidate Applications</h1>
          <p className="page-subtitle">
            Review applicant qualifications, update review statuses, and view complete resumes.
          </p>
        </div>
        <StatusBadge isDemo={true} />
      </div>

      {/* Job Selector Dropdown Filter */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label htmlFor="job-filter-select" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Filter by Vacancy:
          </label>
          <select
            id="job-filter-select"
            className="form-select"
            style={{ width: 'auto', minWidth: '280px', minHeight: '40px' }}
            value={selectedJobId}
            onChange={(e) => handleJobSelect(e.target.value)}
          >
            <option value="all">All Vacancies ({jobs.length} postings)</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.company})
              </option>
            ))}
          </select>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing {applicants.length} candidate applications
          </div>
        </div>
      </div>

      {/* Applicants List Grid */}
      {applicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="There are currently no candidate applications submitted for this selected vacancy."
          actionLabel="Select All Vacancies"
          onAction={() => handleJobSelect('all')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {applicants.map((cand) => (
            <div
              key={cand.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: 'pointer',
                transition: 'box-shadow var(--transition-fast)',
              }}
              onClick={() => setSelectedApplicant(cand)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-soft)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}
                  >
                    {cand.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {cand.fullName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {cand.headline}
                    </div>
                  </div>
                </div>

                <StatusBadge status={cand.status} />
              </div>

              {/* Skills chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cand.skills?.slice(0, 4).map((sk) => (
                  <span
                    key={sk}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-primary-soft)',
                      color: 'var(--color-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <span>{cand.experienceYears} yrs experience</span>
                <span>Applied {formatTimeAgo(cand.appliedAt)}</span>
              </div>

              {/* Status Selector Dropdown */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  Update Status:
                </span>
                <select
                  value={cand.status}
                  onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                  className="form-select"
                  style={{ minHeight: '32px', padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Under review">Under review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side Drawer for Full Applicant Profile */}
      {selectedApplicant && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              padding: '28px 24px',
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {selectedApplicant.fullName}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {selectedApplicant.headline}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Close applicant details"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusBadge status={selectedApplicant.status} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Applied {formatTimeAgo(selectedApplicant.appliedAt)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="var(--color-text-muted)" />
                <span>{selectedApplicant.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--color-text-muted)" />
                <span>{selectedApplicant.phone || 'Phone not specified'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} color="var(--color-text-muted)" />
                <span>{selectedApplicant.experienceYears} years total experience</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Technical Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedApplicant.skills?.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-primary-soft)',
                      color: 'var(--color-primary)',
                      fontWeight: 500,
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>Application Status</h3>
              <select
                value={selectedApplicant.status}
                onChange={(e) => handleStatusChange(selectedApplicant.id, e.target.value)}
                className="form-select"
              >
                <option value="Applied">Applied</option>
                <option value="Under review">Under review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
              <a
                href="#download-resume"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading parsed resume document for ${selectedApplicant.fullName}`);
                }}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                <FileText size={16} />
                <span>Download Candidate Resume</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

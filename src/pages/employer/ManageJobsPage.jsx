import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import jobService from '../../api/services/jobService';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatSalary, formatTimeAgo } from '../../components/jobs/JobCard';
import { useToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const toast = useToast();

  // Confirm delete dialog state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployerJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobService.getJobs({ limit: 50 });
      setJobs(res.jobs || []);
    } catch (err) {
      toast.error('Failed to load postings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await jobService.updateJob(job.id, { ...job, status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
      toast.success(`Job marked as ${newStatus}!`);
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await jobService.deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      toast.success(`Vacancy "${jobToDelete.title}" has been deleted.`);
      setJobToDelete(null);
    } catch (err) {
      toast.error('Failed to delete job posting');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((j) =>
    searchFilter ? j.title.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading job listings..." />
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
            <span>Manage Jobs</span>
          </div>
          <h1 className="page-title">Manage Job Postings</h1>
          <p className="page-subtitle">
            View, edit, close, or archive your organization's job openings.
          </p>
        </div>

        <Link to="/employer/jobs/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Post a New Job</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', minHeight: '38px', fontSize: '13px' }}
            />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing {filteredJobs.length} of {jobs.length} total vacancies
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings found"
          description="You haven't posted any jobs matching this criteria yet."
          actionLabel="Create First Job"
          onAction={() => (window.location.href = '/employer/jobs/create')}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Position Details</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Applicants</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Posted</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        <Link to={`/jobs/${job.id}`} style={{ color: 'inherit' }}>
                          {job.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {job.workMode} · {job.location} · {formatSalary(job.salary)}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <Link
                        to={`/employer/applicants?jobId=${job.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-primary)' }}
                      >
                        <Users size={15} />
                        <span>{job.applicantsCount || 0} candidates</span>
                      </Link>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {formatTimeAgo(job.createdAt)}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <Link
                          to={`/employer/jobs/${job.id}/edit`}
                          className="btn btn-sm btn-secondary"
                          title="Edit Job"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className="btn btn-sm btn-ghost"
                          title={job.status === 'Open' ? 'Close Job' : 'Re-open Job'}
                        >
                          {job.status === 'Open' ? 'Close' : 'Re-open'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setJobToDelete(job)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--color-danger)' }}
                          title="Delete Job"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(jobToDelete)}
        title="Delete Job Vacancy"
        message={`Are you sure you want to permanently delete the job vacancy "${jobToDelete?.title}"? All applicant history linked to this posting will be removed. This action cannot be undone.`}
        confirmLabel="Delete Job"
        cancelLabel="Cancel"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setJobToDelete(null)}
      />
    </div>
  );
}

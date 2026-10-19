import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  FileCheck2,
  TrendingUp,
  UploadCloud,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import profileService from '../../api/services/profileService';
import jobService from '../../api/services/jobService';
import applicationService from '../../api/services/applicationService';
import recommendationService from '../../api/services/recommendationService';
import JobCard from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/common/Skeleton';
import StatusBadge from '../../components/common/StatusBadge';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [profData, appsData, recData, jobsData] = await Promise.all([
          profileService.getEmployeeProfile(),
          applicationService.getMyApplications(),
          recommendationService.getRecommendations(),
          jobService.getJobs({ limit: 4 }),
        ]);

        setProfile(profData);
        setApplications(appsData || []);
        setRecommendations(recData.recommendations || []);
        setLatestJobs(jobsData.jobs || []);
      } catch (err) {
        console.error('Error loading employee dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const completeness = profile?.completenessPercent || 75;
  const firstName = user?.fullName?.split(' ')[0] || user?.name || 'Candidate';

  return (
    <div className="container page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Greeting Header & Search Bar */}
      <div
        className="card"
        style={{
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93C5FD', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            <Sparkles size={16} />
            <span>AI-Driven Career Dashboard</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px' }}>
            Explore vacancies tailored to your technical profile, review active applications, or discover new roles.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. React), or company..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '42px',
                minHeight: '46px',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ minHeight: '46px', padding: '0 24px' }}>
            Search Vacancies
          </button>
        </form>

        {/* Quick Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
          <span style={{ color: '#94A3B8' }}>Quick searches:</span>
          {['React Developer', 'Remote Roles', 'Full Stack', 'Hybrid', 'Bangalore'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => navigate(`/jobs?search=${encodeURIComponent(chip)}`)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#E2E8F0',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {chip}
            </button>
          ))}
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
        {/* Profile Completion Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Progress Ring / Circular percent */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: `conic-gradient(var(--color-primary) ${completeness * 3.6}deg, var(--color-border) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              {completeness}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Profile Strength</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {completeness === 100 ? 'All Set!' : `${completeness}% Complete`}
            </div>
            <Link to="/employee/profile" style={{ fontSize: '12px', fontWeight: 600 }}>
              Update Profile →
            </Link>
          </div>
        </div>

        {/* Applications Sent */}
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
            <FileCheck2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Active Applications</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {applications.length}
            </div>
            <Link to="/employee/applications" style={{ fontSize: '12px', fontWeight: 600 }}>
              Track Status →
            </Link>
          </div>
        </div>

        {/* Recommended Positions */}
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
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Job Matches</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {recommendations.length} High Fit
            </div>
            <Link to="/employee/recommendations" style={{ fontSize: '12px', fontWeight: 600 }}>
              View Matches →
            </Link>
          </div>
        </div>

        {/* Saved Searches / Market Trend */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Market Insights</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              High Demand
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>React · TypeScript · CTC</span>
          </div>
        </div>
      </div>

      {/* Prompt Card: Complete profile with resume upload if under 100% */}
      {completeness < 100 && (
        <div
          style={{
            padding: '18px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary-soft)',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UploadCloud size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                Upload your resume to complete your profile faster
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Our parser automatically fills in your technical skills, experience history, and job preferences.
              </div>
            </div>
          </div>
          <Link to="/employee/profile" className="btn btn-primary btn-sm">
            Upload & Auto-fill →
          </Link>
        </div>
      )}

      {/* Two-Column Section: Recommended Jobs Preview vs Latest Vacancies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Recommended for You Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Recommended for You
              </h2>
            </div>
            <Link to="/employee/recommendations" style={{ fontSize: '13px', fontWeight: 600 }}>
              See all ({recommendations.length}) →
            </Link>
          </div>

          {isLoading ? (
            <JobCardSkeleton />
          ) : (
            recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.jobId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  borderLeft: '4px solid var(--color-accent)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Link
                      to={`/jobs/${rec.jobId}`}
                      style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      {rec.title}
                    </Link>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {rec.company} · {rec.location}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--color-accent-soft)',
                      color: 'var(--color-accent)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <span>{rec.matchScore}% Match</span>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {rec.explanation}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    ₹{(rec.salary.min / 100000).toFixed(1)}L - ₹{(rec.salary.max / 100000).toFixed(1)}L / yr
                  </span>
                  <Link to={`/jobs/${rec.jobId}`} className="btn btn-sm btn-secondary">
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Latest Vacancies Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Latest Vacancies
              </h2>
            </div>
            <Link to="/jobs" style={{ fontSize: '13px', fontWeight: 600 }}>
              Browse all →
            </Link>
          </div>

          {isLoading ? (
            <JobCardSkeleton />
          ) : (
            latestJobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

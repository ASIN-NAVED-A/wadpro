import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Info,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';
import recommendationService from '../../api/services/recommendationService';
import { formatSalary } from '../../components/jobs/JobCard';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function RecommendationsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecs() {
      setIsLoading(true);
      try {
        const result = await recommendationService.getRecommendations();
        setData(result);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecs();
  }, []);

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Calculating personalized job relevance estimates..." />
      </div>
    );
  }

  const recList = data?.recommendations || [];

  return (
    <div className="container page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="breadcrumb-bar">
            <Link to="/employee/dashboard">Dashboard</Link>
            <span>/</span>
            <span>Personalized Recommendations</span>
          </div>
          <h1 className="page-title">Personalized Job Recommendations</h1>
          <p className="page-subtitle">
            Tailored career opportunities evaluated against your technical skills, experience depth, and preferred work arrangements.
          </p>
        </div>
        <StatusBadge isDemo={true} />
      </div>

      {/* Mandatory Pinned Disclaimer Banner */}
      <div
        role="note"
        aria-label="Relevance estimate disclaimer"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-info-soft)',
          border: '1px solid rgba(3, 105, 161, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Info size={20} color="var(--color-info)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '13px', color: 'var(--color-info)', lineHeight: 1.5 }}>
          <strong>Notice:</strong> This score estimates how well a job matches your profile. It does not predict your chances of being hired.
        </div>
      </div>

      {/* Recommendations Cards List */}
      {recList.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No recommendations available yet"
          description="Complete your employee profile and technical skills list to unlock tailored recommendations."
          actionLabel="Complete Profile"
          onAction={() => (window.location.href = '/employee/profile')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recList.map((rec) => (
            <article
              key={rec.jobId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                borderLeft: '5px solid var(--color-accent)',
              }}
            >
              {/* Card Header Row: Title & Score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {rec.company}
                    </span>
                    <span style={{ color: 'var(--color-border)' }}>•</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {rec.location} ({rec.workMode})
                    </span>
                    <StatusBadge isDemo={true} />
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    <Link to={`/jobs/${rec.jobId}`} style={{ color: 'inherit' }}>
                      {rec.title}
                    </Link>
                  </h2>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {formatSalary(rec.salary)}
                  </div>
                </div>

                {/* Circular Relevance Score Block */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--color-accent-soft)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(15, 118, 110, 0.2)',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {rec.matchScore}%
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: 'var(--color-accent)' }}>
                      Job Relevance Estimate
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {rec.scoreLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compatibility Breakdown Bars & Rows */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '14px',
                  padding: '14px 16px',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Skill Coverage</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{rec.skillCoveragePercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${rec.skillCoveragePercent}%`, height: '100%', backgroundColor: 'var(--color-accent)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '2px' }}>
                    Location Compatibility
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {rec.locationCompatibility}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '2px' }}>
                    Experience Compatibility
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {rec.experienceCompatibility}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '2px' }}>
                    Salary Compatibility
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {rec.salaryCompatibility}
                  </div>
                </div>
              </div>

              {/* Matched & Missing Skills Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-success)' }}>
                    Matched Skills:
                  </span>
                  {rec.matchedSkills?.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: 'var(--color-success-soft)',
                        color: 'var(--color-success)',
                        border: '1px solid rgba(21, 128, 61, 0.2)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>

                {rec.missingSkills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-warning)' }}>
                      Missing Skills:
                    </span>
                    {rec.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: 'var(--color-warning-soft)',
                          color: 'var(--color-warning)',
                          border: '1px solid rgba(180, 83, 9, 0.25)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <AlertCircle size={12} />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Plain-Language Explanation */}
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <strong>Match Analysis:</strong> {rec.explanation}
              </div>

              {/* Card Footer: View Details & Apply Now */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <Link to={`/jobs/${rec.jobId}`} className="btn btn-secondary">
                  <span>View Details</span>
                </Link>
                <Link to={`/jobs/${rec.jobId}`} className="btn btn-primary">
                  <Send size={15} />
                  <span>Apply Now</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Sparkles } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export function formatSalary(salary) {
  if (!salary || (!salary.min && !salary.max)) {
    return 'Competitive Compensation';
  }

  const currencySymbol =
    salary.currency === 'INR' ? '₹' : salary.currency === 'USD' ? '$' : salary.currency === 'EUR' ? '€' : salary.currency || '₹';

  const formatNum = (num) => {
    if (!num) return '0';
    if (salary.currency === 'INR') {
      return Number(num).toLocaleString('en-IN');
    }
    return Number(num).toLocaleString('en-US');
  };

  const periodStr = salary.period ? ` / ${salary.period}` : ' / Annual';
  const typeStr = salary.type ? ` · ${salary.type}` : '';

  if (salary.min && salary.max) {
    return `${currencySymbol}${formatNum(salary.min)} - ${currencySymbol}${formatNum(salary.max)}${periodStr}${typeStr}`;
  }
  if (salary.min) {
    return `From ${currencySymbol}${formatNum(salary.min)}${periodStr}${typeStr}`;
  }
  return `Up to ${currencySymbol}${formatNum(salary.max)}${periodStr}${typeStr}`;
}

export function formatTimeAgo(isoDate) {
  if (!isoDate) return 'Recently';
  const diffDays = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function JobCard({ job }) {
  if (!job) return null;

  const visibleSkills = job.skills?.slice(0, 4) || [];
  const extraSkillsCount = Math.max(0, (job.skills?.length || 0) - 4);
  const companyInitial = (job.company || 'C').charAt(0).toUpperCase();

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Company Initial Avatar */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            {companyInitial}
          </div>
          <div>
            <Link
              to={`/jobs/${job.id}`}
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1.3,
                display: 'block',
              }}
            >
              {job.title}
            </Link>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              <span style={{ fontWeight: 500 }}>{job.company}</span>
              {job.location && (
                <>
                  <span style={{ margin: '0 6px', color: 'var(--color-border)' }}>•</span>
                  <span>{job.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {job.isDemo && <StatusBadge isDemo={true} />}
      </div>

      {/* Meta Chips: Work Mode & Employment Type */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {job.workMode || 'On-site'}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {job.employmentType || 'Full-time'}
        </span>
        {job.experienceYears !== undefined && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {job.experienceYears === 0 ? 'Fresher / Entry' : `${job.experienceYears}+ yrs exp`}
          </span>
        )}
      </div>

      {/* Salary Specification */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {formatSalary(job.salary)}
      </div>

      {/* Skills Chips */}
      {visibleSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          {visibleSkills.map((sk) => (
            <span
              key={sk}
              style={{
                fontSize: '12px',
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
          {extraSkillsCount > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              +{extraSkillsCount} more
            </span>
          )}
        </div>
      )}

      {/* Card Footer: Time Ago & View Details */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} />
          <span>{formatTimeAgo(job.createdAt)}</span>
        </div>
        <Link
          to={`/jobs/${job.id}`}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}

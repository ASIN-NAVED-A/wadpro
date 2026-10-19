import React from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  XCircle,
  Award,
  CircleDot,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function StatusBadge({ status, isDemo = false }) {
  if (isDemo) {
    return (
      <span className="badge badge-demo" title="Demonstration simulated data">
        <Sparkles size={12} />
        <span>Demo data</span>
      </span>
    );
  }

  const s = String(status || '').toLowerCase();

  switch (s) {
    case 'open':
    case 'active':
      return (
        <span className="badge badge-success">
          <CircleDot size={12} />
          <span>Open</span>
        </span>
      );

    case 'closed':
      return (
        <span className="badge badge-warning" style={{ backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' }}>
          <Clock size={12} />
          <span>Closed</span>
        </span>
      );

    case 'applied':
      return (
        <span className="badge badge-info">
          <FileText size={12} />
          <span>Applied</span>
        </span>
      );

    case 'under review':
      return (
        <span className="badge badge-warning">
          <Clock size={12} />
          <span>Under review</span>
        </span>
      );

    case 'shortlisted':
      return (
        <span
          className="badge"
          style={{
            backgroundColor: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
            border: '1px solid rgba(15, 118, 110, 0.25)',
          }}
        >
          <Award size={12} />
          <span>Shortlisted</span>
        </span>
      );

    case 'hired':
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} />
          <span>Hired</span>
        </span>
      );

    case 'rejected':
      return (
        <span className="badge badge-danger">
          <XCircle size={12} />
          <span>Rejected</span>
        </span>
      );

    default:
      return (
        <span className="badge badge-info">
          <CircleDot size={12} />
          <span>{status}</span>
        </span>
      );
  }
}

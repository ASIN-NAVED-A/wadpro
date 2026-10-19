import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import FormField from '../../components/forms/FormField';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsSubmitting(true);

    try {
      const res = await login(data);
      toast.success(`Welcome back, ${res.user?.fullName?.split(' ')[0] || 'User'}!`);

      // Role-based destination
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user?.role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      const mapped = err.mapped;
      setApiError(mapped?.message || 'Login failed. Please check your credentials.');
      toast.error(mapped?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'employer') {
      setValue('email', 'recruiter@nexustech.com');
      setValue('password', 'Password123');
    } else {
      setValue('email', 'priya.sharma@example.com');
      setValue('password', 'Password123');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        className="card auth-split-card"
        style={{
          width: '100%',
          maxWidth: '880px',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Left: Login Form */}
        <div style={{ flex: 1, padding: '40px 36px', maxWidth: '480px', width: '100%' }}>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Briefcase size={18} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>
                Smart<span style={{ color: 'var(--color-primary)' }}>JobPortal</span>
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Sign in to your account
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Enter your credentials to access your dashboard and opportunities.
            </p>
          </div>

          {/* Quick Demo Credentials Autofill */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--color-primary-soft)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--color-primary)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Quick Demo Auto-fill:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('employee')}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '3px 8px', minHeight: '28px' }}
              >
                Fill Job Seeker (Priya)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('employer')}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '3px 8px', minHeight: '28px' }}
              >
                Fill Employer (Nexus HR)
              </button>
            </div>
          </div>

          {apiError && (
            <div
              role="alert"
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-soft)',
                border: '1px solid rgba(185, 28, 28, 0.2)',
                color: 'var(--color-danger)',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField id="login-email" label="Email Address" error={errors.email} required>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                autoComplete="email"
                {...register('email')}
              />
            </FormField>

            <FormField id="login-password" label="Password" error={errors.password} required>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '42px' }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Don't have an account yet?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>

        {/* Right: Brand Panel (Desktop only) */}
        <div
          className="brand-side-panel"
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(29, 78, 216, 0.3)',
                color: '#93C5FD',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              <Zap size={14} />
              <span>Smart Career Discovery</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px' }}>
              Find work that fits you. <br />
              Hire people who fit your team.
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
              Join thousands of professionals and hiring managers connecting through transparent job matching and AI-powered resume extraction.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#38BDF8', marginTop: '2px' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Personalized Job Relevance</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Clear breakdowns of skill coverage, location fit, and compensation compatibility.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#38BDF8', marginTop: '2px' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Instant Resume Auto-fill</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Upload your PDF or DOCX resume to auto-populate your candidate profile in seconds.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: '#38BDF8', marginTop: '2px' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Enterprise Hiring Pipeline</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Comprehensive candidate tracking and vacancy management for recruitment teams.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .brand-side-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}

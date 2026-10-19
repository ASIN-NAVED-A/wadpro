import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, UserCheck, Eye, EyeOff, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import FormField from '../../components/forms/FormField';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    role: z.enum(['employee', 'employer']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setApiError('');
    setIsSubmitting(true);

    try {
      // confirmPassword is intentionally excluded by schema / authService
      const res = await registerAuth({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      toast.success('Account created successfully! Welcome to Smart Job Portal.');

      if (res.user?.role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      const mapped = err.mapped;
      setApiError(mapped?.message || 'Registration failed. Please verify your details.');
      toast.error(mapped?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
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
        {/* Form Column */}
        <div style={{ flex: 1, padding: '40px 36px', maxWidth: '480px', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
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
              Create your account
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Select your role and start your journey today.
            </p>
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
            {/* Role Selector Cards */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>
                I am registering as:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setValue('role', 'employee')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px',
                    border: `2px solid ${
                      selectedRole === 'employee' ? 'var(--color-primary)' : 'var(--color-border)'
                    }`,
                    backgroundColor:
                      selectedRole === 'employee' ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <UserCheck size={20} color={selectedRole === 'employee' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Job Seeker
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Looking for a job
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'employer')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px',
                    border: `2px solid ${
                      selectedRole === 'employer' ? 'var(--color-primary)' : 'var(--color-border)'
                    }`,
                    backgroundColor:
                      selectedRole === 'employer' ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <Building2 size={20} color={selectedRole === 'employer' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Employer
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Hiring candidates
                  </span>
                </button>
              </div>
            </div>

            <FormField id="reg-name" label="Full Name" error={errors.fullName} required>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                {...register('fullName')}
              />
            </FormField>

            <FormField id="reg-email" label="Email Address" error={errors.email} required>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                autoComplete="email"
                {...register('email')}
              />
            </FormField>

            <FormField id="reg-password" label="Password" error={errors.password} required>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: '42px' }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
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

            <FormField id="reg-confirm" label="Confirm Password" error={errors.confirmPassword} required>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repeat password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register as {selectedRole === 'employer' ? 'Employer' : 'Job Seeker'}</span>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in here
            </Link>
          </div>
        </div>

        {/* Brand Side Panel */}
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
            <h2 style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px' }}>
              Accelerate your hiring or career path with precision.
            </h2>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
              Whether you are an ambitious engineer seeking tailored opportunities or a company sourcing exceptional candidates, Smart Job Portal is built for speed and clarity.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#38BDF8" />
              <span style={{ fontSize: '14px' }}>Zero spam: verified vacancies and profiles</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#38BDF8" />
              <span style={{ fontSize: '14px' }}>Clear salary transparency (period, currency & CTC)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#38BDF8" />
              <span style={{ fontSize: '14px' }}>Smart relevance matching with skill coverage</span>
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

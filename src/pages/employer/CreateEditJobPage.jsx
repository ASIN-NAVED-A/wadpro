import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Building,
  Save,
  Loader2,
  Eye,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import jobService from '../../api/services/jobService';
import { useToast } from '../../components/common/Toast';
import FormField from '../../components/forms/FormField';
import TagInput from '../../components/forms/TagInput';
import SalaryInput from '../../components/forms/SalaryInput';
import JobCard from '../../components/jobs/JobCard';
import Loader from '../../components/common/Loader';

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name is required'),
  description: z.string().min(20, 'Please provide a detailed job description (min 20 characters)'),
  skills: z.array(z.string()).min(1, 'Please specify at least one required skill'),
  location: z.string().min(2, 'Location is required (e.g. Bangalore, Karnataka or Remote)'),
  workMode: z.enum(['On-site', 'Hybrid', 'Remote']),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  experienceYears: z.coerce.number().min(0, 'Experience must be 0 or greater'),
  minSalary: z.coerce.number().min(0, 'Min salary must be 0 or greater'),
  maxSalary: z.coerce.number().min(0, 'Max salary must be 0 or greater'),
  salaryPeriod: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Annual']),
  salaryCurrency: z.string().default('INR'),
  salaryType: z.enum(['Gross', 'CTC', 'Take-home']),
  status: z.enum(['Open', 'Closed']).default('Open'),
}).refine((data) => data.minSalary <= data.maxSalary, {
  message: 'Minimum salary cannot exceed maximum salary',
  path: ['minSalary'],
});

export default function CreateEditJobPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoadingJob, setIsLoadingJob] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(jobSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      company: 'Nexus Tech Solutions',
      description: '',
      skills: ['React', 'TypeScript'],
      location: 'Bangalore, Karnataka',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      experienceYears: 3,
      minSalary: 1200000,
      maxSalary: 2000000,
      salaryPeriod: 'Annual',
      salaryCurrency: 'INR',
      salaryType: 'CTC',
      status: 'Open',
    },
  });

  const formValues = watch();

  // Load existing job details in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    async function loadJobToEdit() {
      setIsLoadingJob(true);
      try {
        const job = await jobService.getJobById(id);
        if (!job) throw new Error('Job posting not found');

        reset({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          skills: job.skills || [],
          location: job.location || '',
          workMode: job.workMode || 'On-site',
          employmentType: job.employmentType || 'Full-time',
          experienceYears: job.experienceYears || 0,
          minSalary: job.salary?.min || 0,
          maxSalary: job.salary?.max || 0,
          salaryPeriod: job.salary?.period || 'Annual',
          salaryCurrency: job.salary?.currency || 'INR',
          salaryType: job.salary?.type || 'CTC',
          status: job.status || 'Open',
        });
      } catch (err) {
        toast.error('Failed to load job details for editing.');
        navigate('/employer/jobs');
      } finally {
        setIsLoadingJob(false);
      }
    }

    loadJobToEdit();
  }, [id, isEditMode, reset, navigate, toast]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await jobService.updateJob(id, data);
        toast.success(`Job "${data.title}" updated successfully!`);
      } else {
        await jobService.createJob(data);
        toast.success(`Job "${data.title}" published successfully!`);
      }
      navigate('/employer/jobs');
    } catch (err) {
      toast.error(err.mapped?.message || 'Failed to save job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingJob) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading job posting configuration..." />
      </div>
    );
  }

  // Virtual job object for the Live Candidate Preview card
  const previewJob = {
    id: id || 'preview-id',
    title: formValues.title || 'Job Title Preview',
    company: formValues.company || 'Company Name',
    description: formValues.description,
    skills: formValues.skills || [],
    location: formValues.location || 'Location',
    workMode: formValues.workMode || 'On-site',
    employmentType: formValues.employmentType || 'Full-time',
    experienceYears: Number(formValues.experienceYears || 0),
    salary: {
      min: Number(formValues.minSalary || 0),
      max: Number(formValues.maxSalary || 0),
      period: formValues.salaryPeriod || 'Annual',
      currency: formValues.salaryCurrency || 'INR',
      type: formValues.salaryType || 'CTC',
    },
    status: formValues.status || 'Open',
    createdAt: new Date().toISOString(),
    isDemo: true,
  };

  return (
    <div className="container page-wrapper">
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/employer/jobs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Manage Jobs</span>
        </Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">{isEditMode ? 'Edit Job Posting' : 'Post a New Job Vacancy'}</h1>
        <p className="page-subtitle">
          {isEditMode
            ? 'Update the vacancy details, skill requirements, or compensation brackets.'
            : 'Publish a new opening to reach qualified engineers and talent pools.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Main Form Column */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Role Overview */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                1. Job Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <FormField id="job-title" label="Job Title" error={errors.title} required>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Frontend Engineer"
                    {...register('title')}
                  />
                </FormField>

                <FormField id="job-company" label="Hiring Company" error={errors.company} required>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Nexus Tech Solutions"
                    {...register('company')}
                  />
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <FormField id="job-location" label="Location (City / State)" error={errors.location} required>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bangalore, Karnataka"
                    {...register('location')}
                  />
                </FormField>

                <FormField id="job-workMode" label="Work Mode" required>
                  <select className="form-select" {...register('workMode')}>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </FormField>

                <FormField id="job-empType" label="Employment Type" required>
                  <select className="form-select" {...register('employmentType')}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </FormField>
              </div>

              <FormField id="job-desc" label="Full Job Description & Responsibilities" error={errors.description} required>
                <textarea
                  rows={6}
                  className="form-textarea"
                  placeholder="Describe the role mission, responsibilities, team dynamics, and day-to-day work..."
                  {...register('description')}
                />
              </FormField>
            </div>

            {/* Section 2: Requirements & Skills */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                2. Requirements & Skills
              </h2>

              <FormField
                id="job-skills"
                label="Required Skills (Multi-value tag input)"
                error={errors.skills}
                hint="Press Enter or add comma to register each skill."
                required
              >
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="job-skills"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add skills (e.g. React, TypeScript, Docker)..."
                      hasError={Boolean(errors.skills)}
                    />
                  )}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <FormField id="job-exp" label="Minimum Required Experience (Years)" error={errors.experienceYears} required>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="e.g. 3"
                    {...register('experienceYears')}
                  />
                </FormField>

                <FormField id="job-status" label="Vacancy Status" required>
                  <select className="form-select" {...register('status')}>
                    <option value="Open">Open (Accepting Applicants)</option>
                    <option value="Closed">Closed (Archived)</option>
                  </select>
                </FormField>
              </div>
            </div>

            {/* Section 3: Salary Block */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                3. Compensation Package
              </h2>

              <SalaryInput
                minSalary={formValues.minSalary}
                maxSalary={formValues.maxSalary}
                period={formValues.salaryPeriod}
                currency={formValues.salaryCurrency}
                type={formValues.salaryType}
                onChangeMin={(v) => setValue('minSalary', v, { shouldValidate: true })}
                onChangeMax={(v) => setValue('maxSalary', v, { shouldValidate: true })}
                onChangePeriod={(v) => setValue('salaryPeriod', v, { shouldValidate: true })}
                onChangeCurrency={(v) => setValue('salaryCurrency', v, { shouldValidate: true })}
                onChangeType={(v) => setValue('salaryType', v, { shouldValidate: true })}
                errors={{ minSalary: errors.minSalary?.message, maxSalary: errors.maxSalary?.message }}
              />
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/employer/jobs')}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isEditMode ? 'Save Changes' : 'Publish Vacancy'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Candidate Preview Card (Desktop) */}
        <div style={{ flex: '0 0 360px', width: '100%', maxWidth: '380px', position: 'sticky', top: '88px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            <Eye size={16} color="var(--color-primary)" />
            <span>Live Candidate Preview</span>
          </div>

          <JobCard job={previewJob} />

          <div style={{ marginTop: '14px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            This card previews exactly how job seekers will see your posting in search results and recommendation feeds.
          </div>
        </div>
      </div>
    </div>
  );
}

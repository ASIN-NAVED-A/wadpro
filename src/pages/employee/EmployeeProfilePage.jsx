import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Sliders,
  DollarSign,
  GraduationCap,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import profileService from '../../api/services/profileService';
import resumeService from '../../api/services/resumeService';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../components/common/Toast';
import FormField from '../../components/forms/FormField';
import TagInput from '../../components/forms/TagInput';
import SalaryInput from '../../components/forms/SalaryInput';
import FileUpload from '../../components/common/FileUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

// Validation schema matching prompt specifications
const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  headline: z.string().min(3, 'Professional headline is required'),
  summary: z.string().min(10, 'Please write a brief summary (at least 10 characters)'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  skills: z.array(z.string()).min(1, 'Please specify at least one technical skill'),
  totalExperienceYears: z.coerce.number().min(0, 'Experience must be 0 or greater'),
  previousJobTitle: z.string().optional(),
  education: z.string().min(2, 'Education details are required'),
  preferredLocations: z.array(z.string()).min(1, 'Specify at least one preferred location'),
  workMode: z.enum(['On-site', 'Hybrid', 'Remote']),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  minSalary: z.coerce.number().min(0, 'Minimum salary must be 0 or greater'),
  maxSalary: z.coerce.number().min(0, 'Maximum salary must be 0 or greater'),
  salaryPeriod: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly', 'Annual']),
  salaryCurrency: z.string().default('INR'),
  salaryType: z.enum(['Gross', 'CTC', 'Take-home']),
}).refine((data) => data.minSalary <= data.maxSalary, {
  message: 'Minimum salary cannot exceed maximum salary',
  path: ['minSalary'],
});

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [previousProfileData, setPreviousProfileData] = useState(null);
  const [hasExtractedData, setHasExtractedData] = useState(false);
  const [extractedReviewFlags, setExtractedReviewFlags] = useState({});
  const [extractedReviewHints, setExtractedReviewHints] = useState({});

  // Parsing upload state
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeError, setResumeError] = useState('');
  const abortControllerRef = useRef(null);

  // Confirmation Summary Dialog before saving
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Collapsible section toggles
  const [openSections, setOpenSections] = useState({
    personal: true,
    skills: true,
    preferences: true,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      headline: '',
      summary: '',
      phone: '',
      email: '',
      skills: [],
      totalExperienceYears: 0,
      previousJobTitle: '',
      education: '',
      preferredLocations: [],
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      minSalary: 1000000,
      maxSalary: 1800000,
      salaryPeriod: 'Annual',
      salaryCurrency: 'INR',
      salaryType: 'CTC',
    },
  });

  // Watch salary fields for custom SalaryInput component
  const watchedMinSalary = watch('minSalary');
  const watchedMaxSalary = watch('maxSalary');
  const watchedPeriod = watch('salaryPeriod');
  const watchedCurrency = watch('salaryCurrency');
  const watchedSalaryType = watch('salaryType');

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      setIsLoadingProfile(true);
      try {
        const data = await profileService.getEmployeeProfile();
        setPreviousProfileData(data);

        // Fill form fields from stored profile
        reset({
          fullName: data.personal?.fullName || user?.fullName || '',
          headline: data.personal?.headline || '',
          summary: data.personal?.summary || '',
          phone: data.personal?.phone || '',
          email: data.personal?.email || user?.email || '',
          skills: data.skillsExperience?.skills || [],
          totalExperienceYears: data.skillsExperience?.totalExperienceYears || 0,
          previousJobTitle: data.skillsExperience?.previousJobTitle || '',
          education: data.skillsExperience?.education || '',
          preferredLocations: data.preferences?.preferredLocations || [],
          workMode: data.preferences?.workMode || 'Hybrid',
          employmentType: data.preferences?.employmentType || 'Full-time',
          minSalary: data.preferences?.salary?.min || 1000000,
          maxSalary: data.preferences?.salary?.max || 1800000,
          salaryPeriod: data.preferences?.salary?.period || 'Annual',
          salaryCurrency: data.preferences?.salary?.currency || 'INR',
          salaryType: data.preferences?.salary?.type || 'CTC',
        });
      } catch (err) {
        toast.error('Failed to load profile. Please refresh.');
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [reset, user, toast]);

  // Handle resume file upload & auto-fill
  const handleResumeFileSelect = async (file) => {
    setResumeError('');
    setIsParsingResume(true);
    setUploadProgress(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const parsedResult = await resumeService.parseResume(
        file,
        (progress) => setUploadProgress(progress),
        abortController.signal
      );

      const ext = parsedResult.extractedData;
      if (!ext) throw new Error('No readable candidate information could be extracted.');

      // Auto-fill existing form fields directly
      setValue('fullName', ext.fullName || getValues('fullName'), { shouldValidate: true, shouldDirty: true });
      setValue('headline', ext.headline || getValues('headline'), { shouldValidate: true, shouldDirty: true });
      setValue('summary', ext.summary || getValues('summary'), { shouldValidate: true, shouldDirty: true });
      setValue('phone', ext.phone || getValues('phone'), { shouldValidate: true, shouldDirty: true });
      if (ext.skills?.length) setValue('skills', ext.skills, { shouldValidate: true, shouldDirty: true });
      if (ext.totalExperienceYears !== undefined)
        setValue('totalExperienceYears', ext.totalExperienceYears, { shouldValidate: true, shouldDirty: true });
      if (ext.previousJobTitle) setValue('previousJobTitle', ext.previousJobTitle, { shouldValidate: true, shouldDirty: true });
      if (ext.education) setValue('education', ext.education, { shouldValidate: true, shouldDirty: true });
      if (ext.preferredLocations?.length)
        setValue('preferredLocations', ext.preferredLocations, { shouldValidate: true, shouldDirty: true });
      if (ext.minSalary) setValue('minSalary', ext.minSalary, { shouldValidate: true, shouldDirty: true });
      if (ext.maxSalary) setValue('maxSalary', ext.maxSalary, { shouldValidate: true, shouldDirty: true });

      // Mark low-confidence or missing items with "Please review" flags
      const flags = {};
      const hints = {};

      if (parsedResult.fieldConfidences) {
        Object.entries(parsedResult.fieldConfidences).forEach(([field, confidence]) => {
          if (confidence < 0.75) {
            flags[field] = true;
            hints[field] = parsedResult.reviewHints?.[field] || 'Extracted with moderate confidence; please review.';
          }
        });
      }

      setExtractedReviewFlags(flags);
      setExtractedReviewHints(hints);
      setHasExtractedData(true);

      toast.info('Resume parsed successfully! Please review the extracted fields below before saving.');
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.info('Resume parsing cancelled.');
      } else {
        const msg = err.mapped?.message || err.message || 'Failed to extract resume data.';
        setResumeError(msg);
        toast.error(msg);
      }
    } finally {
      setIsParsingResume(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelParsing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Discard extracted resume data and restore previous profile
  const handleDiscardExtracted = () => {
    if (previousProfileData) {
      reset({
        fullName: previousProfileData.personal?.fullName || '',
        headline: previousProfileData.personal?.headline || '',
        summary: previousProfileData.personal?.summary || '',
        phone: previousProfileData.personal?.phone || '',
        email: previousProfileData.personal?.email || '',
        skills: previousProfileData.skillsExperience?.skills || [],
        totalExperienceYears: previousProfileData.skillsExperience?.totalExperienceYears || 0,
        previousJobTitle: previousProfileData.skillsExperience?.previousJobTitle || '',
        education: previousProfileData.skillsExperience?.education || '',
        preferredLocations: previousProfileData.preferences?.preferredLocations || [],
        workMode: previousProfileData.preferences?.workMode || 'Hybrid',
        employmentType: previousProfileData.preferences?.employmentType || 'Full-time',
        minSalary: previousProfileData.preferences?.salary?.min || 1000000,
        maxSalary: previousProfileData.preferences?.salary?.max || 1800000,
        salaryPeriod: previousProfileData.preferences?.salary?.period || 'Annual',
        salaryCurrency: previousProfileData.preferences?.salary?.currency || 'INR',
        salaryType: previousProfileData.preferences?.salary?.type || 'CTC',
      });
    }
    setHasExtractedData(false);
    setExtractedReviewFlags({});
    setExtractedReviewHints({});
    toast.info('Extracted data discarded. Previous profile values restored.');
  };

  // Trigger confirmation dialog
  const handleApproveAndSaveClick = () => {
    setIsConfirmDialogOpen(true);
  };

  // Persist updated profile after user approval
  const handleConfirmSave = async () => {
    setIsSaving(true);
    const formValues = getValues();

    try {
      const updated = await profileService.updateEmployeeProfile(formValues);
      setPreviousProfileData(updated);
      setHasExtractedData(false);
      setExtractedReviewFlags({});
      setExtractedReviewHints({});
      setIsConfirmDialogOpen(false);
      toast.success('Profile approved and saved successfully!');
    } catch (err) {
      toast.error(err.mapped?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoadingProfile) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader message="Loading employee profile..." />
      </div>
    );
  }

  const formValues = getValues();
  const completeness = previousProfileData?.completenessPercent || 85;

  return (
    <div className="container page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '90px' }}>
      {/* Profile Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Photo Placeholder */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 700,
              border: '2px solid var(--color-border)',
              flexShrink: 0,
            }}
          >
            {(formValues.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formValues.fullName || 'Candidate Profile'}
              </h1>
              <StatusBadge isDemo={true} />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {formValues.headline || 'Senior Technical Specialist'}
            </p>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div style={{ width: '100%', maxWidth: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Profile Strength</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{completeness}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: `${completeness}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '9999px' }} />
          </div>
        </div>
      </div>

      {/* Highlighted Resume Auto-Fill Card */}
      <div
        className="card"
        style={{
          border: '2px solid #BFDBFE',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Upload Resume to Auto-Fill Profile
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Automatically parse your headline, experience, skills, and preferences from your existing CV.
            </div>
          </div>
        </div>

        <FileUpload
          onFileSelect={handleResumeFileSelect}
          isParsing={isParsingResume}
          uploadProgress={uploadProgress}
          onCancel={handleCancelParsing}
          errorMessage={resumeError}
          onClearError={() => setResumeError('')}
        />
      </div>

      {/* Review Extracted Information Banner */}
      {hasExtractedData && (
        <div
          role="region"
          aria-label="Resume extraction notice"
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-warning-soft)',
            border: '1px solid rgba(180, 83, 9, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <AlertTriangle size={22} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-warning)' }}>
              Review Extracted Information
            </div>
            <div style={{ fontSize: '13px', color: '#78350F', marginTop: '2px', lineHeight: 1.5 }}>
              Nothing has been saved to your account yet. Review and edit any extracted values below. Fields flagged with
              <span className="review-flag" style={{ margin: '0 6px' }}>
                <AlertTriangle size={12} /> Please review
              </span>
              require confirmation. Click <strong>Approve and Save Profile</strong> when ready.
            </div>
          </div>
        </div>
      )}

      {/* The Unified Profile Form */}
      <form onSubmit={handleSubmit(handleApproveAndSaveClick)} noValidate>
        {/* Section 1: Personal Details */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div
            onClick={() => toggleSection('personal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              paddingBottom: openSections.personal ? '16px' : 0,
              borderBottom: openSections.personal ? '1px solid var(--color-border)' : 'none',
              marginBottom: openSections.personal ? '16px' : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '17px', fontWeight: 600 }}>Personal Details</h2>
            </div>
            {openSections.personal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.personal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <FormField
                  id="prof-fullName"
                  label="Full Name"
                  error={errors.fullName}
                  reviewFlag={extractedReviewFlags.fullName}
                  reviewHint={extractedReviewHints.fullName}
                  required
                >
                  <input type="text" className="form-input" {...register('fullName')} />
                </FormField>

                <FormField
                  id="prof-phone"
                  label="Phone Number"
                  error={errors.phone}
                  reviewFlag={extractedReviewFlags.phone}
                  reviewHint={extractedReviewHints.phone}
                  required
                >
                  <input type="text" className="form-input" placeholder="+91 98765 43210" {...register('phone')} />
                </FormField>
              </div>

              <FormField
                id="prof-headline"
                label="Professional Headline"
                error={errors.headline}
                hint="e.g. Senior Frontend Engineer | React & Modern Web Architect"
                reviewFlag={extractedReviewFlags.headline}
                reviewHint={extractedReviewHints.headline}
                required
              >
                <input type="text" className="form-input" {...register('headline')} />
              </FormField>

              <FormField
                id="prof-summary"
                label="Professional Summary"
                error={errors.summary}
                reviewFlag={extractedReviewFlags.summary}
                reviewHint={extractedReviewHints.summary}
                required
              >
                <textarea rows={4} className="form-textarea" {...register('summary')} />
              </FormField>

              <FormField id="prof-email" label="Contact Email" error={errors.email} required>
                <input type="email" className="form-input" {...register('email')} />
              </FormField>
            </div>
          )}
        </div>

        {/* Section 2: Skills & Experience */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div
            onClick={() => toggleSection('skills')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              paddingBottom: openSections.skills ? '16px' : 0,
              borderBottom: openSections.skills ? '1px solid var(--color-border)' : 'none',
              marginBottom: openSections.skills ? '16px' : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '17px', fontWeight: 600 }}>Technical Skills & Experience</h2>
            </div>
            {openSections.skills ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.skills && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField
                id="prof-skills"
                label="Core Technical Skills (Multi)"
                error={errors.skills}
                hint="Press Enter or add comma to add each skill chip."
                reviewFlag={extractedReviewFlags.skills}
                reviewHint={extractedReviewHints.skills}
                required
              >
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="prof-skills"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add skills (e.g. React, TypeScript, Redux)..."
                      hasError={Boolean(errors.skills)}
                    />
                  )}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <FormField
                  id="prof-exp"
                  label="Total Experience (Years)"
                  error={errors.totalExperienceYears}
                  reviewFlag={extractedReviewFlags.totalExperienceYears}
                  reviewHint={extractedReviewHints.totalExperienceYears}
                  required
                >
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="form-input"
                    {...register('totalExperienceYears')}
                  />
                </FormField>

                <FormField
                  id="prof-prevTitle"
                  label="Previous / Current Job Title"
                  error={errors.previousJobTitle}
                  reviewFlag={extractedReviewFlags.previousJobTitle}
                  reviewHint={extractedReviewHints.previousJobTitle}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Frontend Developer at Acme"
                    {...register('previousJobTitle')}
                  />
                </FormField>
              </div>

              <FormField
                id="prof-education"
                label="Highest Education"
                error={errors.education}
                reviewFlag={extractedReviewFlags.education}
                reviewHint={extractedReviewHints.education}
                required
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B.Tech in Computer Science, 2020"
                  {...register('education')}
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Section 3: Preferences & Salary */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div
            onClick={() => toggleSection('preferences')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              paddingBottom: openSections.preferences ? '16px' : 0,
              borderBottom: openSections.preferences ? '1px solid var(--color-border)' : 'none',
              marginBottom: openSections.preferences ? '16px' : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--color-primary)" />
              <h2 style={{ fontSize: '17px', fontWeight: 600 }}>Career Preferences & Salary Expectations</h2>
            </div>
            {openSections.preferences ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.preferences && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField
                id="prof-locations"
                label="Preferred Work Locations"
                error={errors.preferredLocations}
                reviewFlag={extractedReviewFlags.preferredLocations}
                reviewHint={extractedReviewHints.preferredLocations}
                required
              >
                <Controller
                  name="preferredLocations"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      id="prof-locations"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Add locations (e.g. Bangalore, Remote, Pune)..."
                      hasError={Boolean(errors.preferredLocations)}
                    />
                  )}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <FormField id="prof-workMode" label="Preferred Work Mode" required>
                  <select className="form-select" {...register('workMode')}>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </FormField>

                <FormField id="prof-empType" label="Preferred Employment Type" required>
                  <select className="form-select" {...register('employmentType')}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </FormField>
              </div>

              {/* Explicit Salary Input Block */}
              <div>
                <label className="form-label" style={{ marginBottom: '6px' }}>
                  Expected Compensation Bracket
                  {extractedReviewFlags.minSalary && (
                    <span className="review-flag" style={{ marginLeft: '8px' }}>
                      <AlertTriangle size={12} /> Please review
                    </span>
                  )}
                </label>
                <SalaryInput
                  minSalary={watchedMinSalary}
                  maxSalary={watchedMaxSalary}
                  period={watchedPeriod}
                  currency={watchedCurrency}
                  type={watchedSalaryType}
                  onChangeMin={(val) => setValue('minSalary', val, { shouldValidate: true, shouldDirty: true })}
                  onChangeMax={(val) => setValue('maxSalary', val, { shouldValidate: true, shouldDirty: true })}
                  onChangePeriod={(val) => setValue('salaryPeriod', val, { shouldValidate: true, shouldDirty: true })}
                  onChangeCurrency={(val) => setValue('salaryCurrency', val, { shouldValidate: true, shouldDirty: true })}
                  onChangeType={(val) => setValue('salaryType', val, { shouldValidate: true, shouldDirty: true })}
                  errors={{ minSalary: errors.minSalary?.message, maxSalary: errors.maxSalary?.message }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            padding: '14px 24px',
            boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.08)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {hasExtractedData ? (
              <span style={{ color: 'var(--color-warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} /> Extracted resume data ready for review
              </span>
            ) : isDirty ? (
              <span>Unsaved changes on profile</span>
            ) : (
              <span>Profile up to date</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {hasExtractedData && (
              <button
                type="button"
                onClick={handleDiscardExtracted}
                className="btn btn-secondary"
              >
                <RotateCcw size={16} />
                <span>Discard Extracted Data</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!isValid}
              className="btn btn-primary"
            >
              <Save size={16} />
              <span>{hasExtractedData ? 'Approve and Save Profile' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Summary Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Approve Profile Updates"
        message={`Are you sure you want to approve and persist these candidate profile details? Headline: "${formValues.headline || ''}", Skills: ${formValues.skills?.length || 0} skills, Target Salary: ₹${Number(formValues.minSalary || 0).toLocaleString()} - ₹${Number(formValues.maxSalary || 0).toLocaleString()} / ${formValues.salaryPeriod || 'Annual'}.`}
        confirmLabel="Confirm & Save"
        cancelLabel="Keep Reviewing"
        isLoading={isSaving}
        onConfirm={handleConfirmSave}
        onClose={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}

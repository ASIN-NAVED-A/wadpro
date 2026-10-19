/**
 * Single source of truth for mapping between Frontend models and Backend API fields.
 * If the backend changes field naming conventions, ONLY this file needs to be updated.
 */

export const USER_FIELD_MAP = {
  // Frontend -> Backend
  toBackendRegister: (formValues) => ({
    name: formValues.fullName,
    fullName: formValues.fullName,
    email: formValues.email.trim().toLowerCase(),
    password: formValues.password,
    role: formValues.role,
  }),

  // Backend -> Frontend
  fromBackendUser: (user) => {
    if (!user) return null;
    return {
      id: user._id || user.id,
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      role: user.role || 'employee',
      createdAt: user.createdAt,
    };
  },
};

export const JOB_FIELD_MAP = {
  // Frontend form values -> Backend POST /jobs and PATCH /jobs/:id
  toBackendJob: (form) => ({
    title: form.title?.trim(),
    company: form.company?.trim(),
    description: form.description?.trim(),
    skills: Array.isArray(form.skills) ? form.skills : [],
    location: form.location?.trim(),
    workMode: form.workMode || 'On-site',
    employmentType: form.employmentType || 'Full-time',
    experience: Number(form.experienceYears || form.experience || 0),
    experienceYears: Number(form.experienceYears || form.experience || 0),
    salaryMin: Number(form.salary?.min || form.salaryMin || 0),
    salaryMax: Number(form.salary?.max || form.salaryMax || 0),
    salaryPeriod: form.salary?.period || form.salaryPeriod || 'Annual',
    salaryCurrency: form.salary?.currency || form.salaryCurrency || 'INR',
    salaryType: form.salary?.type || form.salaryType || 'CTC',
    salary: {
      min: Number(form.salary?.min || form.salaryMin || 0),
      max: Number(form.salary?.max || form.salaryMax || 0),
      period: form.salary?.period || form.salaryPeriod || 'Annual',
      currency: form.salary?.currency || form.salaryCurrency || 'INR',
      type: form.salary?.type || form.salaryType || 'CTC',
    },
    status: form.status || 'Open',
  }),

  // Backend response item -> Frontend normalized job
  fromBackendJob: (job) => {
    if (!job) return null;
    const salaryMin = job.salary?.min ?? job.salaryMin ?? 0;
    const salaryMax = job.salary?.max ?? job.salaryMax ?? 0;
    const salaryPeriod = job.salary?.period ?? job.salaryPeriod ?? 'Annual';
    const salaryCurrency = job.salary?.currency ?? job.salaryCurrency ?? 'INR';
    const salaryType = job.salary?.type ?? job.salaryType ?? 'CTC';

    return {
      id: job._id || job.id,
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      skills: Array.isArray(job.skills) ? job.skills : [],
      location: job.location || '',
      workMode: job.workMode || 'On-site',
      employmentType: job.employmentType || 'Full-time',
      experienceYears: Number(job.experienceYears ?? job.experience ?? 0),
      salary: {
        min: Number(salaryMin),
        max: Number(salaryMax),
        period: salaryPeriod,
        currency: salaryCurrency,
        type: salaryType,
      },
      status: job.status || 'Open',
      applicantsCount: Number(job.applicantsCount || job.applicants?.length || 0),
      createdAt: job.createdAt || job.postedAt || new Date().toISOString(),
      updatedAt: job.updatedAt,
      isDemo: Boolean(job.isDemo),
    };
  },
};

export const PROFILE_FIELD_MAP = {
  // Normalize candidate profile
  fromBackendProfile: (data) => {
    if (!data) return null;
    return {
      personal: {
        fullName: data.personal?.fullName || data.fullName || data.name || '',
        headline: data.personal?.headline || data.headline || '',
        summary: data.personal?.summary || data.summary || '',
        phone: data.personal?.phone || data.phone || '',
        email: data.personal?.email || data.email || '',
        photoUrl: data.personal?.photoUrl || data.photoUrl || '',
      },
      skillsExperience: {
        skills: Array.isArray(data.skillsExperience?.skills || data.skills)
          ? data.skillsExperience?.skills || data.skills
          : [],
        totalExperienceYears: Number(
          data.skillsExperience?.totalExperienceYears ??
            data.totalExperience ??
            data.experienceYears ??
            0
        ),
        previousJobTitle:
          data.skillsExperience?.previousJobTitle || data.previousJobTitle || '',
        education: data.skillsExperience?.education || data.education || '',
        resumeUrl: data.skillsExperience?.resumeUrl || data.resumeUrl || '',
        resumeFileName: data.skillsExperience?.resumeFileName || data.resumeFileName || '',
      },
      preferences: {
        preferredLocations: Array.isArray(data.preferences?.preferredLocations || data.preferredLocations)
          ? data.preferences?.preferredLocations || data.preferredLocations
          : [],
        workMode: data.preferences?.workMode || data.workMode || 'Remote',
        employmentType: data.preferences?.employmentType || data.employmentType || 'Full-time',
        salary: {
          min: Number(data.preferences?.salary?.min ?? data.salaryMin ?? 500000),
          max: Number(data.preferences?.salary?.max ?? data.salaryMax ?? 1200000),
          period: data.preferences?.salary?.period ?? data.salaryPeriod ?? 'Annual',
          currency: data.preferences?.salary?.currency ?? data.salaryCurrency ?? 'INR',
          type: data.preferences?.salary?.type ?? data.salaryType ?? 'CTC',
        },
      },
      completenessPercent: Number(data.completenessPercent || 75),
    };
  },

  toBackendProfile: (form) => ({
    personal: {
      fullName: form.fullName?.trim(),
      headline: form.headline?.trim(),
      summary: form.summary?.trim(),
      phone: form.phone?.trim(),
      email: form.email?.trim(),
      photoUrl: form.photoUrl,
    },
    skillsExperience: {
      skills: form.skills || [],
      totalExperienceYears: Number(form.totalExperienceYears || 0),
      previousJobTitle: form.previousJobTitle?.trim(),
      education: form.education?.trim(),
      resumeUrl: form.resumeUrl,
      resumeFileName: form.resumeFileName,
    },
    preferences: {
      preferredLocations: form.preferredLocations || [],
      workMode: form.workMode,
      employmentType: form.employmentType,
      salary: {
        min: Number(form.minSalary || form.salary?.min || 0),
        max: Number(form.maxSalary || form.salary?.max || 0),
        period: form.salaryPeriod || form.salary?.period || 'Annual',
        currency: form.salaryCurrency || form.salary?.currency || 'INR',
        type: form.salaryType || form.salary?.type || 'CTC',
      },
    },
  }),
};

export const RESUME_ENDPOINT_CONFIG = {
  endpoint: '/resumes/parse',
  fileFieldName: 'file',
  acceptedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
  acceptedExtensions: ['.pdf', '.docx', '.doc'],
};

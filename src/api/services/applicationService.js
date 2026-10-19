import apiClient from '../client';
import { INITIAL_MOCK_APPLICATIONS, INITIAL_MOCK_APPLICANTS } from '../mocks/mockData';

const DEMO_APPLICATIONS_KEY = 'sjp_demo_applications';
const DEMO_APPLICANTS_KEY = 'sjp_demo_applicants';

function getStoredApplications() {
  const stored = localStorage.getItem(DEMO_APPLICATIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(INITIAL_MOCK_APPLICATIONS));
  return INITIAL_MOCK_APPLICATIONS;
}

function saveStoredApplications(apps) {
  localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(apps));
}

function getStoredApplicants() {
  const stored = localStorage.getItem(DEMO_APPLICANTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(DEMO_APPLICANTS_KEY, JSON.stringify(INITIAL_MOCK_APPLICANTS));
  return INITIAL_MOCK_APPLICANTS;
}

function saveStoredApplicants(applicants) {
  localStorage.setItem(DEMO_APPLICANTS_KEY, JSON.stringify(applicants));
}

export const applicationService = {
  /**
   * Fetch current candidate's applied jobs
   */
  async getMyApplications() {
    const useMock = import.meta.env.VITE_USE_MOCKS_APPLICATIONS !== 'false';

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return getStoredApplications();
    }

    try {
      const response = await apiClient.get('/applications');
      return response.data?.applications || response.data;
    } catch {
      return getStoredApplications();
    }
  },

  /**
   * Apply to a job posting
   */
  async applyToJob(jobId, jobData, applicationPayload = {}) {
    const useMock = import.meta.env.VITE_USE_MOCKS_APPLICATIONS !== 'false';

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const apps = getStoredApplications();

      // Check if already applied
      const existing = apps.find((a) => a.jobId === jobId);
      if (existing) {
        throw new Error('You have already submitted an application for this position.');
      }

      const newApp = {
        id: 'app-' + Date.now(),
        jobId,
        jobTitle: jobData.title,
        company: jobData.company,
        location: jobData.location,
        workMode: jobData.workMode,
        appliedDate: new Date().toISOString(),
        status: 'Applied',
        coverLetter: applicationPayload.coverLetter || '',
        isDemo: true,
      };

      apps.unshift(newApp);
      saveStoredApplications(apps);
      return newApp;
    }

    const response = await apiClient.post(`/jobs/${jobId}/apply`, applicationPayload);
    return response.data;
  },

  /**
   * Employer: Get applicants for a specific job or all jobs
   */
  async getApplicants(jobId) {
    const useMock = import.meta.env.VITE_USE_MOCKS_APPLICATIONS !== 'false';

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const all = getStoredApplicants();
      if (!jobId || jobId === 'all') return all;
      return all.filter((a) => a.jobId === jobId);
    }

    try {
      const url = jobId ? `/employers/jobs/${jobId}/applicants` : `/employers/applicants`;
      const response = await apiClient.get(url);
      return response.data?.applicants || response.data;
    } catch {
      return getStoredApplicants();
    }
  },

  /**
   * Employer: Update candidate application status
   */
  async updateApplicantStatus(applicantId, newStatus) {
    const useMock = import.meta.env.VITE_USE_MOCKS_APPLICATIONS !== 'false';

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const applicants = getStoredApplicants();
      const match = applicants.find((a) => a.id === applicantId);
      if (match) {
        match.status = newStatus;
        saveStoredApplicants(applicants);
        return match;
      }
      throw new Error('Applicant not found');
    }

    const response = await apiClient.patch(`/employers/applicants/${applicantId}/status`, {
      status: newStatus,
    });
    return response.data;
  },
};

export default applicationService;

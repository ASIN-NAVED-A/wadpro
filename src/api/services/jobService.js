import apiClient from '../client';
import { JOB_FIELD_MAP } from '../fieldMap';
import { INITIAL_MOCK_JOBS } from '../mocks/mockData';

// Local storage key for demo/offline jobs persistence
const DEMO_JOBS_KEY = 'sjp_demo_jobs';

function getStoredDemoJobs() {
  const stored = localStorage.getItem(DEMO_JOBS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(DEMO_JOBS_KEY, JSON.stringify(INITIAL_MOCK_JOBS));
  return INITIAL_MOCK_JOBS;
}

function saveStoredDemoJobs(jobs) {
  localStorage.setItem(DEMO_JOBS_KEY, JSON.stringify(jobs));
}

export const jobService = {
  /**
   * Fetch jobs with filtering and pagination
   */
  async getJobs(params = {}) {
    const {
      search,
      location,
      workMode,
      employmentType,
      experienceLevel,
      skills,
      minSalary,
      maxSalary,
      page = 1,
      limit = 6,
    } = params;

    // Standard backend supported params
    const query = { page, limit };
    if (search) query.search = search;
    if (location) query.location = location;
    if (workMode && workMode !== 'All') query.workMode = workMode;
    if (employmentType && employmentType !== 'All') query.employmentType = employmentType;

    try {
      const response = await apiClient.get('/jobs', { params: query });
      const rawData = response.data;
      const rawJobs = Array.isArray(rawData)
        ? rawData
        : rawData.jobs || rawData.data || [];
      const total = rawData.total || rawData.count || rawJobs.length;

      let jobs = rawJobs.map(JOB_FIELD_MAP.fromBackendJob);

      // Client-side filtering fallback for fields not supported by backend
      let clientFiltered = false;

      if (experienceLevel !== undefined && experienceLevel !== '' && experienceLevel !== 'All') {
        const expNum = Number(experienceLevel);
        if (!isNaN(expNum)) {
          jobs = jobs.filter((j) => j.experienceYears <= expNum + 1 && j.experienceYears >= Math.max(0, expNum - 1));
          clientFiltered = true;
        }
      }

      if (Array.isArray(skills) && skills.length > 0) {
        jobs = jobs.filter((j) =>
          skills.some((sk) =>
            j.skills.some((js) => js.toLowerCase().includes(sk.toLowerCase()))
          )
        );
        clientFiltered = true;
      }

      if (minSalary && Number(minSalary) > 0) {
        jobs = jobs.filter((j) => j.salary.max >= Number(minSalary));
        clientFiltered = true;
      }

      return {
        jobs,
        total: clientFiltered ? jobs.length : total,
        page: Number(page),
        totalPages: Math.ceil((clientFiltered ? jobs.length : total) / limit) || 1,
        clientFiltered,
        isDemo: false,
      };
    } catch (error) {
      // Fallback demo implementation if backend is offline
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        let allJobs = getStoredDemoJobs().map(JOB_FIELD_MAP.fromBackendJob);

        if (search) {
          const s = search.toLowerCase();
          allJobs = allJobs.filter(
            (j) =>
              j.title.toLowerCase().includes(s) ||
              j.company.toLowerCase().includes(s) ||
              j.description.toLowerCase().includes(s)
          );
        }

        if (location) {
          allJobs = allJobs.filter((j) =>
            j.location.toLowerCase().includes(location.toLowerCase())
          );
        }

        if (workMode && workMode !== 'All') {
          allJobs = allJobs.filter((j) => j.workMode === workMode);
        }

        if (employmentType && employmentType !== 'All') {
          allJobs = allJobs.filter((j) => j.employmentType === employmentType);
        }

        if (experienceLevel !== undefined && experienceLevel !== '' && experienceLevel !== 'All') {
          const expNum = Number(experienceLevel);
          if (!isNaN(expNum)) {
            allJobs = allJobs.filter((j) => j.experienceYears <= expNum + 2);
          }
        }

        if (Array.isArray(skills) && skills.length > 0) {
          allJobs = allJobs.filter((j) =>
            skills.some((sk) =>
              j.skills.some((js) => js.toLowerCase().includes(sk.toLowerCase()))
            )
          );
        }

        if (minSalary && Number(minSalary) > 0) {
          allJobs = allJobs.filter((j) => j.salary.max >= Number(minSalary));
        }

        const startIndex = (page - 1) * limit;
        const pagedJobs = allJobs.slice(startIndex, startIndex + limit);

        return {
          jobs: pagedJobs,
          total: allJobs.length,
          page: Number(page),
          totalPages: Math.ceil(allJobs.length / limit) || 1,
          clientFiltered: false,
          isDemo: true,
        };
      }
      throw error;
    }
  },

  /**
   * Get single job by ID
   */
  async getJobById(id) {
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      return JOB_FIELD_MAP.fromBackendJob(response.data?.job || response.data);
    } catch (error) {
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const jobs = getStoredDemoJobs().map(JOB_FIELD_MAP.fromBackendJob);
        const match = jobs.find((j) => j.id === id);
        if (match) return match;
      }
      throw error;
    }
  },

  /**
   * Create new job posting (POST /jobs)
   */
  async createJob(formData) {
    const payload = JOB_FIELD_MAP.toBackendJob(formData);

    try {
      const response = await apiClient.post('/jobs', payload);
      return JOB_FIELD_MAP.fromBackendJob(response.data?.job || response.data);
    } catch (error) {
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const jobs = getStoredDemoJobs();
        const newJob = {
          _id: 'job-demo-' + Date.now(),
          ...payload,
          applicantsCount: 0,
          createdAt: new Date().toISOString(),
          isDemo: true,
        };
        jobs.unshift(newJob);
        saveStoredDemoJobs(jobs);
        return JOB_FIELD_MAP.fromBackendJob(newJob);
      }
      throw error;
    }
  },

  /**
   * Update existing job posting (PATCH /jobs/:id)
   */
  async updateJob(id, formData) {
    const payload = JOB_FIELD_MAP.toBackendJob(formData);

    try {
      const response = await apiClient.patch(`/jobs/${id}`, payload);
      return JOB_FIELD_MAP.fromBackendJob(response.data?.job || response.data);
    } catch (error) {
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const jobs = getStoredDemoJobs();
        const index = jobs.findIndex((j) => (j._id || j.id) === id);
        if (index !== -1) {
          jobs[index] = { ...jobs[index], ...payload, updatedAt: new Date().toISOString() };
          saveStoredDemoJobs(jobs);
          return JOB_FIELD_MAP.fromBackendJob(jobs[index]);
        }
      }
      throw error;
    }
  },

  /**
   * Delete job posting (DELETE /jobs/:id)
   */
  async deleteJob(id) {
    try {
      const response = await apiClient.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const jobs = getStoredDemoJobs();
        const filtered = jobs.filter((j) => (j._id || j.id) !== id);
        saveStoredDemoJobs(filtered);
        return { success: true, message: 'Job deleted successfully' };
      }
      throw error;
    }
  },

  /**
   * Employer dashboard stats (GET /employers/dashboard)
   */
  async getEmployerDashboard() {
    try {
      const response = await apiClient.get('/employers/dashboard');
      return response.data;
    } catch (error) {
      if (error.mapped?.isNetworkError && import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true') {
        const jobs = getStoredDemoJobs().map(JOB_FIELD_MAP.fromBackendJob);
        const active = jobs.filter((j) => j.status === 'Open').length;
        const closed = jobs.filter((j) => j.status === 'Closed').length;
        const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);

        return {
          stats: {
            activeJobs: active,
            closedJobs: closed,
            totalApplicants: totalApplicants || 28,
            newThisWeek: 9,
          },
          recentJobs: jobs.slice(0, 5),
          isDemo: true,
        };
      }
      throw error;
    }
  },
};

export default jobService;

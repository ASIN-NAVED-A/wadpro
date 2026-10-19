import apiClient from '../client';
import { PROFILE_FIELD_MAP } from '../fieldMap';
import { INITIAL_MOCK_PROFILE } from '../mocks/mockData';

const DEMO_PROFILE_KEY = 'sjp_demo_profile';
const DEMO_COMPANY_PROFILE_KEY = 'sjp_demo_company_profile';

const INITIAL_COMPANY_PROFILE = {
  companyName: 'Nexus Tech Solutions',
  description:
    'Nexus Tech Solutions is a high-growth cloud intelligence enterprise powering digital transformation for Fortune 500 organizations worldwide.',
  website: 'https://nexustech.example.com',
  contactEmail: 'careers@nexustech.example.com',
  phone: '+91 80 4123 4567',
  location: 'Bangalore, Karnataka',
  employeeCount: '500-1000',
  isDemo: true,
};

function getStoredProfile() {
  const stored = localStorage.getItem(DEMO_PROFILE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(INITIAL_MOCK_PROFILE));
  return INITIAL_MOCK_PROFILE;
}

function saveStoredProfile(profile) {
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
}

export const profileService = {
  /**
   * Fetch current employee profile
   */
  async getEmployeeProfile() {
    const useMock = import.meta.env.VITE_USE_MOCKS_PROFILE !== 'false';

    if (useMock) {
      // Simulate network latency (200ms)
      await new Promise((resolve) => setTimeout(resolve, 200));
      return getStoredProfile();
    }

    try {
      const response = await apiClient.get('/profile/me');
      return PROFILE_FIELD_MAP.fromBackendProfile(response.data);
    } catch (error) {
      if (error.mapped?.isNetworkError || error.response?.status === 404) {
        return getStoredProfile();
      }
      throw error;
    }
  },

  /**
   * Update employee profile
   */
  async updateEmployeeProfile(formData) {
    const useMock = import.meta.env.VITE_USE_MOCKS_PROFILE !== 'false';
    const payload = PROFILE_FIELD_MAP.toBackendProfile(formData);

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const current = getStoredProfile();

      // Recalculate completeness
      let score = 30;
      if (payload.personal.fullName && payload.personal.headline) score += 20;
      if (payload.personal.summary) score += 15;
      if (payload.skillsExperience.skills.length > 0) score += 15;
      if (payload.skillsExperience.totalExperienceYears > 0) score += 10;
      if (payload.skillsExperience.education) score += 10;

      const updated = {
        ...current,
        personal: { ...current.personal, ...payload.personal },
        skillsExperience: { ...current.skillsExperience, ...payload.skillsExperience },
        preferences: { ...current.preferences, ...payload.preferences },
        completenessPercent: Math.min(100, score),
        isDemo: true,
      };

      saveStoredProfile(updated);
      return updated;
    }

    const response = await apiClient.put('/profile/me', payload);
    return PROFILE_FIELD_MAP.fromBackendProfile(response.data);
  },

  /**
   * Fetch employer company profile
   */
  async getCompanyProfile() {
    const stored = localStorage.getItem(DEMO_COMPANY_PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return INITIAL_COMPANY_PROFILE;
  },

  /**
   * Update employer company profile
   */
  async updateCompanyProfile(data) {
    const updated = { ...data, isDemo: true };
    localStorage.setItem(DEMO_COMPANY_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },
};

export default profileService;

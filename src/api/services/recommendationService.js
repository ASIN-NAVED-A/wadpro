import apiClient from '../client';
import { INITIAL_MOCK_RECOMMENDATIONS } from '../mocks/mockData';

export const recommendationService = {
  /**
   * Fetch personalized job recommendations for the logged-in candidate
   */
  async getRecommendations() {
    const useMock = import.meta.env.VITE_USE_MOCKS_RECOMMENDATIONS !== 'false';

    if (useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        disclaimer:
          'This score estimates how well a job matches your profile. It does not predict your chances of being hired.',
        recommendations: INITIAL_MOCK_RECOMMENDATIONS,
        isDemo: true,
      };
    }

    try {
      const response = await apiClient.get('/recommendations/jobs');
      return {
        disclaimer:
          'This score estimates how well a job matches your profile. It does not predict your chances of being hired.',
        recommendations: response.data?.recommendations || response.data,
        isDemo: false,
      };
    } catch {
      return {
        disclaimer:
          'This score estimates how well a job matches your profile. It does not predict your chances of being hired.',
        recommendations: INITIAL_MOCK_RECOMMENDATIONS,
        isDemo: true,
      };
    }
  },
};

export default recommendationService;

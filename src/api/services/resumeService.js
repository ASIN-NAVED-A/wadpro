import apiClient from '../client';
import { RESUME_ENDPOINT_CONFIG } from '../fieldMap';

export const resumeService = {
  /**
   * Parse a resume file (PDF or DOCX) into candidate profile fields
   * @param {File} file
   * @param {Function} onProgress (percentCompleted: number) => void
   * @param {AbortSignal} signal AbortController signal
   */
  async parseResume(file, onProgress = () => {}, signal = null) {
    const useMock = import.meta.env.VITE_USE_MOCKS_RESUME !== 'false';

    if (useMock) {
      // Simulate stepped upload progress
      for (let p = 15; p <= 90; p += 25) {
        if (signal?.aborted) {
          const err = new Error('Resume parsing was cancelled.');
          err.name = 'AbortError';
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        onProgress(p);
      }

      // Complete upload progress
      onProgress(100);

      // Simulate parsing phase
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve(), 900);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            const err = new Error('Resume parsing was cancelled.');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });

      // Realistic extracted profile data derived from resume content
      return {
        isDemo: true,
        extractedAt: new Date().toISOString(),
        fileName: file.name,
        extractedData: {
          fullName: 'Priya Sharma',
          headline: 'Lead Frontend Architect & React Specialist',
          summary:
            'Accomplished Software Engineer with 5+ years specializing in enterprise React architectures, design systems, Web Vitals performance tuning, and high-load web applications.',
          phone: '+91 98765 43210',
          email: 'priya.sharma@example.com',
          skills: [
            'React',
            'TypeScript',
            'JavaScript',
            'Next.js',
            'Redux Toolkit',
            'CSS Modules',
            'Node.js',
            'REST APIs',
            'GraphQL',
            'Web Performance',
          ],
          totalExperienceYears: 5,
          previousJobTitle: 'Senior Frontend Developer at TechCorp Systems',
          education: 'Bachelor of Engineering in Computer Science, 2019',
          preferredLocations: ['Bangalore, Karnataka', 'Remote', 'Pune, Maharashtra'],
          workMode: 'Hybrid',
          employmentType: 'Full-time',
          minSalary: 1800000,
          maxSalary: 2800000,
          salaryPeriod: 'Annual',
          salaryCurrency: 'INR',
          salaryType: 'CTC',
        },
        fieldConfidences: {
          fullName: 0.98,
          headline: 0.95,
          summary: 0.92,
          phone: 0.90,
          skills: 0.96,
          totalExperienceYears: 0.85,
          previousJobTitle: 0.89,
          education: 0.90,
          // Low-confidence or requires review:
          preferredLocations: 0.65,
          minSalary: 0.50, // Flagged for review
          maxSalary: 0.50, // Flagged for review
        },
        reviewHints: {
          preferredLocations: 'Extracted from previous location history. Please verify your preferred work locations.',
          minSalary: 'Salary expectations are not listed in resumes. Please review your expected compensation range.',
          maxSalary: 'Please verify maximum expected salary ceiling.',
        },
      };
    }

    // Real API Implementation
    const formData = new FormData();
    formData.append(RESUME_ENDPOINT_CONFIG.fileFieldName, file);

    const response = await apiClient.post(RESUME_ENDPOINT_CONFIG.endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },
};

export default resumeService;

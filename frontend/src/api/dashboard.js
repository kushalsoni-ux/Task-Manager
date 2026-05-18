import api from './axios';
import { getFallbackDashboardData, runWithFallback } from './fallbackData';

export const dashboardAPI = {
  get: () => runWithFallback(() => api.get('/dashboard'), () => getFallbackDashboardData()),
};

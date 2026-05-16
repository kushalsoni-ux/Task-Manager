import api from './axios';

const authApiPath = import.meta.env.VITE_AUTH_API_PATH || '/auth';

export const authAPI = {
  register: (data) => api.post(`${authApiPath}/register`, data),
  login: (data) => api.post(`${authApiPath}/login`, data),
  refresh: (refreshToken) => api.post(`${authApiPath}/refresh`, { refreshToken }),
  me: () => api.get(`${authApiPath}/me`),
};

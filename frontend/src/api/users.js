import api from './axios';
import {
  changeFallbackPassword,
  getFallbackUsers,
  runWithFallback,
  updateFallbackProfile,
  updateFallbackUserRole,
} from './fallbackData';

export const usersAPI = {
  getAll: () => runWithFallback(() => api.get('/users'), () => getFallbackUsers()),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => runWithFallback(() => api.patch('/users/me/profile', data), () => updateFallbackProfile(data)),
  changePassword: (data) => runWithFallback(() => api.patch('/users/me/password', data), () => changeFallbackPassword(data)),
  updateRole: (id, role) => runWithFallback(() => api.patch(`/users/${id}/role`, { role }), () => updateFallbackUserRole(id, role)),
};

import api from './axios';

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.patch('/users/me/profile', data),
  changePassword: (data) => api.patch('/users/me/password', data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};

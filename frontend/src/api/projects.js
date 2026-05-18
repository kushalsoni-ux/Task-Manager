import api from './axios';
import {
  addFallbackProjectMember,
  createFallbackProject,
  deleteFallbackProject,
  getFallbackProjectById,
  getFallbackProjects,
  removeFallbackProjectMember,
  runWithFallback,
  updateFallbackProject,
  updateFallbackProjectMemberRole,
} from './fallbackData';

export const projectsAPI = {
  getAll: (params) => runWithFallback(() => api.get('/projects', { params }), () => getFallbackProjects()),
  getById: (id) => runWithFallback(() => api.get(`/projects/${id}`), () => getFallbackProjectById(id)),
  create: (data) => runWithFallback(() => api.post('/projects', data), () => createFallbackProject(data)),
  update: (id, data) => runWithFallback(() => api.put(`/projects/${id}`, data), () => updateFallbackProject(id, data)),
  delete: (id) => runWithFallback(() => api.delete(`/projects/${id}`), () => deleteFallbackProject(id)),
  addMember: (id, data) => runWithFallback(() => api.post(`/projects/${id}/members`, data), () => addFallbackProjectMember(id, data)),
  removeMember: (projectId, userId) =>
    runWithFallback(() => api.delete(`/projects/${projectId}/members/${userId}`), () => removeFallbackProjectMember(projectId, userId)),
  updateMemberRole: (projectId, userId, role) =>
    runWithFallback(
      () => api.patch(`/projects/${projectId}/members/${userId}/role`, { role }),
      () => updateFallbackProjectMemberRole(projectId, userId, role)
    ),
};

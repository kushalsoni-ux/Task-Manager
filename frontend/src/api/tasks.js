import api from './axios';
import {
  addFallbackTaskComment,
  createFallbackTask,
  deleteFallbackTask,
  deleteFallbackTaskComment,
  getFallbackTaskById,
  getFallbackTasks,
  runWithFallback,
  updateFallbackTask,
  updateFallbackTaskStatus,
} from './fallbackData';

export const tasksAPI = {
  getAll: (params) => runWithFallback(() => api.get('/tasks', { params }), () => getFallbackTasks(params)),
  getById: (id) => runWithFallback(() => api.get(`/tasks/${id}`), () => getFallbackTaskById(id)),
  create: (data) => runWithFallback(() => api.post('/tasks', data), () => createFallbackTask(data)),
  update: (id, data) => runWithFallback(() => api.put(`/tasks/${id}`, data), () => updateFallbackTask(id, data)),
  updateStatus: (id, status) =>
    runWithFallback(() => api.patch(`/tasks/${id}/status`, { status }), () => updateFallbackTaskStatus(id, status)),
  delete: (id) => runWithFallback(() => api.delete(`/tasks/${id}`), () => deleteFallbackTask(id)),
  addComment: (id, content) =>
    runWithFallback(() => api.post(`/tasks/${id}/comments`, { content }), () => addFallbackTaskComment(id, content)),
  deleteComment: (taskId, commentId) =>
    runWithFallback(() => api.delete(`/tasks/${taskId}/comments/${commentId}`), () => deleteFallbackTaskComment(taskId, commentId)),
};

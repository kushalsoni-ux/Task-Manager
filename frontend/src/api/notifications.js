import api from './axios';
import {
  deleteFallbackNotification,
  getFallbackNotificationsData,
  markAllFallbackNotificationsAsRead,
  markFallbackNotificationAsRead,
  runWithFallback,
} from './fallbackData';

export const notificationsAPI = {
  getAll: () => runWithFallback(() => api.get('/notifications'), () => getFallbackNotificationsData()),
  markAsRead: (id) => runWithFallback(() => api.patch(`/notifications/${id}/read`), () => markFallbackNotificationAsRead(id)),
  markAllAsRead: () => runWithFallback(() => api.patch('/notifications/read-all'), () => markAllFallbackNotificationsAsRead()),
  delete: (id) => runWithFallback(() => api.delete(`/notifications/${id}`), () => deleteFallbackNotification(id)),
};

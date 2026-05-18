import { create } from 'zustand';
import { authAPI } from '../api/auth';
import { clearStoredUser, persistSessionUser, setStorageMode } from '../api/fallbackData';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await authAPI.me();
      setStorageMode(data.storageMode === 'fallback' ? 'fallback' : 'api');
      persistSessionUser(data.user);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearStoredUser();
      setStorageMode('api');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setStorageMode(data.storageMode === 'fallback' ? 'fallback' : 'api');
    persistSessionUser(data.user, { password });
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  register: async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setStorageMode(data.storageMode === 'fallback' ? 'fallback' : 'api');
    persistSessionUser(data.user, { password });
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    clearStoredUser();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => {
      const user = { ...state.user, ...updates };
      persistSessionUser(user);
      return { user };
    });
  },
}));

export default useAuthStore;

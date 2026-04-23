import { create } from 'zustand';
import { clearReadingHistory } from '../utils/readingHistory';

export const useAuthStore = create((set) => ({
  user: (() => {
      try {
          const stored = localStorage.getItem('user');
          return stored ? JSON.parse(stored) : null;
      } catch {
          return null;
      }
  })(),
  token: localStorage.getItem('token') || null,
  login: (userData, tokenData) => set(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', tokenData);
      return { user: userData, token: tokenData };
  }),
  updateUser: (userData) => set(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
  }),
  logout: () => set(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearReadingHistory();
      return { user: null, token: null };
  }),
}));

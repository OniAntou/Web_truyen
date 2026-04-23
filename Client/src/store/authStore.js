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
  login: (userData) => set(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
  }),
  updateUser: (userData) => set(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
  }),
  logout: () => set(() => {
      localStorage.removeItem('user');
      clearReadingHistory();
      return { user: null };
  }),
}));

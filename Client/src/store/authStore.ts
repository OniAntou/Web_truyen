import { create } from 'zustand';
import { clearReadingHistory } from '../utils/readingHistory';
import { clearAuthToken } from '../utils/authToken';

import { User } from '../types/user';

interface AuthState {
  user: User | null;
  login: (userData: User) => void;
  updateUser: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
      try {
          const stored = localStorage.getItem('user');
          return stored ? JSON.parse(stored) : null;
      } catch {
          return null;
      }
  })(),
  login: (userData: User) => set(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
  }),
  updateUser: (userData: User) => set(() => {
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData };
  }),
  logout: () => set(() => {
      localStorage.removeItem('user');
      clearAuthToken();
      clearReadingHistory();
      return { user: null };
  }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'vi',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'vi' ? 'en' : 'vi' })),
    }),
    {
      name: 'language-storage',
    }
  )
);

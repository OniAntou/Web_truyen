import { useLanguageStore } from '../store/languageStore';
import { translations, TranslationKeys } from '../utils/translations';

export const useTranslation = () => {
  const { language, toggleLanguage, setLanguage } = useLanguageStore();

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || key;
  };

  return { t, language, toggleLanguage, setLanguage };
};

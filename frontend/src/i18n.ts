import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';

const STORAGE_KEY = 'restaurant-platform.language';

export const getStoredLanguage = () => {
  if (typeof window === 'undefined') {
    return 'vi';
  }

  return window.localStorage.getItem(STORAGE_KEY) || 'vi';
};

export const setStoredLanguage = (language: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, language);
  }
};

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (language) => {
  setStoredLanguage(language);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
});

export default i18n;

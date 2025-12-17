import { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, applyFontFamily } from './i18nConfig';

// Import translation files
import enTranslations from './en.json';
import hiTranslations from './hi.json';
import mrTranslations from './mr.json';

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations,
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or use default
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved || DEFAULT_LANGUAGE;
  });

  // Apply font family when language changes
  useEffect(() => {
    applyFontFamily(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  // Translation function with interpolation support
  const t = (key, variables = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations[DEFAULT_LANGUAGE];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace variables in the format {{variableName}}
    if (Object.keys(variables).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] !== undefined ? String(variables[varName]) : match;
      });
    }

    return value;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    isEnglish: language === 'en',
    isHindi: language === 'hi',
    isMarathi: language === 'mr',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}


/**
 * useTranslation Hook
 * Convenience hook for accessing translations
 * Usage: const { t } = useTranslation();
 */
import { useLanguage } from '../i18n/LanguageContext';

export function useTranslation() {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
}


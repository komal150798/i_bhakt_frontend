/**
 * i18n Configuration
 * Supports: English (en), Hindi (hi), Marathi (mr)
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGE_STORAGE_KEY = 'astroverse-language';

/**
 * Get font family based on language
 */
export const getFontFamily = (language) => {
  switch (language) {
    case 'hi':
    case 'mr':
      return "'Noto Sans Devanagari', 'Mukta', 'Poppins', sans-serif";
    case 'en':
    default:
      return "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  }
};

/**
 * Apply font family to document
 */
export const applyFontFamily = (language) => {
  const fontFamily = getFontFamily(language);
  document.documentElement.style.setProperty('--font-family', fontFamily);
  document.documentElement.setAttribute('data-lang', language);
};


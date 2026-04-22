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

const DEVANAGARI_FONT_LINK_ID = 'ibhakt-fonts-devanagari';

function ensureDevanagariFontsLoaded() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(DEVANAGARI_FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = DEVANAGARI_FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Mukta:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

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
      return "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif";
  }
};

/**
 * Apply font family to document
 */
export const applyFontFamily = (language) => {
  const fontFamily = getFontFamily(language);
  document.documentElement.style.setProperty('--font-family', fontFamily);
  document.documentElement.setAttribute('data-lang', language);
  if (language === 'hi' || language === 'mr') {
    ensureDevanagariFontsLoaded();
  }
};


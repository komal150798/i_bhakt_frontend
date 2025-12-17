import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-link text-decoration-none d-flex align-items-center gap-2"
        type="button"
        onClick={toggleLanguage}
        style={{ color: 'var(--text-primary)', border: 'none' }}
        aria-label="Switch language"
      >
        <i className="bi bi-translate" style={{ fontSize: '1.25rem' }}></i>
        <span className="d-none d-md-inline">{language === 'en' ? 'EN' : 'HI'}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;








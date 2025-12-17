import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('ibhakt_admin_theme') as Theme;
    if (savedTheme) return savedTheme;
    
    const savedMainTheme = localStorage.getItem('theme') as Theme;
    if (savedMainTheme) return savedMainTheme;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    // Check if we're in admin area
    const isAdminArea = window.location.pathname.startsWith('/admin');
    if (isAdminArea) {
      document.documentElement.setAttribute('data-theme', `admin-${theme}`);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Save to both keys for compatibility
    localStorage.setItem('theme', theme);
    localStorage.setItem('ibhakt_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('ibhakt_admin_theme', newTheme);
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};






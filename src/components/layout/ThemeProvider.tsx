'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const applySavedTheme = () => {
        try {
          const savedSettings = localStorage.getItem('infinityKitSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.theme === 'dark' || settings.theme === 'light') {
              setTheme(settings.theme);
              document.documentElement.setAttribute('data-theme', settings.theme);
            }
          } else {
            // Default to light
            setTheme('light');
            document.documentElement.setAttribute('data-theme', 'light');
          }
        } catch (e) {
          console.error(e);
        }
      };

      applySavedTheme();
      setMounted(true);

      // Listen for background sync updates (e.g. from login / cloud sync)
      window.addEventListener('infinityKitDataSynced', applySavedTheme);
      return () => {
        window.removeEventListener('infinityKitDataSynced', applySavedTheme);
      };
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    try {
      const savedSettings = JSON.parse(localStorage.getItem('infinityKitSettings') || '{}');
      savedSettings.theme = nextTheme;
      localStorage.setItem('infinityKitSettings', JSON.stringify(savedSettings));

      // Asynchronously save theme settings to Supabase / Firebase
      import('../../lib/sync').then(({ default: syncService }) => {
        syncService.saveData('infinityKitSettings', savedSettings);
      }).catch(err => console.error('[Theme Sync Warning]', err));
    } catch (e) {
      console.error(e);
    }
  };

  // Prevent flash by server rendering default light and client swapping
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
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

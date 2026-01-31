"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Theme {
  accentColor: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  updateAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME: Theme = {
  accentColor: '#ef4444',
};

export function ThemeProvider(props: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const savedTheme = localStorage.getItem('durrat-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setThemeState(parsedTheme);
        applyTheme(parsedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    document.documentElement.style.setProperty('--color-accent', newTheme.accentColor);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('durrat-theme', JSON.stringify(newTheme));
  };

  const updateAccentColor = (color: string) => {
    const newTheme = { ...theme, accentColor: color };
    setTheme(newTheme);
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    updateAccentColor,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

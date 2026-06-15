"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_ACCENT_COLOR } from '@/lib/theme-colors';

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
  accentColor: DEFAULT_ACCENT_COLOR,
};

export function ThemeProvider(props: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
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

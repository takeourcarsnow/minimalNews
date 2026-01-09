'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, themes } from '@/styles/themes';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  nextTheme: () => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  const availableThemes = Object.keys(themes) as Theme[];

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && availableThemes.includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    if (availableThemes.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const nextTheme = () => {
    const currentIndex = availableThemes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setThemeState(availableThemes[nextIndex]);
  };

  // Always render children, just provide default context until mounted
  const value = {
    theme,
    toggleTheme,
    setTheme,
    nextTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

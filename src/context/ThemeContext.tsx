import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeConfig, ThemeMode, ThemeColor } from '../styles/theme';
import { getTheme } from '../styles/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeColor: (color: ThemeColor) => void;
  currentTheme: ReturnType<typeof getTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    // Try to get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return JSON.parse(savedTheme);
    }
    // Default theme
    return {
      mode: 'dark',
      color: 'blue',
    };
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme.mode);
    document.documentElement.setAttribute('data-color', theme.color);
  }, [theme]);

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(prev => ({ ...prev, mode }));
  };

  const setThemeColor = (color: ThemeColor) => {
    setTheme(prev => ({ ...prev, color }));
  };

  const currentTheme = getTheme(theme);

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode, setThemeColor, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
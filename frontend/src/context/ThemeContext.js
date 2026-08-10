import React, { createContext, useEffect, useState } from 'react';
import { getConfiguracionPublica } from '../api';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  const getContrast = (hex) => {
    if (!hex) return '#ffffff';
    let h = hex.charAt(0) === '#' ? hex.substring(1, 7) : hex;
    let r = parseInt(h.substring(0, 2), 16);
    let g = parseInt(h.substring(2, 4), 16);
    let b = parseInt(h.substring(4, 6), 16);
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#111827' : '#ffffff';
  };

  const applyTheme = (config) => {
    const root = document.documentElement;
    if (config.theme_primary_color) {
      root.style.setProperty('--color-primary', config.theme_primary_color);
      root.style.setProperty('--color-primary-content', getContrast(config.theme_primary_color));
    }
    if (config.theme_bg_color) {
      root.style.setProperty('--color-bg', config.theme_bg_color);
    }
    if (config.theme_surface_color) {
      root.style.setProperty('--color-surface', config.theme_surface_color);
    }
    if (config.theme_font_family) {
      root.style.setProperty('--font-main', config.theme_font_family);
    }
    if (config.theme_font_size) {
      root.style.setProperty('--font-base-size', config.theme_font_size);
    }
  };

  const loadTheme = () => {
    getConfiguracionPublica().then(res => {
      const config = res.data;
      setTheme(config);
      localStorage.setItem('app-theme', JSON.stringify(config));
      applyTheme(config);
    }).catch(err => console.error('Error loading theme:', err));
  };

  const [colorMode, setColorMode] = useState('dark');

  useEffect(() => {
    loadTheme();
    // Load local color mode
    const storedMode = localStorage.getItem('app-color-mode');
    if (storedMode === 'light') {
      setColorMode('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(newMode);
    localStorage.setItem('app-color-mode', newMode);
    if (newMode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const changePrimaryColor = (color) => {
    // For local preview
    document.documentElement.style.setProperty('--color-primary', color);
    document.documentElement.style.setProperty('--color-primary-content', getContrast(color));
  };

  const updateTheme = (newConfig) => {
    setTheme(newConfig);
    localStorage.setItem('app-theme', JSON.stringify(newConfig));
    applyTheme(newConfig);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, colorMode, toggleColorMode, changePrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

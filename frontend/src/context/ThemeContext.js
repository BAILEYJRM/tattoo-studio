import React, { createContext, useEffect, useState, useCallback, useContext } from 'react';
import { getConfiguracion, getConfiguracionPublica } from '../api';
import { useAuth } from './AuthContext';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { token } = useAuth();
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('app-theme');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const getContrast = (hex) => {
    if (!hex) return '#ffffff';
    let h = hex.charAt(0) === '#' ? hex.substring(1, 7) : hex;
    let r = parseInt(h.substring(0, 2), 16);
    let g = parseInt(h.substring(2, 4), 16);
    let b = parseInt(h.substring(4, 6), 16);
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#111827' : '#ffffff';
  };

  const resetThemeStyles = useCallback(() => {
    const root = document.documentElement;
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-primary-content');
    root.style.removeProperty('--color-bg');
    root.style.removeProperty('--color-surface');
    root.style.removeProperty('--font-main');
    root.style.removeProperty('--font-base-size');
    root.removeAttribute('data-skin');
    localStorage.removeItem('app-theme');
    setTheme(null);
  }, []);

  const applyTheme = useCallback((config) => {
    if (!config) return;
    const root = document.documentElement;
    if (config.theme_primary_color) {
      if (config.theme_primary_color.toLowerCase() === '#d4af37') {
        root.setAttribute('data-skin', 'gold');
      } else {
        root.removeAttribute('data-skin');
      }
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
  }, []);

  const loadTheme = useCallback(() => {
    if (token) {
      getConfiguracion()
        .then(res => {
          const config = res.data;
          setTheme(config);
          localStorage.setItem('app-theme', JSON.stringify(config));
          applyTheme(config);
        })
        .catch(err => {
          console.warn('Falling back to local theme cache:', err);
          const stored = localStorage.getItem('app-theme');
          if (stored) {
            try { applyTheme(JSON.parse(stored)); } catch (e) {}
          }
        });
    } else {
      resetThemeStyles();
      getConfiguracionPublica()
        .then(res => {
          if (res.data && res.data.theme_primary_color) {
            setTheme(res.data);
            applyTheme(res.data);
          }
        })
        .catch(() => {});
    }
  }, [token, applyTheme, resetThemeStyles]);

  // Recargar/limpiar tema automáticamente al cambiar token (login/logout)
  useEffect(() => {
    loadTheme();
  }, [token, loadTheme]);

  const [colorMode, setColorMode] = useState('dark');

  useEffect(() => {
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
    if (color.toLowerCase() === '#d4af37') {
      document.documentElement.setAttribute('data-skin', 'gold');
    } else {
      document.documentElement.removeAttribute('data-skin');
    }
    document.documentElement.style.setProperty('--color-primary', color);
    document.documentElement.style.setProperty('--color-primary-content', getContrast(color));
  };

  const updateTheme = (newConfig) => {
    setTheme(newConfig);
    localStorage.setItem('app-theme', JSON.stringify(newConfig));
    applyTheme(newConfig);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, colorMode, toggleColorMode, changePrimaryColor, loadTheme, resetThemeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);


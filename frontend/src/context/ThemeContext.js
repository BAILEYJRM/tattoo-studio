import React, { createContext, useEffect, useState } from 'react';
import { getConfiguracionPublica } from '../api';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    getConfiguracionPublica().then(res => {
      const config = res.data;
      setTheme(config);

      const root = document.documentElement;
      
      if (config.theme_primary_color) {
        root.style.setProperty('--color-primary', config.theme_primary_color);
      }
      if (config.theme_bg_color) {
        root.style.setProperty('--color-bg', config.theme_bg_color);
      }
      if (config.theme_font_family) {
        root.style.setProperty('--font-main', config.theme_font_family);
      }
      if (config.theme_font_size) {
        root.style.setProperty('--font-base-size', config.theme_font_size);
      }
    }).catch(err => console.error('Error loading theme:', err));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

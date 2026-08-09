const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigo: {
          400: 'var(--color-primary)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'color-mix(in srgb, var(--color-primary) 80%, black)',
        },
        gray: {
          ...colors.neutral,
          950: 'color-mix(in srgb, var(--color-bg) 85%, black)',
          900: 'var(--color-bg)',
          800: 'var(--color-surface)',
          700: 'color-mix(in srgb, var(--color-surface) 85%, white)',
          600: 'color-mix(in srgb, var(--color-surface) 70%, white)',
        }
      },
      fontFamily: {
        sans: ['var(--font-main)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

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
        },
        gray: {
          900: 'var(--color-bg)',
        }
      },
      fontFamily: {
        sans: ['var(--font-main)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

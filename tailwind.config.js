/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8',
        },
        secondary: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        background: {
          primary: '#0f172a',
          secondary: '#1e293b',
          paper: '#334155',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e2e8f0',
          disabled: '#94a3b8',
        },
        error: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
        info: '#2563eb',
      },
    },
  },
  plugins: [],
} 
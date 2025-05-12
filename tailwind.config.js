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
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          disabled: '#64748b',
        },
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info: '#3b82f6',
      },
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090909',
          surface: '#151515',
          card: '#202020',
          elevated: '#292929',
          border: '#2a2a2a',
          borderSubtle: 'rgba(255, 255, 255, 0.08)',
          muted: '#737373',
          secondary: '#A3A3A3',
        },
        crimson: {
          50: '#fef2f2',
          100: '#fee2e2',
          400: '#f87171',
          500: '#EF2929',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          glow: 'rgba(239, 41, 41, 0.25)',
        },
        medical: {
          processed: '#10B981',
          pending: '#F59E0B',
          warning: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Malayalam', 'system-ui', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(239, 41, 41, 0.35)',
        'glow-red-lg': '0 0 45px -8px rgba(239, 41, 41, 0.45)',
        'card-dark': '0 12px 32px -8px rgba(0, 0, 0, 0.7)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(239, 41, 41, 0.18), transparent 70%)',
        'radial-glow-side': 'radial-gradient(circle at 100% 20%, rgba(185, 28, 28, 0.15), transparent 60%)',
        'crimson-gradient': 'linear-gradient(135deg, #EF2929 0%, #B91C1C 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(32, 32, 32, 0.9) 0%, rgba(21, 21, 21, 0.95) 100%)',
      }
    },
  },
  plugins: [],
}

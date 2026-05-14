/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          green:  '#10b981',
          amber:  '#f59e0b',
          rose:   '#f43f5e',
          violet: '#8b5cf6',
        },
        dark: {
          bg: {
            primary:   '#050816',
            secondary: '#0B1120',
            card:      '#111827',
            elevated:  '#1A2234',
            hover:     '#1E2A3E',
          },
          border: {
            DEFAULT: '#243041',
            hover:   '#3B82F6',
            accent:  '#0ea5e9',
          },
          text: {
            primary:   '#F3F4F6',
            secondary: '#CBD5E1',
            muted:     '#94A3B8',
            dim:       '#64748B',
          },
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease both',
        'fade-in':    'fadeIn 0.4s ease both',
        'slide-in':   'slideIn 0.35s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer:  { '0%': { opacity: 0.5 }, '50%': { opacity: 1 }, '100%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
}

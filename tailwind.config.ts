import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A56DB',
          dark: '#1E429F',
        },
        accent: {
          green: '#057A55',
          red: '#C81E1E',
          amber: '#92400E',
        },
        chart: {
          blue: '#3F83F8',
          slate: '#9CA3AF',
          green: '#31C48D',
        },
        background: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        text: {
          primary: '#111827',
          muted: '#6B7280',
        },
        error: '#C81E1E',
        success: '#057A55',
        focusRing: '#3F83F8',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

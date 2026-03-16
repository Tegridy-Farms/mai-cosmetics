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
          DEFAULT: '#C74B7C',
          dark: '#B83A6B',
        },
        'primary-tint': '#FDF2F8',
        accent: {
          pink: '#E8799E',
          green: '#059669',
          red: '#BE123C',
          amber: '#92400E',
        },
        chart: {
          gross: '#C74B7C',
          expenses: '#9D8B9E',
          net: '#10B981',
        },
        background: '#FFF8FA',
        surface: '#FFFFFF',
        border: '#F5E6EC',
        'border-muted': '#E8D4DD',
        skeleton: '#E5E7EB',
        text: {
          primary: '#111827',
          muted: '#6B7280',
        },
        error: '#BE123C',
        success: '#059669',
        focusRing: '#E8799E',
      },
      fontFamily: {
        heebo: ['var(--font-heebo)', 'Heebo', 'sans-serif'],
        sans: ['var(--font-heebo)', 'Heebo', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

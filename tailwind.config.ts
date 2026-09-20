import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // High-vibrancy agro-tech emerald palette
        leaf: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Electric Emerald
          600: '#059669', // Rich Jade
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c1b',
        },
        obsidian: {
          50: '#f6f8f6',
          100: '#e8ede8',
          200: '#c5d1c6',
          300: '#9cb09e',
          400: '#6a846d',
          500: '#4c644f',
          600: '#384d3b',
          700: '#2c3c2e',
          800: '#1a261c',
          900: '#0d1710',
          950: '#040c07',
        },
        cyber: {
          green: '#00ff9d',
          mint: '#00f5a0',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          amber: '#fbbf24',
          gold: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
        },
        cream: {
          50: '#f0fdf4',
          100: '#e6f9ed',
          200: '#c8eed8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(6, 78, 59, 0.08)',
        card: '0 4px 20px -2px rgba(6, 78, 59, 0.06), 0 1px 3px rgba(0,0,0,0.04)',
        cardHover: '0 20px 40px -12px rgba(6, 78, 59, 0.16), 0 0 25px -5px rgba(16, 185, 129, 0.25)',
        glow: '0 0 25px -5px rgba(16, 185, 129, 0.45)',
        glowLg: '0 0 50px -10px rgba(16, 185, 129, 0.6)',
        neonCyan: '0 0 25px -5px rgba(6, 182, 212, 0.5)',
        neonAmber: '0 0 25px -5px rgba(245, 158, 11, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'grow': 'grow 0.3s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        grow: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'leaf-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;

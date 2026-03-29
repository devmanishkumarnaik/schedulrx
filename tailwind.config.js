/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs':  '375px',
      'sm':  '640px',
      'md':  '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        navy: {
          50:  '#eef1f9',
          100: '#d5dcf0',
          200: '#aab8e1',
          300: '#7e95d2',
          400: '#5271c3',
          500: '#3a5ab4',
          600: '#2d4696',
          700: '#1e3178',
          800: '#141f4f',
          900: '#0a0f1e',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        display: ["'Sora'", 'sans-serif'],
        body:    ["'Plus Jakarta Sans'", 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: { from:{ opacity:'0', transform:'translateY(14px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeIn: { from:{ opacity:'0' }, to:{ opacity:'1' } },
      },
      minHeight: { '44': '44px', '48': '48px' },
    },
  },
  plugins: [],
};

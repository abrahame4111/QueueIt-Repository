module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        paper: '#0A0A0A',
        surface: '#121212',
        primary: {
          DEFAULT: '#00F0FF',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#FF00FF',
          foreground: '#FFFFFF',
        },
        accent: {
          success: '#39FF14',
          warning: '#FFD700',
          error: '#FF003C',
        },
        neutral: {
          100: '#FFFFFF',
          200: '#E5E5E5',
          500: '#737373',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 240, 255, 0.5)',
        'glow-secondary': '0 0 20px rgba(255, 0, 255, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
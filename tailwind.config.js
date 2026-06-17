/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2D6A4F',
          600: '#1B5E3B',
          700: '#14532D',
          800: '#166534',
          900: '#14532d',
        },
        cream: {
          50: '#FFFEF7',
          100: '#FEFAE0',
          200: '#FDF6D1',
          300: '#FAF0B5',
        },
        earth: {
          400: '#D4A373',
          500: '#BC6C25',
          600: '#9B5B20',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(45, 106, 79, 0.15)',
        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'leaf-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 Q45 25 30 55 Q15 25 30 5' fill='%232D6A4F' fill-opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(45,106,79,0.4)' },
          '100%': { boxShadow: '0 0 0 12px rgba(45,106,79,0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'bounce-soft': 'bounce-soft 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.5s infinite',
      },
    },
  },
  plugins: [],
};

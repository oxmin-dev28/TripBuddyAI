/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F8FC',
        surface: '#F5F8FC',
        primary: '#1E2A44',
        ink: '#141D2D',
        night: '#0E141E',
      },
      borderRadius: {
        '4xl': '24px',
      },
      boxShadow: {
        card: '0px 10px 30px rgba(20, 29, 45, 0.18)',
        soft: '0px 4px 12px rgba(30, 42, 68, 0.16)',
      },
    },
  },
  plugins: [],
};

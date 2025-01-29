/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#000322',
        midnight: '#090A1A',
        sunflower: '#FFD012',
        'dark-100': '#979BB0',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        russo: ['Russo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

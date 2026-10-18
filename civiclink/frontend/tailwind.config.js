/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        civic: {
          bg: '#0B0F1A',
          card: '#131926',
          terracotta: '#E8714A',
          sage: '#7BAF7B',
          cream: '#F5EDD6',
          gold: '#C9A84C',
        },
      },
    },
  },
  plugins: [],
};
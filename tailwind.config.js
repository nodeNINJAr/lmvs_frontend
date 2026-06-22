/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#006a4e', dark: '#00513b' },
        accent: '#f42a41',
      },
    },
  },
  plugins: [],
}

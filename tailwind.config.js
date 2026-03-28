/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        macaron: {
          pink: '#FFB5C2',
          peach: '#FFCBA4',
          yellow: '#FFE5A0',
          mint: '#B5EAD7',
          blue: '#A0D2DB',
          lavender: '#C9B1FF',
          lilac: '#E8A0BF',
          sky: '#89CFF0',
          coral: '#FF9AA2',
          sage: '#B5D99C',
        }
      }
    },
  },
  plugins: [],
}

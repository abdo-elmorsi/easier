/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
const colors = require('tailwindcss/colors')

module.exports = withMT({
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],   // Arabic font
        english: ['Inter', 'sans-serif'],  // English font
      },
      colors: {
        primary: 'var(--primary)',
        hoverPrimary: 'var(--hoverPrimary)',
        secondary: 'var(--secondary)',
        // Tailwind default color palette extensions
        slate: colors.slate,
        sky: colors.sky,
        stone: colors.stone,
        neutral: colors.neutral,
        gray: colors.gray,
      }
    },
  },
  plugins: [
  ],
});

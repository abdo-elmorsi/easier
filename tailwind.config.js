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
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "3rem",
          "2xl": "4rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1440px",
        },
      },
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
    require('tailwindcss-animated')
  ],
});

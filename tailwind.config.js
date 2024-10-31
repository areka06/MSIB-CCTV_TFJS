/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customRed: '#c0392b',
      },
      keyframes: {
        fadeInBlur: {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
      },
      animation: {
        fadeInBlur: 'fadeInBlur 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}

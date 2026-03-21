/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        glow: "0 10px 35px rgba(13, 84, 72, 0.2)"
      }
    }
  },
  plugins: []
};

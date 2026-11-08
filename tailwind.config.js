/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0b0b0f",
        surface: "#17171d",
        accent: "#e50914",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#060d1a", 800: "#0a1428", 700: "#0f1f3d" },
        teal: { 400: "#22d3ee", 600: "#0891b2" },
      },
    },
  },
  plugins: [],
};

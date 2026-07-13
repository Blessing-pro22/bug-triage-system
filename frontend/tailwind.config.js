/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",
        panel: "#12181F",
        line: "#212A33",
        signal: {
          critical: "#FF4D4F",
          major: "#FF9F43",
          minor: "#F4D35E",
          trivial: "#5B6672",
        },
        accent: "#2DD4BF",
        paper: "#E7ECF0",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

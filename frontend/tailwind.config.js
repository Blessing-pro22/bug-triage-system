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
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out 0.2s both',
        'fade-out': 'fade-out 0.5s ease-in 2s both',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-in-up': {
          'from': { 
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-out': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

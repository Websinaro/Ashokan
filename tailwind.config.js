/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F6F7F5",
        "paper-dim": "#ECEEEA",
        ink: "#1C2333",
        "ink-soft": "#4A5268",
        indigo: {
          DEFAULT: "#2E3A59",
          light: "#3E4C74",
          dark: "#212A42",
        },
        present: {
          DEFAULT: "#2F8F7A",
          light: "#E4F3EF",
        },
        absent: {
          DEFAULT: "#D98E3F",
          light: "#FBEEE0",
        },
        line: "#E2E4E0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 0 rgba(28,35,51,0.06), 0 8px 24px -12px rgba(28,35,51,0.18)",
      },
      borderRadius: {
        card: "14px",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(46,58,89,0.35)" },
          "70%": { boxShadow: "0 0 0 8px rgba(46,58,89,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(46,58,89,0)" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

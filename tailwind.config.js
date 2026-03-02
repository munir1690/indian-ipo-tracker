/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          dark: 'rgb(var(--finance-dark) / <alpha-value>)',
          surface: 'rgb(var(--finance-surface) / <alpha-value>)',
          card: 'rgb(var(--finance-card) / <alpha-value>)',
          border: 'rgb(var(--finance-border) / <alpha-value>)',
          text: 'rgb(var(--finance-text) / <alpha-value>)',
          textMuted: 'rgb(var(--finance-text-muted) / <alpha-value>)',
          green: 'rgb(var(--finance-green) / <alpha-value>)',
          red: 'rgb(var(--finance-red) / <alpha-value>)',
          accent: 'rgb(var(--finance-accent) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}

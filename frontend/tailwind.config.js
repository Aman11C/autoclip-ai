/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#090A12",
        secondary: "#111321",
        card: "#171A2B",
        border: "#292D42",
        electric: {
          DEFAULT: "#343BFF",
          hover: "#2830E8",
          light: "#555CFF",
          glow: "rgba(52, 59, 255, 0.4)",
        },
        neon: {
          DEFAULT: "#E8FF36",
          hover: "#D6ED28",
          glow: "rgba(232, 255, 54, 0.35)",
        },
        surface: {
          DEFAULT: "#111321",
          elevated: "#171A2B",
          highlight: "#1F233A",
        },
        text: {
          primary: "#F7F7FA",
          muted: "#9699AD",
          subtle: "#6B6E82",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'equalizer': 'equalizer 1s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(52, 59, 255, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(52, 59, 255, 0.75))' },
        },
        equalizer: {
          '0%': { height: '20%' },
          '50%': { height: '90%' },
          '100%': { height: '40%' },
        }
      }
    },
  },
  plugins: [],
};

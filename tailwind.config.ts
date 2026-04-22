import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta LexIA — dark editorial com acento dourado
        ink: {
          950: "#080A0F",
          900: "#0D1117",
          800: "#161B27",
          700: "#1E2535",
          600: "#29334A",
          500: "#3A4560",
          400: "#5B6882",
          300: "#8A97B0",
          200: "#B8C2D4",
          100: "#E2E7F0",
          50:  "#F4F6FA",
        },
        gold: {
          500: "#C9A84C",
          400: "#D4B96A",
          300: "#DFD08E",
          200: "#EDE5BC",
          100: "#F7F2E0",
        },
        danger: "#E05252",
        success: "#4CAF82",
        warning: "#E09B52",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

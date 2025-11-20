/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Red)
        primaryStart: "#FF0000",
        primaryMid: "#E60000",
        primaryEnd: "#CC0000",

        // Secondary Brand Colors (Orange)
        secondary: {
          light: "#FFB347",
          DEFAULT: "#FF8C42",
          dark: "#FF6B35",
        },

        // Accent Colors (Yellow/Gold)
        accent: {
          light: "#FFD700",
          DEFAULT: "#FFC107",
          dark: "#FF9800",
        },

        // Construction Blue (Branded Blues)
        construction: {
          light: "#5DADE2",
          DEFAULT: "#3498DB",
          dark: "#2874A6",
          navy: "#1B4F72",
        },

        // ⭐ NEW Neutral Colors (Slate)
        slate: {
          light: "#334155",      // slate-700
          DEFAULT: "#1E293B",    // slate-800
          dark: "#0F172A",       // slate-900
        },

        // ⭐ NEW Construction Sand/Cement Tones
        sand: {
          light: "#ECE2D0",
          DEFAULT: "#D6C5A3",
          dark: "#B8A980",
        },

        // ⭐ NEW Teal (for accents & info)
        teal: {
          light: "#2DD4BF",
          DEFAULT: "#14B8A6",
          dark: "#0D9488",
        },

        // Neutral Grayscale
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        // Status Colors
        success: {
          light: "#86EFAC",
          DEFAULT: "#22C55E",
          dark: "#16A34A",
        },
        warning: {
          light: "#FDE047",
          DEFAULT: "#FACC15",
          dark: "#EAB308",
        },
        danger: {
          light: "#FCA5A5",
          DEFAULT: "#EF4444",
          dark: "#DC2626",
        },
        info: {
          light: "#93C5FD",
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
        },

        // Background Colors
        background: {
          primary: "#FFFFFF",
          secondary: "#F8F9FA",
          tertiary: "#F3F4F6",
        },
      },
    },
  },
  plugins: [],
};

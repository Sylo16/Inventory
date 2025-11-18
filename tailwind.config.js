/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (Red - from background)
        primaryStart: "#FF0000",     // Bright Red (brand primary)
        primaryMid: "#E60000",       // Deep Red
        primaryEnd: "#CC0000",       // Dark Red
        
        // Secondary Brand Colors (Orange - from logo text)
        secondary: {
          light: "#FFB347",          // Light Orange
          DEFAULT: "#FF8C42",        // Orange (logo text)
          dark: "#FF6B35",           // Deep Orange
        },
        
        // Accent Colors (Yellow/Gold - from character & text)
        accent: {
          light: "#FFD700",          // Gold
          DEFAULT: "#FFC107",        // Amber/Yellow
          dark: "#FF9800",           // Dark Amber
        },
        
        // Construction Blue (from overalls & helmet)
        construction: {
          light: "#5DADE2",          // Light Blue
          DEFAULT: "#3498DB",        // Blue (overalls)
          dark: "#2874A6",           // Dark Blue (helmet stripe)
          navy: "#1B4F72",           // Navy Blue
        },
        
        // Neutral Colors for UI
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
        
        // Status Colors (Enhanced for clarity)
        success: {
          light: "#86EFAC",          // Light Green
          DEFAULT: "#22C55E",        // Green
          dark: "#16A34A",           // Dark Green
        },
        warning: {
          light: "#FDE047",          // Light Yellow
          DEFAULT: "#FACC15",        // Yellow
          dark: "#EAB308",           // Dark Yellow
        },
        danger: {
          light: "#FCA5A5",          // Light Red
          DEFAULT: "#EF4444",        // Red
          dark: "#DC2626",           // Dark Red
        },
        info: {
          light: "#93C5FD",          // Light Blue
          DEFAULT: "#3B82F6",        // Blue
          dark: "#2563EB",           // Dark Blue
        },
        
        // Background Colors
        background: {
          primary: "#FFFFFF",        // White
          secondary: "#F8F9FA",      // Light Gray
          tertiary: "#F3F4F6",       // Lighter Gray
        },
      },
    },
  },
  plugins: [],
};

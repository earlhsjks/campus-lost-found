/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF', // Pure White
        foreground: '#111827', // Gray 900
        primary: {
          DEFAULT: '#3B82F6', // Blue 500
          hover: '#2563EB',   // Blue 600
        },
        secondary: '#10B981', // Emerald 500
        accent: '#F59E0B',    // Amber 500
        muted: '#F3F4F6',     // Gray 100
        border: '#E5E7EB',    // Gray 200
      },
      boxShadow: {
        // We override all default shadows to none to strictly enforce the flat design rule.
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      }
    },
  },
  plugins: [],
}
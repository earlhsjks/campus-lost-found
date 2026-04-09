/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#FAFAFA',
        foreground: '#0F172A',
        muted: '#F1F5F9',
        'muted-foreground': '#64748B',
        accent: '#0052FF',
        'accent-secondary': '#4D7CFF',
        'accent-foreground': '#FFFFFF',
        border: '#E2E8F0',
        card: '#FFFFFF',
        ring: '#0052FF',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 15px rgba(0,0,0,0.08)',
        xl: '0 20px 25px rgba(0,0,0,0.1)',
        'accent': '0 4px 14px rgba(0,82,255,0.25)',
        'accent-lg': '0 8px 24px rgba(0,82,255,0.35)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(to right, #0052FF, #4D7CFF)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'pulse-accent': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.3)' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(28px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 60s linear infinite',
        'pulse-accent': 'pulse-accent 2s infinite',
        'fade-up': 'fade-up 0.7s ease-out',
      },
    },
  },
  plugins: [],
}
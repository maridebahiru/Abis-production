import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefdf8',
          100: '#fcf8ea',
          200: '#f7edcb',
          300: '#f0dc9e',
          400: '#e5c46b',
          500: '#d4af37', // Luxury Primary Gold
          600: '#c5a059', // Brushed Deep Gold
          700: '#9e7939',
          800: '#805f32',
          900: '#6a4e2d',
          950: '#3d2b15',
        },
        dark: {
          bg: '#08080a',
          surface: '#111115',
          card: '#16161c',
          border: '#272732',
          hover: '#1d1d26',
        }
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA771C 100%)',
        'gold-subtle': 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(10, 10, 12, 0) 100%)',
        'dark-glass': 'linear-gradient(135deg, rgba(22, 22, 28, 0.7) 0%, rgba(14, 14, 18, 0.8) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'gold-sm': '0 0 10px -2px rgba(212, 175, 55, 0.2)',
      }
    },
  },
  plugins: [],
};

export default config;

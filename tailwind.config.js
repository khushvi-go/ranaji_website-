/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stone': '#CDC8B8',
        'gold': '#DEA044',
        'copper': '#BF8250',
        'crimson': '#9D473A',
        'lake': '#416A81',
        'cream': '#F5EFE0',
        'night': '#1C1208',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Playfair Display SC"', 'serif'],
        body: ['Raleway', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #DEA044, #BF8250)',
        'dark-gradient': 'linear-gradient(180deg, #1C1208, #2C1A0A)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'goldShimmer 3s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee 30s linear infinite reverse',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'gold': '0 10px 40px rgba(222, 160, 68, 0.3)',
        'gold-lg': '0 20px 60px rgba(222, 160, 68, 0.4)',
        'inner-gold': 'inset 0 0 30px rgba(222, 160, 68, 0.1)',
      },
    },
  },
  plugins: [],
}

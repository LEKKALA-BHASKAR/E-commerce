/** @type {import('tailwindcss').Config} */
// Sahara Groceries — warm cream + terracotta palette.
// Token names (`gold`, `paper`, `ink`) are preserved so existing utility
// classes throughout the codebase remap cleanly to the new theme.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1320px' },
    },
    extend: {
      colors: {
        // Warm dark text tones (was cool slate)
        ink: {
          DEFAULT: '#1B1410',
          50: '#FBF6EE',
          100: '#F1E7D6',
          200: '#D9C8AE',
          300: '#A89479',
          400: '#7A6650',
          500: '#544334',
          600: '#3A2D22',
          700: '#291F17',
          800: '#1B1410',
          900: '#0E0905',
        },
        // Cream surfaces
        paper: '#FBF4E8',
        cream: {
          DEFAULT: '#FBF4E8',
          50: '#FFFBF4',
          100: '#FBF4E8',
          200: '#F4E8D2',
          300: '#EBD9B6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FBF4E8',
          deep: '#F4E8D2',
        },
        // Terracotta accent (was amber gold)
        gold: {
          DEFAULT: '#D97706',
          50: '#FDF1DF',
          100: '#F9DDB4',
          200: '#F4C283',
          300: '#EFA152',
          400: '#E58825',
          500: '#D97706',
          600: '#B45309',
          700: '#8C3E07',
        },
        terracotta: {
          DEFAULT: '#D97706',
          dark: '#B45309',
          soft: '#F9DDB4',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 10px 30px -12px rgba(217,119,6,0.45)',
        soft: '0 18px 40px -28px rgba(40,25,10,0.25)',
        card: '0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 24px -16px rgba(40,25,10,0.18)',
      },
      backgroundImage: {
        'radial-warm': 'radial-gradient(circle at 20% 0%, rgba(217,119,6,0.10), transparent 55%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F7F5',
          100: '#C2EFEA',
          200: '#8BE1D6',
          300: '#52CFC0',
          400: '#26BAAA',
          500: '#0AA79D', // Primary brand cyan/teal
          600: '#08867E',
          700: '#066660',
          800: '#054844',
          900: '#032D2B',
        },
        navy: {
          800: '#14234B',
          900: '#0D1B3D', // Deep navy
          950: '#070F23',
        },
        surface: {
          light: '#F8FAFC',
          card: '#FFFFFF',
          dark: '#0D1B3D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(13, 27, 61, 0.08)',
        'teal-glow': '0 0 25px rgba(10, 167, 157, 0.25)',
      }
    },
  },
  plugins: [],
}

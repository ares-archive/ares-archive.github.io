/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          azure: '#007BFF',
          red: '#DC3545',
          green: '#28A745',
          dark: '#050608',
          card: '#0d0f14',
          border: '#1c1f26'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: [],
};

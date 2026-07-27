/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1512',
        paper: '#FFFFFF',
        cream: '#FBF7F3',
        gold: '#B08A3E',
        'gold-light': '#E8D9B8',
        magenta: '#9E1858',
        'magenta-light': '#F4DCE6',
        pink: '#EFC3D2',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

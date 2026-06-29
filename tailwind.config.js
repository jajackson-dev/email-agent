/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // OpsThreads brand palette
        primary: {
          DEFAULT: '#3B6D11',
          dark: '#2F580D',
          light: '#4E8C1A',
        },
        cream: '#FAFAF7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          hover: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#ffffff',
          hover: '#e6e6e6',
        },
        accent: {
          DEFAULT: '#666666',
          hover: '#808080',
        },
      },
      backgroundColor: {
        'card': 'rgba(255, 255, 255, 0.05)',
        'card-hover': 'rgba(255, 255, 255, 0.1)',
      },
      borderColor: {
        'default': 'rgba(255, 255, 255, 0.1)',
      },
      textColor: {
        'default': '#ffffff',
        'muted': 'rgba(255, 255, 255, 0.6)',
      },
    },
  },
  plugins: [],
}


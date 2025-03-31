/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000', // Black
        secondary: '#89CFF0', // Baby blue
        accent: '#89CFF0', // Baby blue
        highlight: '#89CFF0', // Baby blue for consistent highlighting
        background: '#ffffff', // White
        text: '#333333', // Dark gray for regular text
        footer: {
          bg: '#000000', // Black
          text: '#ffffff', // White
          hover: '#89CFF0', // Baby blue
        }
      },
    },
  },
  plugins: [],
}; 
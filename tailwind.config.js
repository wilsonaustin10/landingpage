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
        primary: '#0e0d35', // Dark navy blue
        secondary: '#b64018', // Deep rust/orange
        accent: '#f57e5b', // Light coral/orange
        background: '#ffffff',
        text: '#333333',
      },
    },
  },
  plugins: [],
}; 
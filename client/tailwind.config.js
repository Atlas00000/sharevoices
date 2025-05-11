module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(221,83%,53%)', // SDG blue
        sdg6: '#059669', // Example SDG color
      },
    },
  },
  plugins: [],
}; 
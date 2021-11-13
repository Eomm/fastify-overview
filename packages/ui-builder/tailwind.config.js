const colors = require('tailwindcss/colors');
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gray: colors.blueGray,
    },
    extend: {},
  },
  variants: {
    extend: {
      outline: ['hover', 'active'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

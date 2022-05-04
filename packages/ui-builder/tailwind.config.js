const colors = require('tailwindcss/colors')
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gray: colors.blueGray,
      sky: colors.sky,
      lime: colors.lime,
      rose: colors.rose
    },
    extend: {}
  },
  variants: {
    extend: {
      outline: ['hover', 'active'],
      margin: ['last']
    }
  },
  plugins: [require('@tailwindcss/forms')]
}

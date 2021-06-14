const colors = require('tailwindcss/colors')

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gray: colors.coolGray,
      green: colors.lime,
      red: colors.red,
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

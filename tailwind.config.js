/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
      patterns: {
        opacities: {
            100: "1",
            80: ".80",
            60: ".60",
            40: ".40",
            20: ".20",
            10: ".10",
            5: ".05",
        },
        sizes: {
            1: "0.25rem",
            2: "0.5rem",
            4: "1rem",
            6: "1.5rem",
            8: "2rem",
            16: "4rem",
            20: "5rem",
            24: "6rem",
            32: "8rem",
        }
    },
    extend: {
      transitionProperty: {
          'width': 'width'
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '2/1': '2 / 1',
        '16/9': '16 / 9',
        '9/16': '9 / 16',
        '16/12': '16 / 12',
        '12/16': '12 / 16',
        '21/9': '21 / 9',
        '32/9': '32 / 9',
        '48/9': '48 / 9'
      },
    },
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#ffffff',
      'light-slate-gray': '#82a9ba',
      'whitesmoke': '#dcdfe0',
      'light-blue': '#c0d4dd',
      'peach-puff': '#F5CBA7',
      'goldenrod': '#ffb442',
      'slategray-blue': '#4E6D81',
      'antiquewhite': '#fae7d6',
      'purple': '#3f3cbb',
      'midnight': '#121063',
      'metal': '#565584',
      'tahiti': '#3ab7bf',
      'dimgray-green': '#495E6D',
      'steelblue': '#477082',
      'slategray': '#688088',
      'steel-slategray' : '#3E7385',
      'red-pure': '#FF0000',
      'silver': '#b8bfc1',
      'light-steelblue': '#136fa5',
      'bubble-gum': '#ff77e9',
      'bermuda': '#78dcca',
      'black': '#0d0d0d',
      'bright-pure-black': '#090909',
      'pure-black': '#000000',
      'gold': '#e6cb00',
      'sky' : '#004dc9',
      'yellow': '#eaff47',
      'white-sky': '#ecfeff',
      'gray': '#a59e92',
      'white-gray' : '#dfdcd8',
      'mid-gray': '#cdc8c1',
      'dark-slate-gray': '#2e2e2e',
      'dark-slate-gray-green': '#385142',
      'light-slate-gray-green': '#547862',
      'dark-sea-green': '#87ab95',
      'dimgray': '#707070',
      'mid-slate-gray': '#588092',
      'light-black-gray': '#454545',
      'mid-black-gray': '#363636',
      'black-gray' : '#1c1c1c',
      'medium-black' : '#212121',
      'red': '#f57575',
      'red-purple': '#f14646',
      'red-light': '#ffe1e1',
      'red-pink': '#fecdcd',
      'white-blue': '#2eacef',
      'blue': '#004dc9',
      'green': '#00ff00',
      'mediumseagreen': '#00b368',
      'aquamarine' : '#74f6b7'
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('tailwindcss-bg-patterns'),
    require('tailwindcss-3d')({ legacy: true }),
  ],
  darkMode: 'class',
};
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        first: '#fe1650',
        second: '#f94756',
        third: '#f5725c',
        fourth: '#f5725c',
        fifth: '#dfa25e',
        firstTrans: 'rgba(254, 22, 80, 0.75)',
        secondTrans: 'rgba(249, 71, 86, 0.75)',
        thirdTrans: 'rgba(245, 114, 92, 0.75)',
        fourthTrans: 'rgba(245, 114, 92, 0.75)',
        fifthTrans: 'rgba(223, 162, 94, 0.75)',
        secondary: '#111111',
      },
      screens: {
        '2xl': {'max': '1535px'},
        'xl': {'min': '1279px'},
        'lg': {'max': '1023px'},
        'lgo': {'min': '1023px'},
        'md': {'max': '767px'},
        'sm': {'max': '639px'},
      }
    },
  },
  plugins: [require('daisyui')],
};
export default config;

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
        secondary: '#111111'
      }
    },
  },
  plugins: [],
};
export default config;

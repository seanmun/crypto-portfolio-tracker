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
        bitcoin: '#f7931a',
        ethereum: '#627eea',
        pulsechain: '#ff006b',
        base: '#0052ff',
        solana: '#9945ff',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-gray-600',
    'text-white',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rebeccapurple',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

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
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'nav': '1230px',  // Custom breakpoint for navigation
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: 'rebeccapurple',
      },
      keyframes: {
        'slight-wobble': {
          '0%, 100%': { transform: 'rotate(-.5deg)' },
          '50%': { transform: 'rotate(.5deg)' },
        },
      },
      animation: {
        'slight-wobble': 'slight-wobble 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

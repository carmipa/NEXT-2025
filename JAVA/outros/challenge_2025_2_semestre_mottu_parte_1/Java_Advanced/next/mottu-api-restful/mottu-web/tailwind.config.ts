import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'mottu-dark': '#007A1F',
        'mottu-default': '#009C2C',
        'mottu-light': '#00C23A',
      },
      backgroundImage: {
        'mottu-gradient': 'linear-gradient(45deg, #007A1F 0%, #008A25 20%, #009C2C 50%, #00B033 80%, #00C23A 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config






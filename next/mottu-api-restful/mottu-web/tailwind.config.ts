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
        // Paleta suave para cards de relatórios
        'card-yellow': '#FFF9DB',
        'card-yellow-border': '#FDE68A',
        'card-blue': '#EFF6FF',
        'card-blue-border': '#93C5FD',
        'card-orange': '#FFF7ED',
        'card-orange-border': '#FDBA74',
        'card-amber': '#FFFBEB',
        'card-amber-border': '#FCD34D',
        'card-purple': '#F5F3FF',
        'card-purple-border': '#C4B5FD',
        'card-emerald': '#ECFDF5',
        'card-emerald-border': '#6EE7B7',
        'card-fuchsia': '#FDF4FF',
        'card-fuchsia-border': '#F0ABFC',
        'card-green': '#ECFDF5',
        'card-green-border': '#86EFAC',
        'card-teal': '#F0FDFA',
        'card-teal-border': '#5EEAD4',
        'card-pink': '#FDF2F8',
        'card-pink-border': '#F9A8D4',
        'card-violet': '#F5F3FF',
        'card-violet-border': '#A78BFA',
        'card-gray': '#F9FAFB',
        'card-gray-border': '#E5E7EB',
      },
      backgroundImage: {
        'mottu-gradient': 'linear-gradient(45deg, #007A1F 0%, #008A25 20%, #009C2C 50%, #00B033 80%, #00C23A 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config



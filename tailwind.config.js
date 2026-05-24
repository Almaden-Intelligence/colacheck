/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        navy: '#0B1929',
        'navy-mid': '#122238',
        'navy-light': '#1C3550',
        steel: '#2E4D6B',
        sky: '#4A90B8',
        'sky-light': '#6BAED6',
        ice: '#E8F2F9',
        white: '#FFFFFF',
        slate: '#94A3B8',
        'slate-light': '#CBD5E1',
        pass: '#16A34A',
        'pass-bg': '#F0FDF4',
        warn: '#D97706',
        'warn-bg': '#FFFBEB',
        alert: '#DC2626',
        'alert-bg': '#FEF2F2',
        accent: '#F59E0B',
      },
    },
  },
  plugins: [],
}

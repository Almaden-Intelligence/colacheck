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

        canvas: '#F6F9FC',
        card: '#FFFFFF',
        rule: '#E1E9F1',
        'rule-soft': '#EDF3F8',

        'ink-mid': '#4A6072',
        'ink-soft': '#8598A8',

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
      boxShadow: {
        'lift-1': '0 1px 2px rgba(11,25,41,.05), 0 4px 12px -4px rgba(11,25,41,.08)',
        'lift-2': '0 2px 4px rgba(11,25,41,.05), 0 14px 32px -12px rgba(11,25,41,.16)',
        'lift-3': '0 4px 8px rgba(11,25,41,.06), 0 28px 56px -20px rgba(11,25,41,.24)',
        'lift-dark': '0 8px 20px rgba(0,0,0,.28), 0 32px 64px -24px rgba(0,0,0,.5)',
      },
      transitionTimingFunction: {
        lift: 'cubic-bezier(.2,.7,.3,1)',
      },
    },
  },
  plugins: [],
}

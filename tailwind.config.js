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
        label: ['var(--font-label)'],
      },
      colors: {
        // gradient stops
        g1: '#0B1D3A',
        g2: '#1E3A73',
        g3: '#4A4FA8',
        g4: '#8A5BC4',
        g5: '#D9A98A',
        sand: '#F3C9A4',

        // brand
        brand: '#4A4FA8',
        'brand-2': '#5F55BE',
        tint: '#F2F1FB',
        line: '#DFDCF2',

        // surfaces
        ground: '#FAF9FB',
        card: '#FFFFFF',
        rule: '#E9E7F0',
        'rule-soft': '#F3F1F7',

        // text
        ink: '#191826',
        'ink-mid': '#54516A',
        'ink-soft': '#8A87A0',

        // paper (specimen)
        paper: '#FBF6EC',
        'paper-2': '#F3EBDB',
        'paper-3': '#EDE2CE',
        'paper-ink': '#332A1E',
        'paper-wine': '#4A1F2B',
        'paper-rule': 'rgba(120,95,60,.3)',

        // status
        pass: '#2F7A57',
        'pass-bg': '#EFF7F2',
        review: '#B0770F',
        'review-bg': '#FCF5E8',
        fail: '#C4432A',
        'fail-bg': '#FCF0ED',
      },
      boxShadow: {
        'e1': '0 1px 2px rgba(25,24,38,.05), 0 4px 12px -4px rgba(25,24,38,.07)',
        'e2': '0 2px 5px rgba(25,24,38,.05), 0 16px 34px -14px rgba(25,24,38,.16)',
        'e3': '0 5px 10px rgba(25,24,38,.06), 0 30px 60px -22px rgba(25,24,38,.24)',
        'plate': '0 24px 70px -20px rgba(0,0,0,.5)',
        'pill': '0 4px 14px rgba(40,30,20,.34)',
      },
      transitionTimingFunction: {
        lift: 'cubic-bezier(.2,.7,.3,1)',
      },
    },
  },
  plugins: [],
}

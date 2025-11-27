/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Power Platform / Fluent UI colors
        primary: {
          50: '#f3f2f1',
          100: '#edebe9',
          200: '#e1dfdd',
          300: '#d2d0ce',
          400: '#c8c6c4',
          500: '#a19f9d',
          600: '#8a8886',
          700: '#605e5c',
          800: '#3b3a39',
          900: '#323130',
        },
        // Semantic colors for status
        success: '#107C10',
        warning: '#FFB900',
        error: '#D13438',
        info: '#0078D4',
        // Verification result colors
        genuine: '#107C10',
        inconclusive: '#CA5010',
        false: '#D13438',
        unable: '#605E5C',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1.6px 3.6px 0 rgba(0, 0, 0, 0.132), 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.108)',
      },
    },
  },
  plugins: [],
}

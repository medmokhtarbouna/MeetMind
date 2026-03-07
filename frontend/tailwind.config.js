/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      colors: {
        body: 'var(--bg-body)',
        surface: 'var(--bg-surface)',
      },
      boxShadow: {
        soft: '0 4px 10px rgba(15,23,42,0.06)',
        card: '0 18px 45px rgba(15,23,42,0.08)',
      },
      borderRadius: {
        mdx: '12px',
        lgx: '16px',
      },
    },
  },
  plugins: [],
}


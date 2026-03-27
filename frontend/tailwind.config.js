/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: '#0a0b0d',
        surface: '#111318',
        surfaceHover: '#181c24',
        border: '#1e2330',
        borderLight: '#2a3040',
        accent: '#f5a623',
        accentHover: '#e09010',
        accentDim: '#f5a62320',
        muted: '#6b7280',
        textPrimary: '#f0f2f5',
        textSecondary: '#9aa3b2',
        success: '#22c55e',
        danger: '#ef4444',
        info: '#3b82f6',
        push: '#f97316',
        pull: '#8b5cf6',
        legs: '#06b6d4',
        core: '#f59e0b',
        cardio: '#ef4444',
        mobility: '#10b981',
        skill: '#ec4899',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

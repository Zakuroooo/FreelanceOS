import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:           '#08080F',
        surface:      '#0F0F1A',
        'surface-2':  '#161625',
        border:       'rgba(255,255,255,0.07)',
        'border-hover':'rgba(255,255,255,0.14)',
        'text-primary':   '#F0EEF8',
        'text-secondary': '#9B97B2',
        'text-muted':     '#5C5878',
        accent:           '#FF2D2D',
        'accent-dim':     'rgba(255,45,45,0.12)',
        'accent-border':  'rgba(255,45,45,0.25)',
        success:          '#00C9A7',
        warning:          '#F59E0B',
        error:            '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['76px', { lineHeight: '1.1', fontWeight: '700' }],
        'heading':  ['48px', { lineHeight: '1.2', fontWeight: '600' }],
        'subhead':  ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'body':     ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'caption':  ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'badge':    ['11px', { lineHeight: '1.0', fontWeight: '600' }],
      },
      borderRadius: {
        'card': '16px',
        'btn':  '8px',
        'pill': '9999px',
      },
      spacing: {
        'section': '100px',
        'section-sm': '64px',
      },
      animation: {
        'marquee':         'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'float-bob':       'float-bob 3s ease-in-out infinite',
        'float-chaos':     'float-chaos 4s ease-in-out infinite',
        'fly-right':       'fly-right 1.5s ease-out infinite',
        'float-up':        'float-up 2s ease-out infinite',
        'pin-bounce':      'pin-bounce 1.5s ease-in-out infinite',
        'confetti-fall':   'confetti-fall 2s ease-out infinite',
        'sweat-drop':      'sweat-drop 1.2s ease-in-out infinite',
        'glow-pulse':      'glow-pulse 2s ease-in-out infinite',
        'shimmer':         'shimmer 1.5s infinite',
        'fade-in-down':    'fade-in-down 0.3s ease-out',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'float-bob': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'float-chaos': {
          '0%':   { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%':  { transform: 'translate(6px, -10px) rotate(8deg)' },
          '50%':  { transform: 'translate(-4px, -18px) rotate(-5deg)' },
          '75%':  { transform: 'translate(8px, -12px) rotate(12deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
        },
        'fly-right': {
          '0%':   { transform: 'translateX(0px) translateY(0px)', opacity: '1' },
          '100%': { transform: 'translateX(60px) translateY(-20px)', opacity: '0' },
        },
        'float-up': {
          '0%':   { transform: 'translateY(0px)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
        'pin-bounce': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'confetti-fall': {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(60px) rotate(360deg)', opacity: '0' },
        },
        'sweat-drop': {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.8' },
          '50%':      { transform: 'translateY(4px)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.4)',
        'card-lg': '0 4px 24px rgba(0,0,0,0.5)',
        'red-glow':'0 0 40px rgba(255,45,45,0.15)',
        'red-sm':  '0 0 12px rgba(255,45,45,0.2)',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

export default config

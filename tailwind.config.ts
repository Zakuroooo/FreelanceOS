import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:             '#060608',
        surface:        '#0D0D12',
        'surface-2':    '#131319',
        'surface-3':    '#1A1A22',
        border:         'rgba(255,255,255,0.06)',
        'border-hover': 'rgba(255,255,255,0.12)',
        'text-primary':   '#FAFAFA',
        'text-secondary': '#8A8A9A',
        'text-muted':     '#4A4A5A',
        accent:           '#E8271F',
        'accent-dim':     'rgba(232,39,31,0.10)',
        'accent-border':  'rgba(232,39,31,0.22)',
        'accent-glow':    'rgba(232,39,31,0.06)',
        success:          '#00C9A7',
        warning:          '#F59E0B',
        error:            '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(52px, 8vw, 96px)', { lineHeight: '1.0', fontWeight: '800', letterSpacing: '-0.04em' }],
        'heading':  ['clamp(32px, 4vw, 52px)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.03em' }],
        'subhead':  ['clamp(16px, 2vw, 20px)', { lineHeight: '1.65', fontWeight: '400' }],
        'body':     ['15px', { lineHeight: '1.7', fontWeight: '400' }],
        'caption':  ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'badge':    ['11px', { lineHeight: '1.0', fontWeight: '600', letterSpacing: '0.14em' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        'sm':   '2px',
        'md':   '6px',
        'lg':   '8px',
        'card': '4px',
        'btn':  '4px',
        'pill': '9999px',
      },
      spacing: {
        'section':    '100px',
        'section-sm': '64px',
      },
      animation: {
        'marquee':         'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
        'float-bob':       'float-bob 4s ease-in-out infinite',
        'float-chaos':     'float-chaos 5s ease-in-out infinite',
        'fly-right':       'fly-right 2s ease-out infinite',
        'float-up':        'float-up 2.5s ease-out infinite',
        'pin-bounce':      'pin-bounce 2s ease-in-out infinite',
        'confetti-fall':   'confetti-fall 2.5s ease-out infinite',
        'sweat-drop':      'sweat-drop 1.5s ease-in-out infinite',
        'glow-pulse':      'glow-pulse 3s ease-in-out infinite',
        'shimmer':         'shimmer 1.5s infinite',
        'fade-in-down':    'fade-in-down 0.4s ease-out',
        'scale-in':        'scale-in 0.4s ease-out',
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
          '50%':      { transform: 'translateY(-6px)' },
        },
        'float-chaos': {
          '0%':   { transform: 'translate(0px, 0px) rotate(0deg)' },
          '33%':  { transform: 'translate(4px, -8px) rotate(5deg)' },
          '66%':  { transform: 'translate(-3px, -12px) rotate(-4deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
        },
        'fly-right': {
          '0%':   { transform: 'translateX(0px) translateY(0px)', opacity: '1' },
          '100%': { transform: 'translateX(50px) translateY(-16px)', opacity: '0' },
        },
        'float-up': {
          '0%':   { transform: 'translateY(0px)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        'pin-bounce': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        'confetti-fall': {
          '0%':   { transform: 'translateY(-16px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(50px) rotate(360deg)', opacity: '0' },
        },
        'sweat-drop': {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.7' },
          '50%':      { transform: 'translateY(3px)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '0.7' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-noise':  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'card':     '0 1px 2px rgba(0,0,0,0.5)',
        'card-lg':  '0 4px 32px rgba(0,0,0,0.6)',
        'red':      '0 0 30px rgba(232,39,31,0.12)',
        'red-sm':   '0 0 12px rgba(232,39,31,0.18)',
        'inner-sm': 'inset 0 1px 0 rgba(255,255,255,0.04)',
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

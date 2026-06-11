/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0F',
        surface: '#111118',
        elevated: '#1C1C28',
        border: '#252532',
        flame: '#FF4D1C',
        ember: '#FF8F4F',
        glow: '#FF4D1C33',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
        muted: '#6B6B88',
        faint: '#3A3A50',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'pulse-once': 'pulseOnce 0.6s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'number-pop': 'numberPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        numberPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

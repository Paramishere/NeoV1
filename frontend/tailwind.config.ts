import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // NEO Design System
        neo: {
          bg: '#020810',
          'bg-secondary': '#040d1a',
          'bg-panel': 'rgba(4, 20, 40, 0.85)',
          'bg-glass': 'rgba(0, 212, 255, 0.04)',
          cyan: '#00d4ff',
          'cyan-dim': '#00a8cc',
          'cyan-glow': 'rgba(0, 212, 255, 0.3)',
          purple: '#7c3aed',
          'purple-dim': '#5b21b6',
          'purple-glow': 'rgba(124, 58, 237, 0.3)',
          blue: '#2563eb',
          'blue-glow': 'rgba(37, 99, 235, 0.3)',
          text: '#e2e8f0',
          'text-dim': '#64748b',
          'text-muted': '#334155',
          border: 'rgba(0, 212, 255, 0.12)',
          'border-bright': 'rgba(0, 212, 255, 0.3)',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'neo-gradient': 'linear-gradient(135deg, #020810 0%, #040d1a 50%, #060818 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #00d4ff 0%, #2563eb 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(124,58,237,0.06) 100%)',
      },
      boxShadow: {
        'neo-cyan': '0 0 20px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.05)',
        'neo-purple': '0 0 20px rgba(124, 58, 237, 0.2)',
        'neo-glow': '0 0 40px rgba(0, 212, 255, 0.15), inset 0 0 40px rgba(0, 212, 255, 0.05)',
        'panel': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 212, 255, 0.1)',
        'input': '0 0 0 1px rgba(0, 212, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)',
        'input-focus': '0 0 0 2px rgba(0, 212, 255, 0.4), 0 0 20px rgba(0, 212, 255, 0.1)',
      },
      borderRadius: {
        'neo': '12px',
        'neo-lg': '16px',
        'neo-xl': '20px',
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1', filter: 'brightness(1.2)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        neo: '20px',
      },
    },
  },
  plugins: [],
}

export default config

// ECNN - Kopya/frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#F1AF3E', // Turuncu Nokta
        'site-background': '#f8f9fa', // Genel sayfa arka planı
        'text-main': '#334155', // Ana metin rengi (Koyu Gri/Siyah)
        'text-muted': '#64748b', // Daha soluk metin rengi
        'text-heading': '#1e293b', // Başlıklar için
        'dawn-pink': '#ff9a8b', // Şafak pembesi
        'warm-yellow': '#ffd700', // Sıcak sarı
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ana sans-serif font
        serif: ['Lora', 'serif'], // Makale içeriği için serif font
        mono: ['JetBrains Mono', 'monospace'], // Header nav için
        logo: ['Inter', 'sans-serif'], // Logo için (Inter, kalın)
      },
      letterSpacing: {
        'tighter': '-.05em',
        'tight': '-.025em',
        'normal': '0',
        'wide': '.025em',
        'wider': '.05em',
        'widest': '.1em',
        'extrawidest': '.25em', // Header nav için
      },
      fontSize: {
        '7xl': '5rem', // Örnek büyük font boyutu
        '8xl': '6rem',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 4s infinite',
        'gradient': 'gradient 8s ease-in-out infinite',
        'scroll': 'scroll 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%': { 
            backgroundPosition: '0% 50%',
            opacity: '1'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            opacity: '0.8'
          },
          '100%': { 
            backgroundPosition: '0% 50%',
            opacity: '1'
          }
        },
        scroll: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'), // Resim oranları için
  ],
}

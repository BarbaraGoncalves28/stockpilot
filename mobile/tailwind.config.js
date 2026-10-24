/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Fundos (Backgrounds)
        dark: {
          base: '#050B14', // Fundo principal da tela
          card: '#0D1520', // Fundo dos cartões
          cardHover: '#131D2C', // Fundo de cartões em destaque (ex: Alertas)
          input: '#0B131E', // Fundo dos campos de formulário (inputs)
          border: '#1E2A3B', // Bordas de inputs, divisores ("ou") e botões secundários
        },
        // Textos (Typography)
        text: {
          primary: '#FFFFFF', // Títulos e números em destaque
          secondary: '#8B9BB4', // Subtítulos, placeholders e textos menores
          dark: '#050B14', // Texto escuro para botões primários (ex: texto do botão Entrar)
        },
        // Cores de Destaque Neon (Accents)
        neon: {
          green: '#00E599', // Marcação principal, Entradas, Botões Primários, Checkbox
          yellow: '#FFB800', // Estoque baixo, Alertas médios
          red: '#FF3366', // Sem estoque, Saídas, Alertas críticos
          blue: '#00D1FF', // Movimentações, Saldos
          purple: '#9D4EDD', // Alertas de limites
        },
        // Bordas e Fundos translúcidos para os cards brilhantes
        glass: {
          green: 'rgba(0, 229, 153, 0.1)',
          yellow: 'rgba(255, 184, 0, 0.1)',
          red: 'rgba(255, 51, 102, 0.1)',
          blue: 'rgba(0, 209, 255, 0.1)',
        }
      },
      borderRadius: {
        'md': '0.5rem',   // Bordas dos inputs de formulário
        'lg': '0.625rem', // Bordas dos botões
        'xl': '0.75rem',  // Bordas padrão dos cards pequenos
        '2xl': '1rem',    // Bordas dos cards maiores
        '3xl': '1.5rem',  // Bordas de containers muito arredondados
      },
      fontFamily: {
        // Supondo o uso de fontes padrão sem serifa, se tiver uma fonte customizada (ex: Inter), adicione aqui
        sans: ['Inter', 'System', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
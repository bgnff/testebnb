/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./*.{js,jsx,ts,tsx}",
      "./pages/**/*.{js,jsx,ts,tsx}",
      "./ui/**/*.{js,jsx,ts,tsx}",
      "./board/**/*.{js,jsx,ts,tsx}",
      "./calendar/**/*.{js,jsx,ts,tsx}",
      "./dashboard/**/*.{js,jsx,ts,tsx}",
      "./hooks/**/*.{js,jsx,ts,tsx}",
      "./lib/**/*.{js,jsx,ts,tsx}",
      "./sales/**/*.{js,jsx,ts,tsx}",
      "./settings/**/*.{js,jsx,ts,tsx}",
      "./tasklist/**/*.{js,jsx,ts,tsx}",
      "./utils/**/*.{js,jsx,ts,tsx}"
    ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				50: 'hsl(217 91% 97%)',
  				100: 'hsl(217 91% 94%)',
  				200: 'hsl(217 91% 87%)',
  				300: 'hsl(217 91% 77%)',
  				400: 'hsl(217 91% 67%)',
  				500: 'hsl(217 91% 60%)',
  				600: 'hsl(217 91% 50%)',
  				700: 'hsl(217 91% 40%)',
  				800: 'hsl(217 91% 30%)',
  				900: 'hsl(217 91% 20%)',
  				950: 'hsl(217 91% 10%)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)', 'sans-serif'],
  			body: ['var(--font-body)', 'sans-serif'],
  			display: ['var(--font-display)', 'sans-serif'],
  			mono: ['var(--font-mono)', 'monospace']
  		},
  		fontSize: {
  			xs: ['0.75rem', { lineHeight: '1rem' }],
  			sm: ['0.875rem', { lineHeight: '1.25rem' }],
  			base: ['1rem', { lineHeight: '1.5rem' }],
  			lg: ['1.125rem', { lineHeight: '1.75rem' }],
  			xl: ['1.25rem', { lineHeight: '1.75rem' }],
  			'2xl': ['1.5rem', { lineHeight: '2rem' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }]
  		},
  		spacing: {
  			18: '4.5rem',
  			88: '22rem',
  			128: '32rem'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  			md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  			lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  			xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  			'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  			inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  			'glow': '0 0 20px hsl(var(--primary) / 0.3)',
  			'glow-sm': '0 0 10px hsl(var(--primary) / 0.2)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'fade-out': {
  				from: { opacity: '1' },
  				to: { opacity: '0' }
  			},
  			'slide-in-from-top': {
  				from: { transform: 'translateY(-100%)' },
  				to: { transform: 'translateY(0)' }
  			},
  			'slide-in-from-bottom': {
  				from: { transform: 'translateY(100%)' },
  				to: { transform: 'translateY(0)' }
  			},
  			'slide-in-from-left': {
  				from: { transform: 'translateX(-100%)' },
  				to: { transform: 'translateX(0)' }
  			},
  			'slide-in-from-right': {
  				from: { transform: 'translateX(100%)' },
  				to: { transform: 'translateX(0)' }
  			},
  			'scale-in': {
  				from: { transform: 'scale(0.95)', opacity: '0' },
  				to: { transform: 'scale(1)', opacity: '1' }
  			},
  			'scale-out': {
  				from: { transform: 'scale(1)', opacity: '1' },
  				to: { transform: 'scale(0.95)', opacity: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-out': 'fade-out 0.2s ease-out',
  			'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
  			'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
  			'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
  			'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'scale-out': 'scale-out 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

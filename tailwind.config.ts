
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				eco: {
					green: {
						50: 'var(--eco-green-50)',
						100: 'var(--eco-green-100)',
						200: 'var(--eco-green-200)',
						300: 'var(--eco-green-300)',
						400: 'var(--eco-green-400)',
						500: 'var(--eco-green-500)',
						600: 'var(--eco-green-600)',
						700: 'var(--eco-green-700)',
						800: 'var(--eco-green-800)',
						900: 'var(--eco-green-900)'
					},
					blue: {
						50: 'var(--eco-blue-50)',
						100: 'var(--eco-blue-100)',
						200: 'var(--eco-blue-200)',
						300: 'var(--eco-blue-300)',
						400: 'var(--eco-blue-400)',
						500: 'var(--eco-blue-500)',
						600: 'var(--eco-blue-600)',
						700: 'var(--eco-blue-700)',
						800: 'var(--eco-blue-800)',
						900: 'var(--eco-blue-900)'
					},
					yellow: {
						50: 'var(--eco-yellow-50)',
						100: 'var(--eco-yellow-100)',
						200: 'var(--eco-yellow-200)',
						300: 'var(--eco-yellow-300)',
						400: 'var(--eco-yellow-400)',
						500: 'var(--eco-yellow-500)',
						600: 'var(--eco-yellow-600)',
						700: 'var(--eco-yellow-700)',
						800: 'var(--eco-yellow-800)',
						900: 'var(--eco-yellow-900)'
					},
					brown: {
						50: 'var(--eco-brown-50)',
						100: 'var(--eco-brown-100)',
						200: 'var(--eco-brown-200)',
						300: 'var(--eco-brown-300)',
						400: 'var(--eco-brown-400)',
						500: 'var(--eco-brown-500)',
						600: 'var(--eco-brown-600)',
						700: 'var(--eco-brown-700)',
						800: 'var(--eco-brown-800)',
						900: 'var(--eco-brown-900)'
					}
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

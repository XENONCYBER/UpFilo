import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Legacy shadcn colors for compatibility
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
  				foreground: 'hsl(var(--primary-foreground))'
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
  			
  			// New Neumorphic + Glassmorphic Design System
  			'neomorphic': {
  				bg: 'var(--neomorphic-bg)',
  				surface: 'var(--neomorphic-surface)',
  				text: 'var(--neomorphic-text)',
  				'text-secondary': 'var(--neomorphic-text-secondary)',
  				border: 'var(--neomorphic-border)',
  			},
  			'electric-blue': 'var(--electric-blue)',
  			'electric-purple': 'var(--electric-purple)',
  			'soft-green': 'var(--soft-green)',
  			'warm-orange': 'var(--warm-orange)',
  			'coral-red': 'var(--coral-red)',
  		},
  		
  		boxShadow: {
  			'neomorphic-raised': '8px 8px 16px var(--neomorphic-shadow-dark), -8px -8px 16px var(--neomorphic-shadow-light)',
  			'neomorphic-pressed': 'inset 4px 4px 8px var(--neomorphic-shadow-dark), inset -4px -4px 8px var(--neomorphic-shadow-light)',
  			'neomorphic-flat': '4px 4px 8px var(--neomorphic-shadow-dark), -4px -4px 8px var(--neomorphic-shadow-light)',
  			'glass': 'var(--glass-shadow)',
  			'glass-elevated': '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  		},
  		
  		backdropBlur: {
  			'glass': 'var(--glass-blur)',
  			'glass-light': 'blur(12px)',
  			'glass-heavy': 'blur(20px)',
  		},
  		
  		animation: {
  			'float': 'float 6s ease-in-out infinite',
  			'morph-glow': 'morphGlow 3s ease-in-out infinite',
  			'glass-shimmer': 'glassShimmer 2s infinite',
  		},
  		
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'neomorphic': '16px',
  			'neomorphic-lg': '24px',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;

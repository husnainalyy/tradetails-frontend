/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
    	extend: {
    		colors: {
    			p1: '#2EF2FF',
    			p2: '#3C52D9',
    			p3: '#C8EA80',
    			p4: '#EAEDFF',
    			p5: '#C4CBF5',
    			s1: '#080D27',
    			s2: '#0C1838',
    			s3: '#334679',
    			s4: '#1959AD',
    			s5: '#263466',
    			black: {
    				'100': '#05091D',
    				DEFAULT: '#000000'
    			},
    			background: '0 0% 100%',
    			foreground: '222.2 84% 4.9%',
    			card: '0 0% 100%',
    			cardForeground: '222.2 84% 4.9%',
    			primary: '222.2 47.4% 11.2%',
    			primaryForeground: '210 40% 98%',
    			secondary: '210 40% 96.1%',
    			secondaryForeground: '222.2 47.4% 11.2%',
    			muted: '210 40% 96.1%',
    			mutedForeground: '215.4 16.3% 46.9%',
    			accent: '210 40% 96.1%',
    			accentForeground: '222.2 47.4% 11.2%',
    			destructive: '0 84.2% 60.2%',
    			destructiveForeground: '210 40% 98%',
    			border: '214.3 31.8% 91.4%',
    			input: '214.3 31.8% 91.4%',
    			ring: '222.2 84% 4.9%',
    			sidebarBackground: '0 0% 98%',
    			sidebarForeground: '240 5.3% 26.1%',
    			sidebarPrimary: '240 5.9% 10%',
    			sidebarPrimaryForeground: '0 0% 98%',
    			sidebarAccent: '240 4.8% 95.9%',
    			sidebarAccentForeground: '240 5.9% 10%',
    			sidebarBorder: '220 13% 91%',
    			sidebarRing: '217.2 91.2% 59.8%'
    		},
    		boxShadow: {
    			'100': '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 16px 24px rgba(0, 0, 0, 0.25), inset 0px 3px 6px #1959AD',
    			'200': '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 16px 24px rgba(0, 0, 0, 0.25), inset 0px 4px 10px #3391FF',
    			'300': '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 16px 24px rgba(0, 0, 0, 0.25), inset 0px 3px 6px #1959AD',
    			'400': 'inset 0px 2px 4px 0 rgba(255, 255, 255, 0.05)',
    			'500': '0px 16px 24px rgba(0, 0, 0, 0.25), 0px -14px 48px rgba(40, 51, 111, 0.7)'
    		},
    		fontFamily: {
    			inter: [
    				'Inter',
    				'sans-serif'
    			],
    			poppins: [
    				'Poppins',
    				'sans-serif'
    			]
    		},
    		transitionProperty: {
    			borderColor: 'border-color'
    		},
    		spacing: {
    			'22': '88px',
    			'100': '100px',
    			'330': '330px',
    			'388': '388px',
    			'400': '400px',
    			'440': '440px',
    			'512': '512px',
    			'640': '640px',
    			'960': '960px',
    			'1230': '1230px',
    			'1/5': '20%',
    			'2/5': '40%',
    			'3/5': '60%',
    			'4/5': '80%',
    			'3/20': '15%',
    			'7/20': '35%',
    			'9/20': '45%',
    			'11/20': '55%',
    			'13/20': '65%',
    			'15/20': '75%',
    			'17/20': '85%',
    			'19/20': '95%'
    		},
    		zIndex: {
    			'1': '1',
    			'2': '2',
    			'4': '4'
    		},
    		lineHeight: {
    			'12': '48px'
    		},
    		borderRadius: {
    			'14': '14px',
    			'20': '20px',
    			'40': '40px',
    			half: '50%',
    			'7xl': '40px'
    		},
    		flex: {
    			'50': '0 0 50%',
    			'100': '0 0 100%',
    			'256': '0 0 256px',
    			'280': '0 0 280px',
    			'300': '0 0 300px',
    			'320': '1px 0 320px',
    			'540': '0 0 540px'
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
	plugins: [],
  };
  
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                slate: {
                    850: '#152033',
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'shine': 'shine 1.5s ease-in-out infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(2, 132, 199, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(56, 189, 248, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%)',
            },
        },
    },
    plugins: [],
}

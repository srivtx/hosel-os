/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b", // zinc-950
                foreground: "#fafafa", // zinc-50
                card: {
                    DEFAULT: "#18181b", // zinc-900
                    foreground: "#fafafa",
                },
                primary: {
                    DEFAULT: "#22c55e", // green-500
                    foreground: "#052e16", // green-950
                },
                secondary: {
                    DEFAULT: "#27272a", // zinc-800
                    foreground: "#fafafa",
                },
                muted: {
                    DEFAULT: "#27272a", // zinc-800
                    foreground: "#a1a1aa", // zinc-400
                },
                destructive: {
                    DEFAULT: "#ef4444", // red-500
                    foreground: "#450a0a", // red-950
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

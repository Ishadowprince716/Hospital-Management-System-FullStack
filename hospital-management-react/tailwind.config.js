/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563eb",
                "primary-dark": "#1e40af",
                card: "#f8f9fa",
                border: "#dee2e6",
            }
        },
    },
    plugins: [],
}

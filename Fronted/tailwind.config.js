/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors:{
        grey:{
            100:"#eeeeef",
            200:"#e6e9ed",
            600:"#95989c"
        },

        // Full brand scale built around #5046e4 so every shade matches
        purple:{
          50:"#f5f4ff",
          100:"#ecebfd",
          200:"#dcd9fb",
          300:"#c2bdf7",
          400:"#8f87ef",
          500:"#6a61e9",
          600:"#5046e4",
          700:"#4038c4",
          800:"#36309f",
          900:"#2e2a7e",
        }
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "pop-in": "pop-in 250ms ease-out",
        "card-in": "pop-in 350ms ease-out both",
      },
    },
  },
  plugins: [],
}

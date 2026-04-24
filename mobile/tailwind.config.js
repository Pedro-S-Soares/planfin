/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6255EA",
          dark: "#4A3FBB",
          light: "#EEEDFD",
          text: "#4535CC",
        },
        app: {
          bg: "#F0EFF9",
          surface: "#FFFFFF",
          text: "#17162B",
          "text-sec": "#6B6987",
          "text-ter": "#ADABCA",
          border: "#E4E2F0",
          success: "#0EAD70",
          "success-light": "#E8FBF2",
          danger: "#E5392B",
          "danger-light": "#FEF0EE",
        },
      },
    },
  },
  plugins: [],
};

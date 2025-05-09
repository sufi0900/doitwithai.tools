/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    keyframes: {
      skeletonPulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.4 },
      },
    },
    animation: {
      skeletonPulse: 'skeletonPulse 1.5s ease-in-out infinite',
    },
    keyframes: {
      'ping-star': {
        '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
        '50%': { transform: 'scale(1.3)', opacity: '1' },
      },
    },
    animation: {
      'ping-star': 'ping-star 1.6s infinite ease-in-out',
    },
  
    screens: {
      xs: "450px",
      // => @media (min-width: 450px) { ... }

      sm: "575px",
      // => @media (min-width: 576px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "992px",
      // => @media (min-width: 992px) { ... }

      xl: "1200px",
      // => @media (min-width: 1200px) { ... }

      "2xl": "1400px",
      // => @media (min-width: 1400px) { ... }
    },
    extend: {
      colors: {
        current: "currentColor",
        transparent: "transparent",
        white: "#FFFFFF",
        black: "#121723",
        dark: "#1D2430",
        textColor: ['first-letter'],
        fontSize: ['first-letter'],
        fontWeight: ['first-letter'],
        typography: ['first-letter', 'first-line'],
        margin: ['first-letter'],
        float: ['first-letter'],  
        primary: "#4A6CF7",
        yellow: "#FBB040",
        "body-color": "#788293",
        "body-color-dark": "#959CB1",
        "gray-dark": "#1E232E",
        "gray-light": "#F0F2F9",
        stroke: "#E3E8EF",
        "stroke-dark": "#353943",
        "bg-color-dark": "#171C28",
      },
      lineClamp: {
        7: "7",
        8: "8",
        9: "9",
        10: "10",
      },
      boxShadow: {
        signUp: "0px 5px 10px rgba(4, 10, 34, 0.2)",
        one: "0px 2px 3px rgba(7, 7, 77, 0.05)",
        two: "0px 5px 10px rgba(6, 8, 15, 0.1)",
        three: "0px 5px 15px rgba(6, 8, 15, 0.05)",
        sticky: "inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
        "sticky-dark": "inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)",
        "feature-2": "0px 10px 40px rgba(48, 86, 211, 0.12)",
        submit: "0px 5px 20px rgba(4, 10, 34, 0.1)",
        "submit-dark": "0px 5px 20px rgba(4, 10, 34, 0.1)",
        btn: "0px 1px 2px rgba(4, 10, 34, 0.15)",
        "btn-hover": "0px 1px 2px rgba(0, 0, 0, 0.15)",
        "btn-light": "0px 1px 2px rgba(0, 0, 0, 0.1)",
      },
      dropShadow: {
        three: "0px 5px 15px rgba(6, 8, 15, 0.05)",
      },
      typography: {
        DEFAULT: {
          css: {
            p: {
              marginBottom: "1rem", // Adjust margin bottom
              fontSize: "1.125rem", // Adjust font size
              fontWeight: "medium", // Adjust font weight
              lineHeight: "1.75", // Adjust line height
              color: "#788293", // Adjust text color
            },
          },
        },
      },
    },
  },
  plugins: [],
};

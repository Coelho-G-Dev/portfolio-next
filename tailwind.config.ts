import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#12222D",
        cream: "#F2EADC",
        lime: "#EAF35B",
        orange: "#E97C67",
        blue: "#496AE8",
        lavender: "#B997FF",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#e0e0e0",
        primary: {
          DEFAULT: "#00ff88",
          glow: "rgba(0, 255, 136, 0.5)",
        },
        danger: {
          DEFAULT: "#ff3333",
          glow: "rgba(255, 51, 51, 0.5)",
        },
        warning: {
          DEFAULT: "#ffaa00",
          glow: "rgba(255, 170, 0, 0.5)",
        },
        card: {
          DEFAULT: "#12121a",
          border: "#1e1e2e",
        },
        muted: "#666666",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "scanline": "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
      },
      animation: {
        "pulse-red": "pulse-red 2s infinite",
        "scan": "scan 10s linear infinite",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 51, 51, 0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(255, 51, 51, 0)" },
        },
        "scan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

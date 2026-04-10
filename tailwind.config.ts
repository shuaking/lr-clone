import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class', // 启用基于 class 的暗色模式
  theme: {
    extend: {
      colors: {
        background: "#0b1020",
        panel: "#11172a",
        line: "rgba(255,255,255,0.09)",
        ink: "#f6f7fb",
        muted: "#9ca6b8",
        brand: "#5b7dd4",
        accent: "#78f0c8",
        red: {
          400: "#f87171",
          500: "#dc2626",
          600: "#b91c1c",
        }
      },
      boxShadow: { glow: "0 18px 60px rgba(124, 156, 255, 0.16)" },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(124,156,255,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #0a0f1b 100%)"
      }
    }
  },
  plugins: []
};

export default config;

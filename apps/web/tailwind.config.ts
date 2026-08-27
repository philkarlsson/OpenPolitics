import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18201f",
        field: "#f4f1ea",
        line: "#d8d3c8",
        civic: "#216869",
        action: "#b8452e",
        mint: "#d8ece6"
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(33, 104, 105, 0.22)"
      }
    }
  },
  plugins: []
} satisfies Config;

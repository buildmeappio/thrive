import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./domains/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        degular: ["var(--font-degular)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        // brand (from your screenshot)
        brand: {
          50: "#EDF7FF",
          100: "#D9F0FF",
          300: "#89D7FF",
          500: "#29B8FF",
          600: "#00A8FF",
          700: "#0097E6",
          900: "#000093", // accent for icons/text only
        },
        // neutrals used in cards/pills/borders
        surface: "#FFFFFF",
        canvas: "#F2F5F6",
        pill: "#EEF1F3",
        pillHover: "#E7EBEE",
        stroke: "#E4E9EC",
        text: "#0F1A1C",
        muted: "#7B8B91",
      },
      boxShadow: {
        card: "0 6px 30px rgba(16,24,40,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      fontSize: {
        // comfortable, consistent scale
        xs: ["12px", "18px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "26px"],
      },
    },
  },
  plugins: [],
} satisfies Config;

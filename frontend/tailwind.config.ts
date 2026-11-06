import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["Newsreader", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Paper, plum ink, persimmon accents.
        ground: "#FAF7F2",
        paper: "#FFFDFA",
        sand: "#F1EBE6",
        clay: "#EEE5DF",
        stone: "#E8DCD4",
        ink: "#382833",
        body: "#62545B",
        quiet: "#77676E",
        rule: "#DFD3D2",
        terra: {
          DEFAULT: "#A4452D",
          deep: "#763022",
          soft: "#F6E7DE",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        site: "1240px",
      },
      boxShadow: {
        ui: "0 1px 2px rgba(70,45,20,.06), 0 22px 44px -18px rgba(70,45,20,.24)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;

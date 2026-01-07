module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(220, 14%, 90%)",
        input: "hsl(220, 14%, 90%)",
        ring: "hsl(217, 90%, 56%)",
        background: "hsl(210, 40%, 98%)",
        foreground: "hsl(222, 15%, 20%)",
        primary: {
          DEFAULT: "hsl(217, 90%, 56%)",
          foreground: "hsl(0, 0%, 100%)",
          hover: "hsl(217, 90%, 50%)",
          active: "hsl(217, 90%, 46%)",
        },
        secondary: {
          DEFAULT: "hsl(217, 90%, 96%)",
          foreground: "hsl(217, 60%, 34%)",
          hover: "hsl(217, 90%, 94%)",
          active: "hsl(217, 90%, 90%)",
        },
        tertiary: {
          DEFAULT: "hsl(204, 45%, 98%)",
          foreground: "hsl(210, 34%, 25%)",
        },
        accent: {
          DEFAULT: "hsl(160, 84%, 39%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        success: {
          DEFAULT: "hsl(160, 84%, 39%)",
          foreground: "hsl(160, 100%, 98%)",
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 50%)",
          foreground: "hsl(48, 100%, 10%)",
        },
        error: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 100%, 98%)",
        },
        info: {
          DEFAULT: "hsl(210, 90%, 56%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        neutral: {
          50: "hsl(210, 40%, 98%)",
          100: "hsl(214, 32%, 93%)",
          200: "hsl(213, 27%, 84%)",
          300: "hsl(212, 24%, 75%)",
          400: "hsl(211, 20%, 65%)",
          500: "hsl(210, 16%, 45%)",
          600: "hsl(214, 19%, 35%)",
          700: "hsl(216, 25%, 25%)",
          800: "hsl(218, 36%, 15%)",
          900: "hsl(222, 47%, 11%)",
        },
        muted: {
          DEFAULT: "hsl(214, 32%, 93%)",
          foreground: "hsl(210, 16%, 45%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(222, 15%, 20%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(222, 15%, 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 100%, 98%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        h1: ["56px", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.2", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "1.2", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.5", fontWeight: "400" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      spacing: {
        1: "4px",
        2: "8px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "32px",
        xl: "48px",
        "2xl": "64px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 3px hsl(0, 0%, 0%, 0.1)",
        md: "0 2px 8px hsl(0, 0%, 0%, 0.1)",
        lg: "0 4px 12px hsl(0, 0%, 0%, 0.15)",
        xl: "0 8px 24px hsl(0, 0%, 0%, 0.25)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      transitionTimingFunction: {
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, hsl(217, 90%, 56%), hsl(217, 90%, 46%))",
        "gradient-secondary": "linear-gradient(135deg, hsl(160, 84%, 45%), hsl(160, 84%, 35%))",
        "gradient-accent": "linear-gradient(135deg, hsl(210, 92%, 56%), hsl(260, 92%, 56%))",
      },
    },
  },
  plugins: [],
}

/**
 * Design-sync Tailwind build config.
 * Mirrors theme.extend from tailwind.config.ts (keep in sync if that file
 * changes). Used only by /design-sync to precompile a static stylesheet
 * (tokens + preflight + utilities) for the Claude Design bundle's cfg.cssEntry.
 * Content covers the shadcn ui components AND the authored preview cards so
 * every class either file references is emitted.
 */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "../.design-sync/previews/**/*.{ts,tsx}",
  ],
  // Layout/spacing utilities preview cards may compose with even if no app
  // file happens to use them — keeps cards from rendering unstyled.
  safelist: [
    { pattern: /^(grid|flex|inline-flex|block|inline-block|hidden|contents)$/ },
    { pattern: /^(grid-cols|grid-rows|col-span|row-span|gap|gap-x|gap-y|space-x|space-y)-(0|1|2|3|4|5|6|7|8|9|10|11|12)$/ },
    { pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-(0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|10|12|14|16|20|24)$/ },
    { pattern: /^(w|h|min-w|min-h|max-w|max-h)-(0|2|4|6|8|10|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|full|screen|fit|min|max|px|auto|none|sm|md|lg|xl|2xl|3xl|prose)$/ },
    { pattern: /^(items|justify|self|content|place|justify-items|justify-self)-(start|end|center|between|around|evenly|stretch|baseline|auto)$/ },
    { pattern: /^flex-(row|row-reverse|col|col-reverse|wrap|nowrap|1|auto|initial|none|grow|shrink|grow-0|shrink-0)$/ },
    { pattern: /^text-(left|center|right|justify|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|muted-foreground|foreground|primary|primary-foreground|secondary-foreground|destructive|accent-foreground|card-foreground|popover-foreground)$/ },
    { pattern: /^(bg|border|text|ring|fill|stroke)-(background|foreground|primary|secondary|muted|accent|destructive|popover|card|border|input|ring)(-foreground)?(\/(10|20|30|40|50|60|70|80|90))?$/ },
    { pattern: /^font-(thin|light|normal|medium|semibold|bold|extrabold)$/ },
    { pattern: /^(leading|tracking)-(none|tight|snug|normal|relaxed|loose|wide|wider|widest)$/ },
    { pattern: /^(rounded)(-(none|sm|md|lg|xl|2xl|3xl|full))?(-(t|b|l|r|tl|tr|bl|br))?$/ },
    { pattern: /^border(-(0|2|4|8|t|b|l|r|x|y))?$/ },
    { pattern: /^(shadow)(-(sm|md|lg|xl|2xl|none|card|glow))?$/ },
    { pattern: /^(opacity)-(0|25|50|60|70|75|80|90|100)$/ },
    { pattern: /^(overflow|overflow-x|overflow-y)-(auto|hidden|visible|scroll|clip)$/ },
    { pattern: /^(object)-(cover|contain|fill|none)$/ },
    { pattern: /^(aspect)-(square|video|auto)$/ },
    { pattern: /^(divide-y|divide-x)$/ },
    "relative", "absolute", "fixed", "sticky", "static", "inset-0", "z-10", "z-50",
    "truncate", "line-clamp-2", "whitespace-nowrap", "cursor-pointer", "select-none",
    "w-full", "h-full", "mx-auto", "text-center", "underline", "italic", "uppercase", "capitalize",
    "border-dashed", "border-solid", "gradient-hero", "gradient-subtle", "shadow-card", "shadow-glow",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

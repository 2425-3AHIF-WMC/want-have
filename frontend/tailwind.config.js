// ───────────────────────────────────────────────────────────────────────────────
// Datei: tailwind.config.js
// ───────────────────────────────────────────────────────────────────────────────

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grundsätzliches Grau–Beige‐Farbschema:
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Statt „marktx-blue-600“ und „marktx-blue-700“ nehmen wir Beige–Grau:
        marktx: {
          blue: {
            // Neu: Light‐Beige als Haupt‐Farbe
            600: "#d6c8b7",   // Helles Beige
            700: "#b8a694",   // Etwas dunkleres Beige
          },
          // Accent (z. B. Buttons/Hover) in warmem Grau
          accent: {
            orange: "#a39e93", // Gedämpftes Grau‐Beige
            red: "#817e79",    // Dunkleres Warmgrau
          },
          // „free“-Badge‐Farbe in zurückhaltendem Grün‐Beige
          free: "#8fa79e",
        },

        // Alle anderen Farben belassen wir auf den CSS‐Variablen (siehe weiter unten)
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Sidebar‐Farben bleiben in CSS‐Variablen
        "sidebar-background": "hsl(var(--sidebar-background))",
        "sidebar-foreground": "hsl(var(--sidebar-foreground))",
        "sidebar-primary": "hsl(var(--sidebar-primary))",
        "sidebar-primary-foreground": "hsl(var(--sidebar-primary-foreground))",
        "sidebar-accent": "hsl(var(--sidebar-accent))",
        "sidebar-accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        "sidebar-border": "hsl(var(--sidebar-border))",
        "sidebar-ring": "hsl(var(--sidebar-ring))",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      borderColor: {
        border: "hsl(var(--border))",
      },
    },
  },
  plugins: [],
};

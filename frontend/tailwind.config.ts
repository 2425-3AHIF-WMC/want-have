import type { Config } from "tailwindcss";

const config: Config = {
darkMode: "class", // Because you are using `.dark`
content: [
"./src/**/*.{ts,tsx,js,jsx}", // Important: Scan your app files
],
theme: {
extend: {
fontFamily: {
inter: ["Inter", "sans-serif"], // You use font-inter
},
colors: {
background: "hsl(var(--background))",
foreground: "hsl(var(--foreground))",
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

// Sidebar specific
"sidebar-background": "hsl(var(--sidebar-background))",
"sidebar-foreground": "hsl(var(--sidebar-foreground))",
"sidebar-primary": "hsl(var(--sidebar-primary))",
"sidebar-primary-foreground": "hsl(var(--sidebar-primary-foreground))",
"sidebar-accent": "hsl(var(--sidebar-accent))",
"sidebar-accent-foreground": "hsl(var(--sidebar-accent-foreground))",
"sidebar-border": "hsl(var(--sidebar-border))",
"sidebar-ring": "hsl(var(--sidebar-ring))",

// You used some extra custom colors like marktx-blue-600
"marktx-blue-600": "#1c75bc", // example value
"marktx-blue-700": "#155a8a", // darker hover
"marktx-accent-orange": "#ff9900", // example accent
"marktx-accent-red": "#ff4d4d",    // hover for accent
"marktx-free": "#34d399", // free badge green (example)
},
borderRadius: {
lg: "var(--radius)",
},
},
},
plugins: [],
};

export default config;

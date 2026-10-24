/** Cartwheel design tokens. Applied as CSS variables on <body>; core UI reads the --rt-* ones. */
export const brand = {
  name: "Cartwheel",
  tagline: "Everything, delivered right.",
  tokens: {
    "--rt-bg": "#f6f4ef",
    "--rt-surface": "#ffffff",
    "--rt-surface-2": "#efece4",
    "--rt-fg": "#1d1b16",
    "--rt-muted": "#6b6659",
    "--rt-border": "#ddd8cc",
    "--rt-primary": "#0f5e4a",
    "--rt-primary-fg": "#ffffff",
    "--rt-accent": "#0f5e4a",
    "--rt-radius": "10px",
    "--rt-radius-sm": "8px",
  } as Record<string, string>,
};

/** Cartwheel design tokens. Applied as CSS variables on <body>; core UI reads the --rt-* ones. */
export const brand = {
  name: "Cartwheel",
  tagline: "Everything, delivered right.",
  tokens: {
    "--rt-bg": "#f6f4ee",
    "--rt-surface": "#ffffff",
    "--rt-surface-2": "#eef0e8",
    "--rt-fg": "#16211c",
    "--rt-muted": "#5d6a62",
    "--rt-border": "#dcdfd4",
    "--rt-primary": "#0c5a45",
    "--rt-primary-fg": "#ffffff",
    "--rt-accent": "#0b6650",
    "--rt-success": "#17794b",
    "--rt-warning": "#a1610a",
    "--rt-danger": "#b3261e",
    "--rt-radius": "14px",
    "--rt-radius-sm": "9px",
    "--rt-shadow": "0 1px 0 rgb(22 33 28 / .04), 0 8px 24px -12px rgb(22 33 28 / .22)",
    // Cartwheel-only
    "--cw-ink": "#0b3328",
    "--cw-clay": "#c0532e",
    "--cw-saffron": "#eaa53c",
    "--cw-cream": "#fbf3e2",
  } as Record<string, string>,
};

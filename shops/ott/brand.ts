/** Reelbox design tokens. Applied as CSS variables on <body>; core UI reads the --rt-* ones. */
export const brand = {
  name: "Reelbox",
  tagline: "Stories worth staying in for.",
  tokens: {
    "--rt-bg": "#120d18",
    "--rt-surface": "#1c1524",
    "--rt-surface-2": "#2a2033",
    "--rt-fg": "#f6efe6",
    "--rt-muted": "#ab9fb6",
    "--rt-border": "#3b2f47",
    "--rt-primary": "#f2b84b",
    "--rt-primary-fg": "#1d1305",
    "--rt-accent": "#c3adff",
    "--rt-success": "#6fd6a2",
    "--rt-warning": "#f2b84b",
    "--rt-danger": "#ff8b7a",
    "--rt-radius": "16px",
    "--rt-radius-sm": "10px",
    "--rt-shadow": "0 1px 0 rgb(255 255 255 / 0.04) inset, 0 18px 40px -18px rgb(0 0 0 / 0.7)",
  } as Record<string, string>,
};

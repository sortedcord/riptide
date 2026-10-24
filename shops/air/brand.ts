/** Skyline Air design tokens. Applied as CSS variables on <body>; core UI reads the --rt-* ones. */
export const brand = {
  name: "Skyline Air",
  tagline: "Fair fares, clear skies.",
  tokens: {
    "--rt-bg": "#f4f6f8",
    "--rt-surface": "#ffffff",
    "--rt-surface-2": "#e9eef2",
    "--rt-fg": "#0f1d2a",
    "--rt-muted": "#5a6b7b",
    "--rt-border": "#d3dce4",
    "--rt-primary": "#0b4466",
    "--rt-primary-fg": "#ffffff",
    "--rt-accent": "#c8603c",
    "--rt-success": "#1d7a55",
    "--rt-warning": "#a86a0c",
    "--rt-danger": "#b3261e",
    "--rt-radius": "14px",
    "--rt-radius-sm": "8px",
    "--rt-shadow": "0 1px 0 rgb(15 29 42 / 0.04), 0 6px 20px -8px rgb(11 68 102 / 0.18)",
    "--sk-sky": "#dcecf5",
    "--sk-ink-2": "#244a66",
  } as Record<string, string>,
};

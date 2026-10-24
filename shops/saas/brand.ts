/** Prism Studio design tokens. Applied as CSS variables on <body>; core UI reads the --rt-* ones. */
export const brand = {
  name: "Prism Studio",
  tagline: "Creative apps for people who make things.",
  tokens: {
    "--rt-bg": "#F4F1EA",
    "--rt-surface": "#FFFDF8",
    "--rt-surface-2": "#EBE6DA",
    "--rt-fg": "#1B1A21",
    "--rt-muted": "#5F5B66",
    "--rt-border": "#D9D2C3",
    "--rt-primary": "#1B1A21",
    "--rt-primary-fg": "#FFFDF8",
    "--rt-accent": "#3140C9",
    "--rt-success": "#2C7A4B",
    "--rt-warning": "#9C6410",
    "--rt-danger": "#B0352A",
    "--rt-radius": "18px",
    "--rt-radius-sm": "10px",
    "--rt-shadow": "0 1px 0 rgb(27 26 33 / 0.05), 0 14px 34px -18px rgb(27 26 33 / 0.35)",
    // Prism spectrum used for decorative edges (never for buttons).
    "--ps-spectrum": "linear-gradient(90deg, #E8553D, #F2A93B, #6DBE6A, #2FA7B8, #3140C9, #8B4FC9)",
  } as Record<string, string>,
};

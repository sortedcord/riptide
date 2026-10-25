// README headings as Emberspire SVGs: `npm run readme:headings` after adding or renaming a heading.
// Write new headings as plain `## Text` / `### Text`; this turns them (and the existing SVG headings) into
// <hN><a id></a><img></hN>, re-renders every SVG and deletes ones no heading uses any more.
// Poppins Medium is outlined to paths because GitHub's image proxy blocks web fonts inside SVGs.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const README = path.join(ROOT, "README.md");
const DIR = "docs/assets/headings";
const font = opentype.loadSync(path.join(ROOT, "docs/assets/fonts/Poppins-Medium.ttf"));

const slug = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s/g, "-");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const r = (n) => Math.round(n * 100) / 100;

// Blade: hard edges, top sheared by half its width (the system's one angle), standing on the baseline.
const blade = (x, base, w, h) => `<path class="b" d="M${r(x)} ${r(base - h + w / 2)}L${r(x + w)} ${r(base - h)}V${r(base)}H${r(x)}Z"/>`;

// h1/h2 end with a three-blade spire; h3 leads with one blade, like the console's panel titles.
const SPEC = { 1: { size: 60, spire: true }, 2: { size: 34, spire: true }, 3: { size: 24, spire: false } };

function render(level, text) {
  const { size, spire } = SPEC[level];
  const ascent = (font.ascender / font.unitsPerEm) * size;
  const descent = (-font.descender / font.unitsPerEm) * size;
  const pad = Math.ceil(size * 0.08);
  const base = Math.ceil(pad + ascent * 0.92);
  const cap = size * 0.7;
  let x = 1;
  const parts = [];
  if (!spire) {
    const w = size * 0.42;
    parts.push(blade(x, base, w, size * 0.82));
    x += w + size * 0.5;
  }
  parts.push(`<path class="t" d="${font.getPath(text, x, base, size, { kerning: true }).toPathData(2)}"/>`);
  x += font.getAdvanceWidth(text, size, { kerning: true });
  if (spire) {
    const w = size * 0.2, gap = size * 0.12;
    x += size * 0.3;
    for (const k of [0.52, 1, 0.74]) { parts.push(blade(x, base, w, cap * 1.05 * k)); x += w + gap; }
    x -= gap;
  }
  const W = Math.ceil(x + 2), H = Math.ceil(base + descent * 0.6 + pad);
  // Ink on light, cream on dark: follows the viewer's OS/browser scheme (an <img> SVG can't see GitHub's theme).
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(text)}">
<title>${esc(text)}</title>
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBCB8E"/><stop offset=".52" stop-color="#F08C2E"/><stop offset="1" stop-color="#8447F2"/></linearGradient></defs>
<style>.t{fill:#14110A}.b{fill:url(#g)}@media (prefers-color-scheme:dark){.t{fill:#F8EEDC}}</style>
${parts.join("\n")}
</svg>
`;
}

function parse(line) {
  let m = line.match(/^(#{1,3}) (.+)$/);
  if (m) return { level: m[1].length, text: m[2].trim(), attrs: m[1].length === 1 ? ' align="center"' : "" };
  m = line.match(/^<h([1-3])((?: align="center")?)>(?:<a id="[^"]*"><\/a>)?(?:<img src="[^"]*" alt="([^"]*)">|([^<]+))<\/h\1>$/);
  if (m) return { level: Number(m[1]), text: unesc(m[3] ?? m[4]).trim(), attrs: m[2] };
  return null;
}

const used = new Set();
let fence = false;
const lines = fs.readFileSync(README, "utf8").split("\n").map((line) => {
  if (/^\s*(```|~~~)/.test(line)) fence = !fence;
  const h = !fence && parse(line);
  if (!h) return line;
  const id = slug(h.text);
  fs.writeFileSync(path.join(ROOT, DIR, `${id}.svg`), render(h.level, h.text));
  used.add(`${id}.svg`);
  return `<h${h.level}${h.attrs}><a id="${id}"></a><img src="${DIR}/${id}.svg" alt="${esc(h.text)}"></h${h.level}>`;
});
fs.writeFileSync(README, lines.join("\n"));
const stale = fs.readdirSync(path.join(ROOT, DIR)).filter((f) => f.endsWith(".svg") && !used.has(f));
for (const f of stale) fs.rmSync(path.join(ROOT, DIR, f));
console.log(`${used.size} headings rendered${stale.length ? `; removed ${stale.join(", ")}` : ""}`);

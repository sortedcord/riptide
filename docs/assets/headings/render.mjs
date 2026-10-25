// README headings as Emberspire banners: `npm run readme:headings` after adding or renaming a heading.
// Write new headings as plain `## Text` / `### Text`; this turns them (and the existing SVG headings) into
// <hN><a id></a><img></hN>, re-renders every SVG and deletes ones no heading uses any more.
// Poppins Medium is outlined to paths because GitHub's image proxy blocks web fonts inside SVGs.
// A heading with no entry in ICON_FOR gets the spark; add one there for a fitting illustration.
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

const INK = "#14110A", CREAM = "#F8EEDC", CHARCOAL = "#2A2823";
/** Same heading → same skyline: a small seeded generator keyed on the slug. */
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}

// Blade: hard edges, top sheared by half its width (the system's one angle), standing on `base`.
const blade = (x, base, w, h, fill = "url(#g)") => `<path fill="${fill}" d="M${r(x)} ${r(base - h + w / 2)}L${r(x + w)} ${r(base - h)}V${r(base)}H${r(x)}Z"/>`;

/** A row of blades from x0 to x1, heights from `height(i, x)`; the blade gradient spans the band so short blades stay peach. */
function skyline(x0, x1, base, w, gap, height, fill) {
  const out = [];
  for (let x = x0, i = 0; x + w <= x1; x += w + gap, i++) out.push(blade(x, base, w, height(i, x), fill));
  return out.join("");
}

// ------------------------------------------------------------------ illustrations (64×64, drawn on a charcoal tile)
// Cream line work plus the blade gradient (#ig, user space 0→64) for the one loud part of each drawing.
const L = (d, w = 4) => `<path d="${d}" fill="none" stroke="${CREAM}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const G = (d, w = 5) => `<path d="${d}" fill="none" stroke="url(#ig)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const F = (d, fill = "url(#ig)") => `<path d="${d}" fill="${fill}"/>`;
const arc = (cx, cy, rad, a0, a1) => {
  const p = (a) => [cx + rad * Math.cos((a * Math.PI) / 180), cy + rad * Math.sin((a * Math.PI) / 180)].map(r);
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0}A${rad} ${rad} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};
const ib = (x, base, w, h) => blade(x, base, w, h, "url(#ig)");

const ICONS = {
  // Two arcs chasing each other: the pipeline's loop.
  loop: () => G(arc(32, 32, 18, 195, 335), 7) + F("M53 22l1 15-12-6z") + G(arc(32, 32, 18, 15, 155), 7) + F("M11 42l-1-15 12 6z"),
  // Infinity: run, score, rate, repeat.
  infinity: () => G("M32 32C25 20 10 20 10 32S25 44 32 32 39 20 54 32 39 44 32 32", 6) + `<circle cx="10" cy="32" r="4" fill="${CREAM}"/>`,
  // A gear: how the machinery runs.
  gear: () => [...Array(8).keys()].map((i) => `<rect x="28" y="8" width="8" height="12" rx="1.5" fill="url(#ig)" transform="rotate(${i * 45} 32 32)"/>`).join("") + `<circle cx="32" cy="32" r="16" fill="url(#ig)"/><circle cx="32" cy="32" r="6.5" fill="${CHARCOAL}"/>`,
  // An eye with a cursor: watching an agent work.
  eye: () => L("M6 30C16 15 48 15 58 30 48 45 16 45 6 30Z") + `<circle cx="32" cy="30" r="9" fill="url(#ig)"/>` + F("M40 38l14 6-6 2 4 7-3 1-3-7-5 4z", CREAM),
  // Two panes: what the engine sees vs what the agent sees.
  split: () => L("M7 15h22v34H7z") + F("M35 15h22v34H35z") + L("M12 24h12M12 31h8M12 38h11", 3) + `<circle cx="46" cy="32" r="5" fill="${INK}"/>`,
  // Four-point spark.
  spark: () => F("M30 8c2 14 6 18 20 20-14 2-18 6-20 20-2-14-6-18-20-20 14-2 18-6 20-20z") + F("M50 42c1 6 2 7 8 8-6 1-7 2-8 8-1-6-2-7-8-8 6-1 7-2 8-8z", CREAM),
  // A pre-ticked box: the classic sneak-into-basket pattern.
  check: () => `<rect x="12" y="14" width="34" height="34" rx="7" fill="url(#ig)"/>` + `<path d="M20 31l7 7 12-14" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` + F("M42 40l14 6-6 2 4 7-3 1-3-7-5 4z", CREAM),
  // Terminal prompt.
  terminal: () => L("M8 14h48v36H8z") + G("M17 27l8 6-8 6", 5) + ib(30, 41, 14, 5),
  // Play.
  play: () => `<path d="M22 13L51 32 22 51Z" fill="url(#ig)" stroke="url(#ig)" stroke-width="4" stroke-linejoin="round"/>`,
  // Rising blades on a baseline: ratings.
  chart: () => ib(9, 52, 9, 14) + ib(21, 52, 9, 22) + ib(33, 52, 9, 31) + ib(45, 52, 9, 42) + L("M6 55h52", 3),
  // Magnifier finding blades: a sniffer spotting patterns.
  sniffer: () => `<circle cx="27" cy="27" r="16" fill="none" stroke="${CREAM}" stroke-width="4.5"/>` + G("M39 39l14 14", 7) + ib(19, 34, 4, 9) + ib(25, 34, 4, 15) + ib(31, 34, 4, 11),
  // Console window with a chart in it.
  window: () => L("M7 12h50v40H7z") + L("M7 21h50", 3) + `<circle cx="13" cy="16.5" r="1.8" fill="${CREAM}"/><circle cx="19" cy="16.5" r="1.8" fill="${CREAM}"/>` + ib(15, 46, 7, 10) + ib(25, 46, 7, 18) + ib(35, 46, 7, 14) + ib(45, 46, 7, 21),
  // Folder holding a tree.
  folder: () => L("M7 18h17l5 6h28v28H7z") + L("M18 31v14M18 38h10M18 45h10", 3) + `<rect x="31" y="35" width="15" height="6" rx="1.5" fill="url(#ig)"/><rect x="31" y="42" width="11" height="6" rx="1.5" fill="url(#ig)"/>`,
  // Up arrow off a launch line: deploy.
  upload: () => F("M32 9L48 27H38V44H26V27H16Z") + L("M10 53h44", 4),
  // Storefront: awning scallops over a shop.
  store: () => F("M8 13h48l-2 11a6 6 0 0 1-11 0 6 6 0 0 1-11 0 6 6 0 0 1-11 0 6 6 0 0 1-11 0z") + L("M12 30v22h40V30") + `<rect x="27" y="38" width="10" height="14" fill="url(#ig)"/>`,
  // Server rack.
  server: () => [14, 28, 42].map((y) => L(`M9 ${y}h46v10H9z`, 3.5) + `<circle cx="16" cy="${y + 5}" r="2.4" fill="url(#ig)"/>` + L(`M32 ${y + 5}h16`, 3)).join(""),
  // Shield with a tick: the checks before a scored run.
  shield: () => L("M32 8l20 7v15c0 12-8 21-20 26C20 51 12 42 12 30V15z") + G("M23 31l6 6 12-13", 5),
  // Nodes on a network: agents reached over A2A.
  network: () => L("M14 16L32 32 50 16M32 32v20", 3) + `<circle cx="32" cy="32" r="8" fill="url(#ig)"/>` + [[14, 16], [50, 16], [32, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${CHARCOAL}" stroke="${CREAM}" stroke-width="3.5"/>`).join(""),
  // Padlock.
  lock: () => L("M22 28V20a10 10 0 0 1 20 0v8", 5) + `<rect x="13" y="28" width="38" height="26" rx="5" fill="url(#ig)"/>` + `<circle cx="32" cy="39" r="4" fill="${INK}"/>` + F("M30 41h4v7h-4z", INK),
  // Lifebuoy: help when things break.
  buoy: () => `<circle cx="32" cy="32" r="18" fill="none" stroke="${CREAM}" stroke-width="10"/><circle cx="32" cy="32" r="18" fill="none" stroke="url(#ig)" stroke-width="10" stroke-dasharray="14.14 14.14" stroke-dashoffset="7.07"/>`,
};

const ICON_FOR = {
  "what-this-is": "spark", "how-a-run-works": "gear", "the-loop": "loop", "what-each-side-sees": "split",
  commands: "terminal", "sniffer-profiles": "sniffer", scoring: "chart", "watching-an-agent-work": "eye",
  "what-the-patterns-are": "check", "run-it": "play", "evaluation-console": "window", "typical-loop": "infinity",
  troubleshooting: "buoy", "repository-layout": "folder", deployment: "upload",
  "shops-on-vercel-honestpractice-deployments": "store", "shops-on-a-node-host-vm-container": "server",
  "before-any-scored-run-reaches-a-third-party-agent": "shield", "third-party-agents": "network", "secrets-and-data": "lock",
};

/** The illustration on its charcoal tile, scaled to `size` at (x, y). */
function tile(id, x, y, size) {
  const k = size / 64;
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(k)})"><rect width="64" height="64" rx="14" fill="${CHARCOAL}"/>${(ICONS[ICON_FOR[id]] ?? ICONS.spark)()}</g>`;
}

// ------------------------------------------------------------------ text

/** Outlined Poppins with a contrasting halo, so it reads on white, on dark and over the blades whatever the scheme. */
function text(str, x, base, size) {
  const d = font.getPath(str, x, base, size, { kerning: true }).toPathData(2);
  return { svg: `<path class="t" stroke-width="${r(size * 0.09)}" d="${d}"/>`, width: font.getAdvanceWidth(str, size, { kerning: true }) };
}

const DEFS = (W, H, top) => `<defs>
<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="${r(top)}" x2="0" y2="${H}"><stop offset="0" stop-color="#FBCB8E"/><stop offset=".55" stop-color="#F08C2E"/><stop offset="1" stop-color="#8447F2"/></linearGradient>
<linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBCB8E"/><stop offset=".52" stop-color="#F08C2E"/><stop offset="1" stop-color="#8447F2"/></linearGradient>
<linearGradient id="ig" gradientUnits="userSpaceOnUse" x1="0" y1="6" x2="0" y2="58"><stop offset="0" stop-color="#FBCB8E"/><stop offset=".52" stop-color="#F08C2E"/><stop offset="1" stop-color="#8447F2"/></linearGradient>
</defs>
<style>.t{fill:${INK};stroke:${CREAM};paint-order:stroke;stroke-linejoin:round}@media (prefers-color-scheme:dark){.t{fill:${CREAM};stroke:${INK}}}</style>`;

const wrap = (W, H, top, label, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
${DEFS(W, H, top)}${defs}
${body}
</svg>
`;

const W = 880;

/**
 * h1: the title rides a riptide. Each blade bobs on two travelling waves (outer <g> and inner <path>, different
 * periods), so the skyline rolls left to right. Blades translate rather than stretch, so the shear angle never
 * changes; each is drawn tall enough to stay anchored past the bottom edge at every point of the swell.
 * SMIL (<animateTransform>), not CSS: it runs in every viewer that shows the image, including ones that pause
 * CSS animation inside images for reduced-motion users.
 */
function h1(str) {
  const H = 164, size = 100, base = 85;
  const bw = 12, gap = 6;
  const A1 = 26, T1 = 5.2, K1 = 1.3; // long swell: amplitude (px), period (s), waves across the width
  const A2 = 12, T2 = 2.9, K2 = 3.1; // short chop
  const rest = (x) => 62 + 26 * Math.sin((x / W) * Math.PI * 1.6 + 0.4);
  const tx = (W - text(str, 0, base, size).width) / 2;
  const t = text(str, tx, base, size);
  const phase = (x, k, off) => 1 - (((x / W) * k + off) % 1);
  // One ease-in-out bob down by 2A and back; a negative begin starts each blade part-way through, so phase follows x.
  const bob = (A, T, ph) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${2 * A};0 0" keyTimes="0;.5;1" calcMode="spline" keySplines=".42 0 .58 1;.42 0 .58 1" dur="${T}s" begin="-${r(T * ph)}s" repeatCount="indefinite"/>`;
  const blades = [];
  for (let x = 0; x + bw <= W; x += bw + gap) {
    const top = H - (rest(x + bw / 2) + A1 + A2);
    const d = `M${r(x)} ${r(top + bw / 2)}L${r(x + bw)} ${r(top)}V${H + 2 * (A1 + A2) + 4}H${r(x)}Z`;
    blades.push(`<g>${bob(A1, T1, phase(x, K1, 0))}<path fill="url(#g)" d="${d}">${bob(A2, T2, phase(x, K2, 0.35))}</path></g>`);
  }
  // The wave dims under the word and stays bright at the edges.
  const a = r(Math.max(0, tx - 30) / W), b = r(Math.min(W, tx + t.width + 30) / W);
  const defs = `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="${a}" stop-color="#fff" stop-opacity=".4"/><stop offset="${b}" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>`;
  return wrap(W, H, H - 130, str, defs, `<g mask="url(#m)">${blades.join("")}</g>\n${t.svg}`);
}

/** h2: a skyline rising behind the heading toward its illustration tile on the right. */
function h2(str, id) {
  const H = 116, size = 42, base = 70, T = 84;
  const rand = rng(id);
  const t = text(str, 4, base, size);
  const bw = 10, gap = 6;
  // Heights grow from left to right with some jitter, so the skyline builds up to the tile.
  const sky = skyline(0, W - T - 10, H, bw, gap, (_, x) => 10 + (x / W) ** 1.4 * 74 + rand() * 18);
  const defs = `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="${r(Math.min(0.8, (t.width + 40) / W))}" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>`;
  return wrap(W, H, H - 102, str, defs, `<g mask="url(#m)">${sky}</g>\n${t.svg}\n${tile(id, W - T, (H - T) / 2 - 4, T)}`);
}

/** h3: illustration tile, the heading, then a low run of blades trailing off to the right. */
function h3(str, id) {
  const H = 72, size = 28, T = 56, base = 46;
  const rand = rng(id);
  const t = text(str, T + 16, base, size);
  const x0 = T + 16 + t.width + 20;
  const sky = skyline(x0, W, H - 10, 8, 6, (i) => 10 + rand() * 16 + Math.max(0, 8 - i) * 2.2, "url(#gb)");
  const defs = `<linearGradient id="fade" gradientUnits="userSpaceOnUse" x1="${r(x0)}" x2="${W}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>`;
  return wrap(W, H, 0, str, defs, `${tile(id, 0, (H - T) / 2, T)}\n${t.svg}\n<g mask="url(#m)">${sky}</g>`);
}

const RENDER = { 1: h1, 2: h2, 3: h3 };

// ------------------------------------------------------------------ README rewrite

function parse(line) {
  let m = line.match(/^(#{1,3}) (.+)$/);
  if (m) return { level: m[1].length, text: m[2].trim(), attrs: m[1].length === 1 ? ' align="center"' : "" };
  m = line.match(/^<h([1-3])((?: align="center")?)>(?:<a id="[^"]*"><\/a>)?(?:<img src="[^"]*" alt="([^"]*)"(?: width="\d+")?>|([^<]+))<\/h\1>$/);
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
  fs.writeFileSync(path.join(ROOT, DIR, `${id}.svg`), RENDER[h.level](h.text, id));
  used.add(`${id}.svg`);
  return `<h${h.level}${h.attrs}><a id="${id}"></a><img src="${DIR}/${id}.svg" alt="${esc(h.text)}" width="${W}"></h${h.level}>`;
});
fs.writeFileSync(README, lines.join("\n"));
const stale = fs.readdirSync(path.join(ROOT, DIR)).filter((f) => f.endsWith(".svg") && !used.has(f));
for (const f of stale) fs.rmSync(path.join(ROOT, DIR, f));
const missing = [...used].map((f) => f.slice(0, -4)).filter((id) => id !== "riptide" && !ICON_FOR[id]);
console.log(`${used.size} headings rendered${stale.length ? `; removed ${stale.join(", ")}` : ""}${missing.length ? `; no illustration yet (spark used): ${missing.join(", ")}` : ""}`);

import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { inflateRawSync } from "node:zlib";
import { build, type Plugin } from "esbuild";
import { ROOT } from "../paths.ts";
import { zipEntries } from "./run.ts";

/**
 * A live preview of an uploaded platform's frontend, built WITHOUT running the upload's code on our side:
 *  1. a `riptide-preview.(tsx|jsx|ts|js)` entry is bundled by esbuild (which only reads code) into one inline script;
 *     imports may only reach files inside the upload and React itself;
 *  2. otherwise a static build (out/, dist/, build/, public/ or the root with an index.html) is copied as files;
 *  3. otherwise there is no preview.
 * The console serves it with a sandbox CSP (opaque origin, no network), so the code only ever runs in the viewer's
 * browser, isolated from the console.
 */
export type Preview = { kind: "bundle" | "static"; note?: string } | { kind: "none"; note: string };

const MODULES = path.join(ROOT, "node_modules");
const REACT_ROOTS = ["react", "react-dom", "scheduler"].map((m) => path.join(MODULES, m) + path.sep);
const BARE_OK = /^(react|react-dom|scheduler)(\/.*)?$/;

const inside = (p: string, root: string) => p === root || p.startsWith(root + path.sep);

/** esbuild guard: the upload's own files and React, nothing else on this machine. */
const guard = (srcRoot: string): Plugin => ({
  name: "riptide-preview-guard",
  setup(b) {
    b.onResolve({ filter: /.*/ }, (args) => {
      if (args.kind === "entry-point") return undefined;
      const bare = !args.path.startsWith(".") && !path.isAbsolute(args.path);
      const fromReact = REACT_ROOTS.some((r) => (args.resolveDir + path.sep).startsWith(r));
      if (bare) return BARE_OK.test(args.path) ? undefined : { errors: [{ text: `preview may not import "${args.path}" (only the platform's own files and React)` }] };
      const target = path.resolve(args.resolveDir, args.path);
      if (inside(target, srcRoot) || (fromReact && REACT_ROOTS.some((r) => target.startsWith(r)))) return undefined;
      return { errors: [{ text: `preview may not import files outside the upload: ${args.path}` }] };
    });
  },
});

const HTML = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title.replace(/[<&]/g, "")}</title>
<style>body{margin:0;font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1b1814;background:#fbf7ef}</style></head><body><div id="root"></div>${body}</body></html>`;

async function bundle(entry: string, srcRoot: string, outDir: string, title: string) {
  const r = await build({
    entryPoints: [entry], bundle: true, write: false, outdir: path.join(outDir, "_build"), format: "iife", platform: "browser", target: "es2020",
    jsx: "automatic", minify: true, legalComments: "none", logLevel: "silent", absWorkingDir: srcRoot,
    define: { "process.env.NODE_ENV": '"production"' },
    loader: { ".png": "dataurl", ".jpg": "dataurl", ".svg": "dataurl", ".css": "css" },
    plugins: [guard(srcRoot)],
  });
  const js = r.outputFiles.find((f) => f.path.endsWith(".js"))?.text ?? "";
  const css = r.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";
  mkdirSync(outDir, { recursive: true });
  // Inline everything: one document, no separate requests to resolve under the sandbox.
  writeFileSync(path.join(outDir, "index.html"), HTML(title, `${css ? `<style>${css}</style>` : ""}<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`));
}

/** Copy the static site under `prefix` from the zip, with the same path checks as extraction. */
function copyStatic(buf: Buffer, prefix: string, outDir: string) {
  for (const e of zipEntries(buf)) {
    if (!e.name.startsWith(prefix) || e.dir || e.symlink) continue;
    const rel = e.name.slice(prefix.length);
    if (!rel || rel.startsWith("/") || rel.includes("\\") || rel.split("/").includes("..")) continue;
    const nameLen = buf.readUInt16LE(e.local + 26), extraLen = buf.readUInt16LE(e.local + 28);
    const data = buf.subarray(e.local + 30 + nameLen + extraLen, e.local + 30 + nameLen + extraLen + e.csize);
    const content = e.method === 0 ? data : e.method === 8 ? inflateRawSync(data, { maxOutputLength: Math.max(1, e.size) }) : null;
    if (!content) continue;
    const out = path.join(outDir, rel);
    if (!inside(out, outDir)) continue;
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, content);
  }
}

export async function buildPreview(zip: string, srcRoot: string, outDir: string, title: string): Promise<Preview> {
  rmSync(outDir, { recursive: true, force: true });
  const entry = ["", "src"].flatMap((d) => ["tsx", "jsx", "ts", "js"].map((x) => path.join(srcRoot, d, `riptide-preview.${x}`))).find((f) => existsSync(f));
  if (entry) {
    try {
      await bundle(entry, srcRoot, outDir, title);
      return { kind: "bundle" };
    } catch (e) {
      const errs = (e as { errors?: { text: string }[] }).errors?.map((x) => x.text).slice(0, 3).join("; ");
      return { kind: "none", note: `The preview entry did not build: ${errs ?? (e as Error).message}`.slice(0, 400) };
    }
  }
  const buf = readFileSync(zip);
  const names = zipEntries(buf).map((e) => e.name);
  const hit = names.filter((n) => /^(?:[^/]+\/)?(?:(?:out|dist|build|public)\/)?index\.html$/.test(n)).sort((a, b) => a.length - b.length)[0];
  if (hit) {
    copyStatic(buf, hit.slice(0, -"index.html".length), outDir);
    return { kind: "static", note: "Static build from the upload. Absolute asset paths (/assets/…) may not load inside the preview." };
  }
  return { kind: "none", note: "No preview: the upload has no static build (an index.html in out/, dist/, build/ or public/) and no riptide-preview entry. Source code is never built or run on the server." };
}

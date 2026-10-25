import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildPreview } from "./preview.ts";

// Inside the repo so React resolves from the repo's node_modules, as it does for real audits (data/audits/…).
const base = mkdtempSync(path.join(import.meta.dirname, ".preview-test-"));
after(() => rmSync(base, { recursive: true, force: true }));
const app = (name: string, files: Record<string, string>) => {
  const root = path.join(base, name, "src");
  for (const [f, c] of Object.entries(files)) { mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); writeFileSync(path.join(root, f), c); }
  return root;
};
const zipOf = (name: string, entries: [string, string][]) => {
  const file = path.join(base, `${name}.zip`);
  execFileSync("python3", ["-I", "-c", "import zipfile,sys,json\nz=zipfile.ZipFile(sys.argv[1],'w')\nfor n,c in json.loads(sys.argv[2]): z.writestr(n,c)\nz.close()", file, JSON.stringify(entries)]);
  return file;
};
const emptyZip = () => zipOf("empty", [["x/readme.md", "x"]]);

test("bundles a riptide-preview entry with React into one inline page", async () => {
  const root = app("ok", { "riptide-preview.tsx": 'import { createRoot } from "react-dom/client"; import { Page } from "./page"; createRoot(document.getElementById("root")!).render(<Page />);', "page.tsx": "export const Page = () => <h1>Hello cart</h1>;" });
  const out = path.join(base, "ok-out");
  const r = await buildPreview(emptyZip(), root, out, "OK");
  assert.equal(r.kind, "bundle");
  const html = readFileSync(path.join(out, "index.html"), "utf8");
  assert.match(html, /Hello cart/);
  assert.doesNotMatch(html, /<script src=/);
});

test("refuses imports outside the upload and non-React packages", async () => {
  writeFileSync(path.join(base, "secret.txt"), "TOP-SECRET");
  const escape = app("escape", { "riptide-preview.tsx": 'import s from "../../secret.txt"; console.log(s);' });
  const r1 = await buildPreview(emptyZip(), escape, path.join(base, "o1"), "x");
  assert.equal(r1.kind, "none");
  assert.match(r1.note ?? "", /outside the upload|did not build/);
  assert.equal(existsSync(path.join(base, "o1", "index.html")), false);
  const node = app("node", { "riptide-preview.tsx": 'import fs from "fs"; console.log(fs);' });
  const r2 = await buildPreview(emptyZip(), node, path.join(base, "o2"), "x");
  assert.equal(r2.kind, "none");
  assert.match(r2.note ?? "", /may not import "fs"/);
});

test("copies a static build when there is no preview entry", async () => {
  const root = app("static", { "index.ts": "export {}" });
  const z = zipOf("site", [["site/src/index.ts", "export {}"], ["site/dist/index.html", "<h1>Static</h1>"], ["site/dist/app.js", "console.log(1)"]]);
  const out = path.join(base, "o3");
  const r = await buildPreview(z, root, out, "x");
  assert.equal(r.kind, "static");
  assert.equal(readFileSync(path.join(out, "index.html"), "utf8"), "<h1>Static</h1>");
  assert.ok(existsSync(path.join(out, "app.js")));
});

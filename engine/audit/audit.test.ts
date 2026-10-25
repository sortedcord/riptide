import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { extract, score } from "./run.ts";

const tmp = mkdtempSync(path.join(os.tmpdir(), "riptide-audit-"));
after(() => rmSync(tmp, { recursive: true, force: true }));
/** Build a zip with Python's zipfile so we can include hostile entries. entries: [name, content | {symlink: target}] */
function zip(name: string, entries: [string, string | { symlink: string }][]) {
  const file = path.join(tmp, name);
  const py = `import zipfile,sys,json
z=zipfile.ZipFile(sys.argv[1],'w')
for n,c in json.loads(sys.argv[2]):
  if isinstance(c,dict):
    i=zipfile.ZipInfo(n); i.create_system=3; i.external_attr=(0o120777)<<16; z.writestr(i,c['symlink'])
  else: z.writestr(n,c)
z.close()`;
  execFileSync("python3", ["-I", "-c", py, file, JSON.stringify(entries)]);
  return file;
}

test("extract refuses path traversal and absolute paths", () => {
  assert.throws(() => extract(zip("evil1.zip", [["ok.txt", "x"], ["../escape.txt", "x"]]), path.join(tmp, "o1")), /unsafe path/);
  assert.throws(() => extract(zip("evil2.zip", [["/etc/x", "x"]]), path.join(tmp, "o2")), /unsafe path/);
  assert.equal(existsSync(path.join(tmp, "escape.txt")), false);
});

test("extract drops symlinks and junk folders, and unwraps a single top folder", () => {
  const z = zip("app.zip", [["app/src/page.tsx", "export {}"], ["app/node_modules/x/index.js", "x"], ["app/.git/HEAD", "x"], ["app/link", { symlink: "/etc/passwd" }]]);
  const { root, files } = extract(z, path.join(tmp, "o3"));
  assert.equal(path.basename(root), "app");
  assert.deepEqual(readdirSync(root).sort(), ["src"]);
  assert.equal(files, 1);
});

test("score is severity-weighted over applicable rules; missing rules are unclear, not scored", () => {
  const rules = [
    { id: "A", title: "a", source: "s", category: "c", severity: "critical" as const, binding: "law", violation: "", compliant: "" },
    { id: "B", title: "b", source: "s", category: "c", severity: "low" as const, binding: "law", violation: "", compliant: "" },
    { id: "C", title: "c", source: "s", category: "c", severity: "high" as const, binding: "law", violation: "", compliant: "" },
    { id: "D", title: "d", source: "s", category: "c", severity: "medium" as const, binding: "law", violation: "", compliant: "" },
  ];
  const r = score({ platform: { name: "x", kind: "k", summary: "s" }, rules: [
    { ruleId: "A", status: "compliant", evidence: [], explanation: "", recommendation: "" },
    { ruleId: "B", status: "violation", evidence: [], explanation: "", recommendation: "" },
    { ruleId: "C", status: "not_applicable", evidence: [], explanation: "", recommendation: "" },
  ] }, rules);
  assert.equal(r.score, 80); // compliant 4 / (4 + 1)
  assert.equal(r.readiness, 80);
  // A rule not yet in force counts for readiness only.
  const later = score({ platform: { name: "x", kind: "k", summary: "s" }, rules: [
    { ruleId: "A", status: "compliant", evidence: [], explanation: "", recommendation: "" },
    { ruleId: "B", status: "violation", evidence: [], explanation: "", recommendation: "" },
  ] }, [rules[0], { ...rules[1], effectiveFrom: "2027-01-01" }], "2026-10-25");
  assert.deepEqual([later.score, later.readiness], [100, 80]);
  assert.deepEqual(r.counts, { compliant: 1, violation: 1, not_applicable: 1, unclear: 1 });
  assert.equal(r.rows.find((x) => x.id === "D")!.status, "unclear");
});

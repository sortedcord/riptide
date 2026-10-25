import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { sandbox } from "./sandbox.ts";

const dir = mkdtempSync(path.join(os.tmpdir(), "riptide-sandbox-"));
mkdirSync(path.join(dir, "shops/market"), { recursive: true });
mkdirSync(path.join(dir, "shops/saas"), { recursive: true });
writeFileSync(path.join(dir, "shops/market/a.ts"), "x");
symlinkSync("/etc", path.join(dir, "shops/market/escape"));
after(() => rmSync(dir, { recursive: true, force: true }));
const box = sandbox(dir, "market");

test("reads stay inside the worktree (relative, absolute, ~, .., symlinks)", () => {
  assert.equal(box.inside("shops/market/a.ts"), path.join(dir, "shops/market/a.ts"));
  assert.equal(box.inside(path.join(dir, "shops/saas")), path.join(dir, "shops/saas")); // reading other shops is fine
  for (const p of ["../outside", "/etc/passwd", "~/.ssh/id_rsa", "shops/market/escape"]) assert.throws(() => box.inside(p), /outside the worktree/);
});

test("writes only under the shop (or trickster-output.json), never node_modules/.next", () => {
  assert.ok(box.writable("shops/market/new.ts"));
  assert.ok(box.writable("trickster-output.json"));
  for (const p of ["shops/saas/x.ts", "engine/cli.ts", "package.json", "shops/market/node_modules/x", "shops/market/.next/x"]) assert.throws(() => box.writable(p));
});

test("run allows only the listed commands, relative paths, no shell", () => {
  for (const c of ["rm -rf .", "npm run build -w shops/saas", "npm install", "git push", "bash -c ls", "ls /etc", "grep -r x ../", "git diff --output=/tmp/x"]) assert.throws(() => box.run(c), /not allowed|relative paths/);
  assert.match(box.run("ls shops"), /market/);
  assert.match(box.run("ls shops; rm -rf ."), /exit/); // `;` is just an argument to ls, never a shell
});

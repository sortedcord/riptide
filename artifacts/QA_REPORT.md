# Riptide QA report

Suite: `playwright.config.ts` + `tests/` (root). Run: `QA_PORT_OFFSET=1000 npm test` (or `npm test` when nothing else holds ports 3001–3005).
Last run: 2026-10-24, fresh `next build` of every shop from this checkout, served on 4001–4005. **38 passed, 2 skipped, 0 failed.**

| §9 category | market | food | air | saas | ott |
|---|---|---|---|---|---|
| 9.1 honest path, payment total = engine total | pass (₹2,506) | pass (₹365.28) | pass (₹4,504) | pass (₹3,538.82) | pass (₹531) |
| 9.2 honest invariants | pass | pass | pass | pass | pass |
| 9.3 every slot renders on its step | pass | pass | pass | pass | pass |
| 9.4 `_neutral-test` overrides visible | pass | pass | pass | pass | pass |
| 9.5 cancel ≤2 clicks, confirm present (never clicked) | pass (2 clicks, Plus member) | skipped (no cancel flow) | skipped (no cancel flow) | pass (1 click) | pass (1 click) |
| 9.6 no console errors / failed requests, screenshots | pass | pass | pass | pass | pass |
| 9.7a unknown variant → 404 | pass | pass | pass | pass | pass |
| 9.7b invalid manifest → `[riptide]` error | pass | pass | pass | pass | pass |

## App bugs

None found. No test is marked `test.fail()`.

To log one: keep the assertion strict, add `test.fail(shopOf() === "<shop>", "<summary>")` with a comment in the failing test, and add an entry here with shop, step, selector, expected vs actual and a suggested fix.

## Notes

- **Port collision (environment, not an app bug).** During this session the reviewer's worktree (`.claude/worktrees/agent-…/shops/{food,saas,ott}`) was serving on 3002, 3004 and 3005. With `reuseExistingServer: true`, a plain `npm test` attaches to whatever is on those ports and tests that code. In one run it returned 404 for the temporary invalid manifest because the file was written to this checkout. Use `QA_PORT_OFFSET=1000` while anyone else is running shops.
- 9.7b: production builds redact server error messages from the page, so the `[riptide]` text is read from the server log (`$TMPDIR/riptide-qa-logs/{shop}.log`). The config's `webServer` writes that log. If the suite reuses a server it didn't start, the log is missing and 9.7b fails with a message saying so.
- 9.2 (a) treats a pressed "No, thanks" / "Keep" button inside an add-on card as the honest default. For example, air add-ons and the saas storage upsell set `aria-pressed=true` on decline.
- The old per-shop 390px overflow checks and ott's "every title page renders" check were outside §9 and were not carried over.
- `shops/*/README.md` still describe the deleted per-shop test commands. Those files belong to the shops, so they were left unchanged.

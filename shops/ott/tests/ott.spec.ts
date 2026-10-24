import { expect, test, type Page } from "@playwright/test";
import { computePrice } from "../../_core/pricing";
import { config } from "../shop.config";

const V = "/honest";

/** Fail the test on any console error or uncaught page error (unregistered <Slot> ids log errors). */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

/** Record every data-dp id visible on the current page, keyed by its data-riptide-step. */
async function collect(page: Page, seen: Map<string, Set<string>>) {
  const step = await page.locator("[data-riptide-step]").first().getAttribute("data-riptide-step");
  const ids = await page.locator("[data-dp]").evaluateAll((els) => els.map((e) => e.getAttribute("data-dp")!));
  const set = seen.get(step!) ?? new Set();
  ids.forEach((i) => set.add(i));
  seen.set(step!, set);
}

/** Walk the honest purchase flow with the Standard plan and no extras. */
async function walkToPayment(page: Page, base: string, seen?: Map<string, Set<string>>) {
  await page.goto(`${base}/plans?reset=1`);
  await expect(page.locator('[data-riptide-step="plans"]')).toBeVisible();
  await page.getByRole("button", { name: "Select Standard" }).click();
  if (seen) await collect(page, seen);
  await page.locator('[data-dp="plans.cta.continue"]').click();
  await expect(page.locator('[data-riptide-step="signup-email"]')).toBeVisible();
  await page.getByRole("button", { name: "Use demo email" }).click();
  if (seen) await collect(page, seen);
  await page.locator('[data-dp="signup-email.form.continue"]').click();
  await expect(page.locator('[data-riptide-step="signup-password"]')).toBeVisible();
  if (seen) await collect(page, seen);
  await page.getByRole("button", { name: "Continue as demo user" }).click();
}

async function reviewToPayment(page: Page, seen?: Map<string, Set<string>>) {
  await expect(page.locator('[data-riptide-step="signup-plan"]')).toBeVisible();
  if (seen) await collect(page, seen);
  await page.locator('[data-dp="signup-plan.cta.continue"]').click();
  await expect(page.locator('[data-riptide-step="payment"]')).toBeVisible();
  if (seen) await collect(page, seen);
}

test("honest path reaches payment with the engine total, every slot renders on its step, no console errors", async ({ page }) => {
  const errors = watchConsole(page);
  const seen = new Map<string, Set<string>>();

  for (const path of ["", "/browse", "/search", "/title/the-salt-ledger", "/account", "/account/cancel"]) {
    await page.goto(`${V}${path}`);
    await page.waitForLoadState("networkidle");
    await collect(page, seen);
  }

  await walkToPayment(page, V, seen);

  // Honest invariants on the review step: nothing optional pre-selected, accept/decline equal weight.
  await expect(page.locator('[data-dp="signup-plan.optin.marketing"] input')).not.toBeChecked();
  const add = page.locator('[data-dp="signup-plan.addons.extra-member-add"]');
  const decline = page.locator('[data-dp="signup-plan.addons.extra-member-decline"]');
  await expect(add).toHaveAttribute("aria-pressed", "false");
  expect(await add.getAttribute("data-variant")).toBe(await decline.getAttribute("data-variant"));
  const reviewTotal = await page.locator('[data-dp="signup-plan.summary.total"]').innerText();

  await reviewToPayment(page, seen);
  const expected = computePrice(config, { ...config.initialState, plan: "standard" }, [], "payment").total;
  const total = await page.locator('[data-dp="payment.summary.total"]').innerText();
  expect(Number(total.replace(/[^\d.]/g, ""))).toBe(expected);
  expect(total).toBe(reviewTotal); // never increases between steps
  await expect(page.locator('[data-dp="payment.summary.line.gst"]')).toBeVisible();

  for (const def of config.registry) {
    expect(seen.get(def.step)?.has(def.id), `${def.id} on step ${def.step}`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("cancel flow: confirm button reachable in ≤2 clicks from account (never clicked)", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto(`${V}/account?reset=1`);
  await expect(page.locator('[data-dp="account.billing.next"]')).toContainText("12 Nov 2026");
  await page.locator('[data-dp="account.membership.cancel"]').click(); // click 1
  await expect(page.locator('[data-riptide-step="cancel"]')).toBeVisible();
  const confirm = page.locator('[data-dp="account.cancel.confirm"]');
  await expect(confirm).toBeVisible();
  await expect(confirm).toHaveText("Cancel membership");
  await expect(page.locator('[data-dp="account.cancel.notice"]')).toContainText("11 Nov 2026");
  expect(await confirm.getAttribute("data-variant")).toBe(await page.locator('[data-dp="account.cancel.keep"]').getAttribute("data-variant"));
  expect(errors).toEqual([]);
});

test("neutral manifest: every override is visible", async ({ page }) => {
  const errors = watchConsole(page);
  const N = "/_neutral-test";
  await page.goto(`${N}?reset=1`);
  await expect(page.locator('[data-dp="home.hero.title"]')).toHaveText("Films and series worth staying in for."); // setText
  await expect(page.locator('[data-dp="home.hero.demo"]')).toHaveAttribute("data-variant", "secondary"); // setVariant
  await expect(page.locator('[data-dp="home.features.kids"]')).toHaveCount(0); // hide
  await expect(page.locator('[data-dp="home.promo.info"]')).toContainText("four original documentaries"); // insertBlock
  const order = await page.locator('[data-dp="footer.links.list"] > [data-dp]').evaluateAll((els) => els.map((e) => e.getAttribute("data-dp")));
  expect(order).toEqual(["footer.links.privacy", "footer.links.terms", "footer.links.cancellation", "footer.links.help"]); // reorder
  await expect(page.locator('meta[name="riptide-variant"]')).toHaveAttribute("content", "_neutral-test"); // setHead

  await walkToPayment(page, N);
  // (on plans) setAttr, addLine, setLine are checked on the way back below
  await expect(page.locator('[data-riptide-step="profile-setup"]')).toBeVisible(); // insertStep
  await page.getByRole("button", { name: "Continue" }).or(page.getByRole("link", { name: "Continue" })).first().click();
  await reviewToPayment(page);
  await expect(page.locator('[data-dp="payment.summary.line.setup"]')).toContainText("Account setup (free)"); // addLine
  await expect(page.locator('[data-dp="payment.summary.line.gst"]')).toContainText("Goods and Services Tax (18%)"); // setLine
  await expect(page.locator("#rt-tab-card")).toHaveAttribute("aria-selected", "true"); // setDefault

  await page.goto(`${N}/plans`);
  await expect(page.locator('[data-dp="plans.cta.continue"]')).toHaveAttribute("title", "Continue to sign-up with the selected plan"); // setAttr
  await expect(page.locator('[data-dp="plans.summary.line.setup"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("every title, policy and search page renders without console errors", async ({ page }) => {
  const errors = watchConsole(page);
  const { TITLES } = await import("../lib/catalogue");
  expect(TITLES.length).toBeGreaterThanOrEqual(60);
  for (const t of TITLES) {
    await page.goto(`${V}/title/${t.id}`);
    await expect(page.locator("h1")).toHaveText(t.title);
  }
  for (const p of ["help", "terms", "cancellation", "privacy"]) await page.goto(`${V}/policies/${p}`);
  await page.goto(`${V}/search?q=zzzz`);
  await expect(page.getByText("No matches")).toBeVisible();
  await page.goto(`${V}/search?genre=crime&kind=series`);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

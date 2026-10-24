/**
 * Prism Studio smoke test. Run against a started server:
 *   (cd shops/saas && npx next start -p 3004) & npx playwright test shops/saas/tests
 * Never clicks account.cancel.confirm.
 */
import { expect, test, type Page } from "@playwright/test";

const BASE = process.env.SAAS_URL ?? "http://localhost:3004";
type Slot = { id: string; step: string };

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${page.url()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
  return errors;
}

const seen: Record<string, Set<string>> = {};
async function record(page: Page) {
  await page.waitForLoadState("networkidle");
  const step = await page.locator("[data-riptide-step]").first().getAttribute("data-riptide-step");
  const ids = await page.locator("[data-dp]").evaluateAll((els) => els.map((e) => e.getAttribute("data-dp")!));
  (seen[step!] ??= new Set()).add("__visited");
  ids.forEach((i) => seen[step!].add(i));
  return step;
}
const dp = (page: Page, id: string) => page.locator(`[data-dp="${id}"]`);

test.describe.configure({ mode: "serial" });

test("honest buy flow reaches payment with the engine total; every slot renders on its step", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto(`${BASE}/honest?reset=1`);
  expect(await record(page)).toBe("home");
  await page.goto(`${BASE}/honest/apps/lumen`);
  expect(await record(page)).toBe("app");
  await page.goto(`${BASE}/honest/search?q=pdf`);
  expect(await record(page)).toBe("search");
  await page.goto(`${BASE}/honest/policies/cancellation`);
  expect(await record(page)).toBe("policies");

  await page.goto(`${BASE}/honest/pricing`);
  expect(await record(page)).toBe("plans");
  // Honest defaults: monthly term, nothing pre-selected beyond it.
  await expect(page.locator('input[name="term"][value="monthly"]')).toBeChecked();
  await expect(dp(page, "plans.all.price")).toHaveText("₹2,999/mo");
  await expect(dp(page, "plans.all.trial-terms")).toContainText("7 Nov 2026");
  await dp(page, "plans.all.buy").click();

  await expect(page.locator('[data-riptide-step="signup"]')).toBeVisible();
  expect(await record(page)).toBe("signup");
  await dp(page, "signup.demo.continue").click();

  await expect(page.locator('[data-riptide-step="review"]')).toBeVisible();
  expect(await record(page)).toBe("review");
  await expect(dp(page, "review.optin.marketing").locator("input")).not.toBeChecked();
  await expect(dp(page, "review.upsell.add")).toHaveAttribute("data-variant", "secondary");
  await expect(dp(page, "review.upsell.decline")).toHaveAttribute("data-variant", "secondary");
  const reviewTotal = await dp(page, "review.summary.total").textContent();
  expect(reviewTotal).toBe("₹3,538.82"); // 2,999 + 18% GST
  await dp(page, "review.cta.continue").click();

  await expect(page.locator('[data-riptide-step="payment"]')).toBeVisible();
  expect(await record(page)).toBe("payment");
  await expect(dp(page, "payment.summary.total")).toHaveText(reviewTotal!);
  await expect(dp(page, "payment.summary.line.storage")).toHaveCount(0);

  // Account + cancel (≤2 clicks; stop before confirm)
  await page.goto(`${BASE}/honest/account`);
  expect(await record(page)).toBe("account");
  await expect(dp(page, "account.billing.next")).toHaveText("₹3,538.82 on 14 Nov 2026");
  await dp(page, "account.plan.cancel").click(); // click 1
  await expect(page.locator('[data-riptide-step="cancel"]')).toBeVisible();
  expect(await record(page)).toBe("cancel");
  await expect(dp(page, "account.cancel.confirm")).toBeVisible(); // click 2 would confirm
  await expect(dp(page, "account.cancel.confirm")).toHaveAttribute("data-variant", "secondary");
  await expect(dp(page, "account.cancel.keep")).toHaveAttribute("data-variant", "secondary");
  await page.goto(`${BASE}/honest/account/cancelled`);
  expect(await record(page)).toBe("cancelled");

  const { slots } = (await (await page.request.get(`${BASE}/api/slots`)).json()) as { slots: Slot[] };
  const missing = slots.filter((s) => !seen[s.step]?.has(s.id)).map((s) => `${s.id} (step ${s.step})`);
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test("trial flow: nothing due today", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto(`${BASE}/honest/pricing?reset=1`);
  await page.locator('input[name="term"][value="annual-monthly"]').check();
  await dp(page, "plans.single.trial").click();
  await dp(page, "signup.demo.continue").click();
  await expect(dp(page, "review.summary.total")).toHaveText("₹0");
  await expect(dp(page, "review.billing.terms")).toContainText("7 Nov 2026");
  await dp(page, "review.cta.continue").click();
  await expect(dp(page, "payment.summary.total")).toHaveText("₹0");
  expect(errors).toEqual([]);
});

test("neutral manifest: every override is visible", async ({ page }) => {
  const errors = watchConsole(page);
  const V = `${BASE}/_neutral-test`;
  await page.goto(`${V}?reset=1`);
  await expect(dp(page, "home.hero.title")).toHaveText("One studio for every creative app you use."); // setText
  await expect(dp(page, "home.hero.cta")).toHaveAttribute("data-variant", "secondary"); // setVariant
  await expect(dp(page, "home.promo.info")).toContainText("Framewise 4.0"); // insertBlock
  await expect(dp(page, "footer.links.careers")).toHaveCount(0); // hide
  const order = await dp(page, "footer.links.list").locator("> [data-dp]").evaluateAll((e) => e.map((x) => x.getAttribute("data-dp")));
  expect(order).toEqual(["footer.links.privacy", "footer.links.terms", "footer.links.refunds", "footer.links.help"]); // reorder
  await expect(page.locator('meta[name="riptide-variant"]')).toHaveAttribute("content", "_neutral-test"); // setHead

  await page.goto(`${V}/pricing`);
  await dp(page, "plans.all.buy").click();
  await dp(page, "signup.demo.continue").click();
  await expect(page.locator('[data-riptide-step="team-notes"]')).toBeVisible(); // insertStep
  await page.getByLabel("Notes for onboarding").fill("Two designers, one editor.");
  await page.getByRole("link", { name: "Continue to review" }).click();
  await expect(page.locator('[data-riptide-step="review"]')).toBeVisible();
  await expect(dp(page, "review.fees.gst")).toContainText("GST (18%, IGST)"); // setLine
  await expect(dp(page, "review.summary.line.invoice")).toContainText("GST invoice by email (free)"); // addLine
  await expect(dp(page, "review.summary.total")).toHaveText("₹3,538.82"); // ₹0 line changes nothing
  await expect(dp(page, "review.cta.continue")).toHaveAttribute("title", "Continue to the payment page"); // setAttr
  await dp(page, "review.cta.continue").click();
  await expect(page.locator("#rt-tab-card")).toHaveAttribute("aria-selected", "true"); // setDefault
  await expect(dp(page, "payment.summary.line.invoice")).toBeVisible();
  await expect(dp(page, "payment.summary.total")).toHaveText("₹3,538.82");
  expect(errors).toEqual([]);
});

test("mobile 390px: no horizontal scroll on key pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const p of ["", "/pricing", "/account", "/apps/framewise"]) {
    await page.goto(`${BASE}/honest${p}`);
    await page.waitForLoadState("networkidle");
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, p || "/").toBeLessThanOrEqual(0);
  }
});

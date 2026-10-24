import { expect, test, type Page } from "@playwright/test";

type SlotDef = { id: string; step: string };
const inr = (s: string | null) => Number((s ?? "").replace(/[^\d.-]/g, ""));

/** Records console errors and every data-dp seen per data-riptide-step. */
function watch(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  const seen = new Map<string, Set<string>>();
  const snap = async () => {
    await page.waitForLoadState("networkidle");
    const r = await page.evaluate(() => ({
      step: document.querySelector("[data-riptide-step]")?.getAttribute("data-riptide-step") ?? "",
      steps: [...document.querySelectorAll("[data-riptide-step]")].map((e) => e.getAttribute("data-riptide-step")!),
      ids: [...document.querySelectorAll("[data-dp]")].map((e) => e.getAttribute("data-dp")!),
    }));
    for (const s of r.steps) {
      const set = seen.get(s) ?? new Set();
      r.ids.forEach((i) => set.add(i));
      seen.set(s, set);
    }
    return r.step;
  };
  return { errors, seen, snap };
}

async function honestPurchase(page: Page, snap: () => Promise<string>, { plus = false } = {}) {
  await page.goto("/honest?reset=1");
  expect(await snap()).toBe("home");
  await page.getByRole("searchbox", { name: "Search Cartwheel" }).fill("earbuds");
  await page.getByRole("button", { name: "Search" }).click();
  await page.waitForURL(/search\?q=earbuds/);
  expect(await snap()).toBe("search");
  await page.getByRole("link", { name: /Noisewave N2 Wireless Earbuds/ }).first().click();
  await page.waitForURL(/product\//);
  expect(await snap()).toBe("product");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: /View cart/ }).click();
  await page.waitForURL(/\/cart$/);
  expect(await snap()).toBe("cart");
  // Honest invariant: nothing optional is ticked by default.
  expect(await page.locator("main input[type=checkbox]:checked").count()).toBe(0);
  const cartTotal = inr(await page.locator('[data-dp="cart.summary.total"]').textContent());
  expect(cartTotal).toBe(2499 + 7); // item + platform fee; delivery is free over ₹499
  await page.getByRole("link", { name: "Proceed to checkout" }).click();
  await page.waitForURL(/checkout/);
  expect(await snap()).toBe("checkout");
  await page.getByRole("button", { name: "Use saved address" }).click();
  expect(await page.locator('[data-dp="checkout.delivery.standard"] input').isChecked()).toBe(true);
  for (const [a, b] of [["checkout.plus.add", "checkout.plus.decline"]]) {
    expect(await page.locator(`[data-dp="${a}"]`).getAttribute("data-variant")).toBe(await page.locator(`[data-dp="${b}"]`).getAttribute("data-variant"));
  }
  if (plus) await page.getByRole("button", { name: "Add Plus" }).click();
  await page.getByRole("button", { name: "Continue to review" }).click();
  await page.waitForURL(/review/);
  expect(await snap()).toBe("review");
  expect(await page.locator('[data-dp="review.optin.marketing"] input').isChecked()).toBe(false);
  const reviewTotal = inr(await page.locator('[data-dp="review.summary.total"]').textContent());
  expect(reviewTotal).toBe(cartTotal + (plus ? 999 : 0));
  await page.getByRole("link", { name: "Continue to payment" }).click();
  await page.waitForURL(/payment/);
  expect(await snap()).toBe("payment");
  const payTotal = inr(await page.locator('[data-dp="payment.summary.total"]').textContent());
  const lines = await page.locator('[data-dp^="payment.summary.line."] > span:last-child').allTextContents();
  expect(payTotal).toBe(reviewTotal);
  expect(lines.reduce((s, t) => s + inr(t), 0)).toBe(payTotal);
  return payTotal;
}

test("honest flow reaches payment; every slot renders on its step; no console errors", async ({ page, request }) => {
  const { errors, seen, snap } = watch(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await honestPurchase(page, snap);

  // Browse pages outside the purchase walk.
  await page.goto("/honest/search"); await snap();
  await page.goto("/honest/policies/terms"); await snap();

  // Second walk: add Plus, pay, then the cancel flow up to (not including) the final confirm.
  await honestPurchase(page, snap, { plus: true });
  await page.getByRole("button", { name: /^Pay / }).click();
  await page.waitForURL(/sandbox-complete/);
  await page.goto("/honest/account");
  expect(await snap()).toBe("account");
  await page.getByRole("link", { name: "Manage membership" }).click();
  await page.waitForURL(/membership$/);
  expect(await snap()).toBe("membership");
  await page.getByRole("link", { name: "Cancel membership" }).click();
  await page.waitForURL(/cancel$/);
  expect(await snap()).toBe("cancel");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator('[data-dp="account.cancel.confirm"]')).toBeVisible();
  await snap();
  // Account page reaches the cancel screen in 1 click via account.membership.cancel too.
  await page.goto("/honest/account"); await snap();
  await expect(page.locator('[data-dp="account.membership.cancel"]')).toBeVisible();

  const { slots } = (await (await request.get("/api/slots")).json()) as { slots: SlotDef[] };
  const missing = slots.filter((s) => !seen.get(s.step)?.has(s.id)).map((s) => `${s.id} (${s.step})`);
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  const { errors } = watch(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/honest", "/honest/search?cat=electronics", "/honest/product/orvio-nova-5g", "/honest/cart"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("_neutral-test applies every override", async ({ page }) => {
  const { errors } = watch(page);
  await page.goto("/_neutral-test?reset=1");
  await expect(page.locator('[data-dp="home.hero.title"]')).toHaveText("Everything you need, delivered with care.");
  await expect(page.locator('[data-dp="home.deals.title"]')).toHaveText("Deals of the day");
  await expect(page.locator('[data-dp="home.promo.info"]')).toHaveText("Free returns within 7 days on most items.");
  await expect(page.locator('[data-dp="footer.links.help"]')).toHaveCount(0);
  const order = await page.locator('[data-dp="footer.links.list"] > [data-dp]').evaluateAll((els) => els.map((e) => e.getAttribute("data-dp")));
  expect(order.indexOf("footer.links.privacy")).toBeLessThan(order.indexOf("footer.links.terms"));
  expect(await page.locator('meta[name="riptide-variant"]').getAttribute("content")).toBe("_neutral-test");

  await page.goto("/_neutral-test/product/noisewave-n2-earbuds");
  await expect(page.locator('[data-dp="product.cta.buy"]')).toHaveAttribute("data-variant", "ghost");
  await expect(page.locator('[data-dp="product.seller.note"]')).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/_neutral-test/cart");
  await expect(page.locator('[data-dp="cart.summary.line.packaging"]')).toContainText("Packaging (free)");
  await expect(page.locator('[data-dp="cart.fees.platform"]')).toContainText("Platform fee (covers payment processing)");
  await expect(page.locator('[data-dp="cart.cta.checkout"]')).toHaveAttribute("title", "Continue to address and delivery");
  await page.getByRole("link", { name: "Proceed to checkout" }).click();
  await page.waitForURL(/step\/purchase\/order-notes/);
  await expect(page.locator('[data-riptide-step="order-notes"]')).toBeVisible();
  await page.getByRole("link", { name: "Continue to address" }).click();
  await page.waitForURL(/checkout/);
  await page.goto("/_neutral-test/payment");
  await expect(page.locator("#rt-tab-card")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-dp="payment.summary.line.packaging"]')).toBeVisible();
  expect(errors).toEqual([]);
});

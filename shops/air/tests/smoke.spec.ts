import { expect, test, type Page } from "@playwright/test";

type Slot = { id: string; step: string };
const money = (s: string | null) => Number((s ?? "").replace(/[^\d.]/g, ""));

/** Walk the purchase flow to payment, recording which data-dp ids rendered on which step. */
async function walk(page: Page, variant: string, seen: Map<string, Set<string>>, opts: { paidSeat?: boolean } = {}) {
  const record = async () => {
    const step = await page.locator("[data-riptide-step]").first().getAttribute("data-riptide-step");
    const ids = await page.$$eval("[data-dp]", (els) => els.map((e) => e.getAttribute("data-dp")!));
    const set = seen.get(step!) ?? new Set();
    ids.forEach((i) => set.add(i));
    seen.set(step!, set);
    return step;
  };
  await page.goto(`/${variant}?reset=1`);
  await page.locator("#from").click();
  await page.getByRole("button", { name: "From: New Delhi" }).click();
  await page.locator("#to").click();
  await page.getByRole("button", { name: "To: Mumbai" }).click();
  await record();
  await page.getByRole("button", { name: "Search flights" }).click();

  await expect(page.locator('[data-riptide-step="results"]')).toBeVisible();
  await record();
  await page.getByRole("button", { name: /^Select Saver on/ }).first().click();
  await expect(page.locator('[data-dp="results.fees.convenience"]')).toBeVisible();
  await record();
  const resultsTotal = money(await page.locator('[data-dp="results.summary.total"]').textContent());
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await expect(page.locator('[data-riptide-step="fare"]')).toBeVisible();
  await record();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await expect(page.locator('[data-riptide-step="passengers"]')).toBeVisible();
  await page.getByRole("button", { name: "Use saved traveller" }).click();
  await page.getByRole("button", { name: /Ananya Rao/ }).click();
  await page.getByRole("button", { name: "Use saved contact details" }).click();
  await expect(page.locator('[data-dp="passengers.optin.marketing"] input')).not.toBeChecked();
  await record();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  if (variant === "_neutral-test") {
    await expect(page.locator('[data-riptide-step="trip-notes"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trip notes" })).toBeVisible();
    await page.getByRole("link", { name: "Continue to seats" }).click();
  }

  await expect(page.locator('[data-riptide-step="seats"]')).toBeVisible();
  await expect(page.locator('[data-dp="seats.map.xl"]').first()).toBeVisible();
  await record();
  if (opts.paidSeat) {
    await page.locator('[data-dp="seats.map.xl"]:not([disabled])').first().click();
    await record();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  } else {
    await page.getByRole("button", { name: "Skip seat selection" }).click();
  }

  await expect(page.locator('[data-riptide-step="addons"]')).toBeVisible();
  for (const k of ["baggage", "meal", "insurance"]) await expect(page.locator(`[data-dp="addons.${k}.card"]`)).not.toHaveClass(/is-on/);
  await record();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await expect(page.locator('[data-riptide-step="review"]')).toBeVisible();
  await record();
  const reviewTotal = money(await page.locator('[data-dp="review.summary.total"]').textContent());
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page.locator('[data-riptide-step="payment"]')).toBeVisible();
  await expect(page.locator('[data-dp="payment.pay.button"]')).toBeEnabled();
  await record();
  const payTotal = money(await page.locator('[data-dp="payment.summary.total"]').textContent());
  const lineSum = (await page.$$eval('[data-dp^="payment.summary.line."] span:last-child', (els) => els.map((e) => e.textContent)))
    .reduce((t, s) => t + money(s), 0);
  return { resultsTotal, reviewTotal, payTotal, lineSum };
}

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test("honest flow reaches payment; totals match engine; every slot renders on its step", async ({ page, request }) => {
  const errors = watchConsole(page);
  const seen = new Map<string, Set<string>>();
  const t = await walk(page, "honest", seen);
  expect(t.payTotal).toBe(t.reviewTotal);
  expect(t.payTotal).toBe(t.lineSum);
  expect(t.payTotal).toBe(t.resultsTotal); // no extras chosen: total never rose
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.locator('[data-riptide-step="complete"]')).toBeVisible();

  // Second walk choosing a paid seat (Saver) so the paid seat line is exercised.
  const t2 = await walk(page, "honest", seen, { paidSeat: true });
  expect(t2.payTotal).toBe(t2.lineSum);
  expect(t2.payTotal).toBe(t2.resultsTotal + 1450);

  const { slots } = (await (await request.get("/api/slots")).json()) as { slots: Slot[] };
  const missing = slots.filter((s) => !seen.get(s.step)?.has(s.id)).map((s) => `${s.step}:${s.id}`);
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test("neutral-test manifest: every override is visible", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/_neutral-test?reset=1");
  await expect(page.locator('[data-dp="search.hero.title"]')).toHaveText("Book domestic flights with every fee shown upfront.");
  await expect(page.locator('[data-dp="search.hero.subtitle"]')).toHaveCount(0);
  await expect(page.locator('[data-dp="search.promo.info"]')).toHaveText("Web check-in opens 48 hours before departure.");
  await expect(page.locator('[data-dp="search.cta.search"]')).toHaveAttribute("title", "Search Skyline Air flights");
  const order = await page.$$eval('[data-dp="footer.links.list"] > [data-dp]', (els) => els.map((e) => e.getAttribute("data-dp")));
  expect(order.indexOf("footer.links.terms")).toBeLessThan(order.indexOf("footer.links.baggage"));
  await expect(page.locator('meta[name="riptide-variant"]')).toHaveAttribute("content", "_neutral-test");

  const seen = new Map<string, Set<string>>();
  const t = await walk(page, "_neutral-test", seen);
  expect(seen.get("results")?.has("results.summary.line.eticket")).toBe(true);
  expect(seen.get("payment")?.has("payment.summary.line.eticket")).toBe(true);
  await expect(page.locator('[data-dp="payment.summary.line.convenience"]')).toContainText("Convenience fee (online booking)");
  await expect(page.getByRole("tab", { name: "Card" })).toHaveAttribute("aria-selected", "true");
  expect(t.payTotal).toBe(t.resultsTotal);
  await page.goBack(); // review: setVariant applied
  await expect(page.locator('[data-dp="review.cta.continue"]')).toHaveAttribute("data-variant", "secondary");
  expect(errors).toEqual([]);
});

test("mobile 390px: search to results works", async ({ page }) => {
  const errors = watchConsole(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/honest?reset=1");
  await page.getByRole("button", { name: /^Bengaluru\s+New Delhi/ }).click();
  await page.getByRole("button", { name: "Search flights" }).click();
  await expect(page.locator('[data-riptide-step="results"]')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
});

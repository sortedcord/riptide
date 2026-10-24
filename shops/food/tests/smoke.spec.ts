import { expect, test, type Page } from "@playwright/test";

type Slot = { id: string; step: string };

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

/** Record every data-dp id visible on the current step. */
async function collect(page: Page, seen: Map<string, Set<string>>) {
  const step = await page.locator("[data-riptide-step]").first().getAttribute("data-riptide-step");
  const ids = await page.$$eval("[data-dp]", (els) => els.map((e) => e.getAttribute("data-dp")!));
  const set = seen.get(step!) ?? new Set();
  ids.forEach((i) => set.add(i));
  seen.set(step!, set);
}

test("honest flow reaches payment with the engine total and renders every slot", async ({ page, request }) => {
  const errors = watchConsole(page);
  const seen = new Map<string, Set<string>>();

  await page.goto("/honest/location?reset=1");
  await collect(page, seen);
  await page.getByRole("button", { name: "Deliver to Home" }).click();
  await expect(page.locator('[data-riptide-step="home"]')).toBeVisible();
  await collect(page, seen);

  await page.getByRole("link", { name: /Tandoor Tales/ }).click();
  await expect(page.locator('[data-riptide-step="restaurant"]')).toBeVisible();
  await page.getByRole("button", { name: "Add Paneer Tikka" }).click();
  const dialog = page.locator("dialog.ff-modal");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "Add Paneer Tikka" }).click();
  await expect(dialog).toBeVisible();
  await collect(page, seen);
  await page.locator('[data-dp="restaurant.customise.add"]').click();
  await expect(dialog).toHaveCount(0);
  await collect(page, seen);
  await page.locator('[data-dp="restaurant.cart.cta"]').click();

  await expect(page.locator('[data-riptide-step="cart"]')).toBeVisible();
  await expect(page.locator('[data-dp="cart.fees.delivery"]')).toContainText("₹39");
  await expect(page.locator('[data-dp="cart.bill.total"]')).toHaveText("₹365.28");
  await page.locator('[data-dp="cart.pass.decline"]').click();
  await collect(page, seen);
  await page.locator('[data-dp="cart.cta.checkout"]').click();

  await expect(page.locator('[data-riptide-step="checkout"]')).toBeVisible();
  await expect(page.locator('[data-dp="checkout.tip.option-none"]')).toHaveAttribute("aria-checked", "true");
  for (const id of ["checkout.donation.checkbox", "checkout.cutlery.toggle", "checkout.optin.marketing"])
    await expect(page.locator(`[data-dp="${id}"] input`)).not.toBeChecked();
  await page.locator('[data-dp="checkout.address.use-saved"]').click();
  await collect(page, seen);
  await expect(page.locator('[data-dp="checkout.bill.total"]')).toHaveText("₹365.28");
  await page.locator('[data-dp="checkout.cta.payment"]').click();

  await expect(page.locator('[data-riptide-step="payment"]')).toBeVisible();
  await expect(page.locator('[data-dp="payment.summary.total"]')).toHaveText("₹365.28");
  await collect(page, seen);

  const { slots } = (await (await request.get("/api/slots")).json()) as { slots: Slot[] };
  const missing = slots.filter((s) => !seen.get(s.step)?.has(s.id)).map((s) => `${s.step}:${s.id}`);
  expect(missing).toEqual([]);
  expect(errors).toEqual([]);
});

test("neutral manifest: every override is visible", async ({ page }) => {
  const errors = watchConsole(page);
  await page.goto("/_neutral-test?reset=1");
  await expect(page.locator('[data-dp="home.hero.title"]')).toHaveText("Fresh meals from kitchens near you.");
  await expect(page.locator('[data-dp="home.promo.info"]')).toBeVisible();
  await expect(page.locator('[data-dp="footer.links.help"]')).toHaveCount(0);
  const order = await page.$$eval('[data-dp="footer.links.list"] > [data-dp]', (els) => els.map((e) => e.getAttribute("data-dp")));
  expect(order.indexOf("footer.links.privacy")).toBeLessThan(order.indexOf("footer.links.terms"));
  await expect(page.locator('meta[name="riptide-variant"]')).toHaveAttribute("content", "_neutral-test");

  await page.goto("/_neutral-test/restaurant/dosa-dynasty");
  await page.getByRole("button", { name: "Add Masala Dosa" }).click();
  await page.locator('[data-dp="restaurant.customise.add"]').click();
  await page.locator('[data-dp="restaurant.cart.cta"]').click();
  await expect(page.locator('[data-dp="cart.summary.line.napkins"]')).toContainText("Napkins & wet wipes (free)");
  await expect(page.locator('[data-dp="cart.fees.platform"]')).toContainText("Platform fee (keeps the app running)");
  await expect(page.locator('[data-dp="cart.coupon.apply"]')).toHaveAttribute("data-variant", "primary");
  await expect(page.locator('[data-dp="cart.cta.checkout"]')).toHaveAttribute("title", "Continue to checkout");
  await page.locator('[data-dp="cart.cta.checkout"]').click();

  await expect(page.locator('[data-riptide-step="order-notes"]')).toBeVisible();
  await page.getByLabel("Note for the kitchen").fill("Less oil please");
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page.locator('[data-riptide-step="checkout"]')).toBeVisible();
  await page.locator('[data-dp="checkout.address.use-saved"]').click();
  await page.locator('[data-dp="checkout.cta.payment"]').click();
  await expect(page.locator('[data-riptide-step="payment"]')).toBeVisible();
  await expect(page.getByRole("tab", { name: "Card" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-dp="payment.summary.line.napkins"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile 390px: home and restaurant render without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ["/honest", "/honest/restaurant/biryani-bagh", "/honest/policies/terms"]) {
    await page.goto(url);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, url).toBeLessThanOrEqual(0);
  }
});

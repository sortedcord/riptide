import { expect, type Locator, type Page } from "@playwright/test";
import type { Ctx, Shop } from "./harness";

/**
 * How to walk each shop. Walking logic is lifted from the old per-shop smoke specs.
 * - buy: the honest core flow with no optional extras, ending on payment (works for any variant).
 * - extras: walks that render the conditional ids (Plus purchase + cancel, paid seats, …).
 * - browse: pages outside the purchase flow.
 * - cancel: from the account page, the clicks that lead to `account.cancel.confirm` (never clicked).
 */
export type Driver = {
  firstPriceStep: string;
  buy(c: Ctx): Promise<void>;
  extras?(c: Ctx): Promise<void>;
  browse(c: Ctx): Promise<void>;
  cancel?: { prepare?(c: Ctx): Promise<void>; clicks: ((p: Page) => Locator)[] };
  /** Accept/decline-style pairs the id-naming rule can't infer. */
  pairs?: [string, string][];
};

const dp = (p: Page, id: string) => p.locator(`[data-dp="${id}"]`).first();

async function payAndFinish(c: Ctx) {
  await c.page.getByRole("button", { name: /^Pay / }).click();
  await c.page.waitForURL(/sandbox-complete/);
  await c.snap();
}

// ---------------------------------------------------------------- market
async function marketBuy(c: Ctx, { plus = false } = {}) {
  const p = c.page;
  await c.open("", "home", true);
  await p.getByRole("searchbox", { name: "Search Cartwheel" }).fill("earbuds");
  await p.getByRole("button", { name: "Search", exact: true }).click();
  await c.go("search");
  await p.getByRole("link", { name: /Noisewave N2 Wireless Earbuds/ }).first().click();
  await c.go("product"); // electronics item: renders the warranty slots
  await p.getByRole("button", { name: "Add to cart" }).click();
  await p.getByRole("link", { name: /View cart/ }).click();
  await c.go("cart");
  await dp(p, "cart.cta.checkout").click();
  await c.go("checkout");
  await p.getByRole("button", { name: "Use saved address" }).click();
  await c.snap();
  if (plus) await dp(p, "checkout.plus.add").click();
  await dp(p, "checkout.cta.continue").click();
  await c.go("review");
  await p.getByRole("link", { name: "Continue to payment" }).click();
  await c.go("payment");
}

const market: Driver = {
  firstPriceStep: "cart",
  buy: (c) => marketBuy(c),
  async extras(c) {
    // Plus purchase → member → membership page → cancel flow up to the confirm screen.
    c.walk = "plus";
    await marketBuy(c, { plus: true });
    await payAndFinish(c);
    await c.open("/account", "account");
    await dp(c.page, "account.membership.manage").click();
    await c.go("membership");
    await dp(c.page, "membership.actions.cancel").click();
    await c.go("cancel");
    await dp(c.page, "cancel.flow.continue").click();
    await expect(dp(c.page, "account.cancel.confirm")).toBeVisible();
    await c.snap();
  },
  async browse(c) {
    c.walk = "browse";
    await c.open("/search", "search");
    await c.open("/policies/terms", "policies");
    await c.open("/help", "policies");
  },
  cancel: {
    async prepare(c) { c.walk = "plus"; await marketBuy(c, { plus: true }); await payAndFinish(c); },
    clicks: [(p) => dp(p, "account.membership.cancel"), (p) => dp(p, "cancel.flow.continue")],
  },
  pairs: [["account.cancel.confirm", "cancel.confirm.back"]],
};

// ---------------------------------------------------------------- food
const food: Driver = {
  firstPriceStep: "cart",
  async buy(c) {
    const p = c.page;
    await c.open("/location", "location", true);
    await p.getByRole("button", { name: "Deliver to Home" }).click();
    await c.go("home");
    await p.getByRole("link", { name: /Tandoor Tales/ }).click();
    await c.go("restaurant");
    await p.getByRole("button", { name: "Add Paneer Tikka" }).click();
    await expect(p.locator("dialog.ff-modal")).toBeVisible();
    await c.snap(); // customisation modal ids
    await dp(p, "restaurant.customise.add").click();
    await expect(p.locator("dialog.ff-modal")).toHaveCount(0);
    await c.snap();
    await dp(p, "restaurant.cart.cta").click();
    await c.go("cart");
    await dp(p, "cart.cta.checkout").click();
    await c.go("checkout");
    await dp(p, "checkout.address.use-saved").click();
    await c.snap();
    await dp(p, "checkout.cta.payment").click();
    await c.go("payment");
  },
  async browse(c) {
    c.walk = "browse";
    await c.open("/account", "account");
    await c.open("/policies/terms", "policies");
  },
};

// ---------------------------------------------------------------- air
async function airBuy(c: Ctx, { paidSeat = false } = {}) {
  const p = c.page;
  const cont = () => p.getByRole("button", { name: "Continue", exact: true }).click();
  await c.open("", "search", true);
  await p.locator("#from").click();
  await p.getByRole("button", { name: "From: New Delhi" }).click();
  await p.locator("#to").click();
  await p.getByRole("button", { name: "To: Mumbai" }).click();
  await c.snap();
  await dp(p, "search.cta.search").click();
  await c.go("results");
  await p.getByRole("button", { name: /^Select Saver on/ }).first().click();
  await expect(dp(p, "results.fees.convenience")).toBeVisible();
  await c.snap();
  await cont();
  await c.go("fare");
  await cont();
  await c.go("passengers");
  await p.getByRole("button", { name: "Use saved traveller" }).click();
  await p.getByRole("button", { name: /Ananya Rao/ }).click();
  await p.getByRole("button", { name: "Use saved contact details" }).click();
  await c.snap();
  await cont();
  await c.go("seats");
  if (paidSeat) {
    await p.locator('[data-dp="seats.map.xl"]:not([disabled])').first().click();
    await c.snap();
    await cont();
  } else {
    await dp(p, "seats.skip.button").click();
  }
  await c.go("addons");
  await cont();
  await c.go("review");
  await p.getByRole("button", { name: "Continue to payment" }).click();
  await c.go("payment");
}

const air: Driver = {
  firstPriceStep: "results",
  buy: (c) => airBuy(c),
  async extras(c) { c.walk = "paidseat"; await airBuy(c, { paidSeat: true }); },
  async browse(c) {
    c.walk = "browse";
    await c.open("/account", "account");
    await c.open("/policies/baggage", "policies");
  },
  pairs: [["seats.cta.continue", "seats.skip.button"]],
};

// ---------------------------------------------------------------- saas
const saas: Driver = {
  firstPriceStep: "plans",
  async buy(c) {
    const p = c.page;
    await c.open("", "home", true);
    await c.open("/pricing", "plans");
    await expect(p.locator('input[name="term"][value="monthly"]')).toBeChecked();
    await dp(p, "plans.all.buy").click();
    await c.go("signup");
    await dp(p, "signup.demo.continue").click();
    await c.go("review");
    await dp(p, "review.cta.continue").click();
    await c.go("payment");
  },
  async browse(c) {
    c.walk = "browse";
    await c.open("/apps/lumen", "app");
    await c.open("/search?q=pdf", "search");
    await c.open("/policies/cancellation", "policies");
    await c.open("/account", "account");
    await dp(c.page, "account.plan.cancel").click();
    await c.go("cancel");
    await c.open("/account/cancelled", "cancelled");
  },
  cancel: { clicks: [(p) => dp(p, "account.plan.cancel")] },
};

// ---------------------------------------------------------------- ott
const ott: Driver = {
  firstPriceStep: "plans",
  async buy(c) {
    const p = c.page;
    await c.open("", "home", true);
    await c.open("/plans", "plans");
    await p.getByRole("button", { name: "Select Standard" }).click();
    await c.snap();
    await dp(p, "plans.cta.continue").click();
    await c.go("signup-email");
    await p.getByRole("button", { name: "Use demo email" }).click();
    await c.snap();
    await dp(p, "signup-email.form.continue").click();
    await c.go("signup-password");
    await p.getByRole("button", { name: "Continue as demo user" }).click();
    await c.go("signup-plan");
    await dp(p, "signup-plan.cta.continue").click();
    await c.go("payment");
  },
  async browse(c) {
    c.walk = "browse";
    await c.open("/browse", "browse");
    await c.open("/search", "search");
    await c.open("/title/the-salt-ledger", "title");
    await c.open("/policies/cancellation", "policies");
    await c.open("/account", "account");
    await c.open("/account/cancel", "cancel");
  },
  cancel: { clicks: [(p) => dp(p, "account.membership.cancel")] },
};

export const DRIVERS: Record<Shop, Driver> = { market, food, air, saas, ott };

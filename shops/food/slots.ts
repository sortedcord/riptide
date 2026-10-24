import { paymentSlots, type SlotDef } from "@riptide/core";

type K = SlotDef["kind"];
const s = (id: string, kind: K, description: string, def: SlotDef["default"], lineKey?: string): SlotDef => ({
  id, step: id.startsWith("header.") || id.startsWith("footer.") ? "home" : id.split(".")[0], kind, description, default: def, ...(lineKey ? { lineKey } : {}),
});

/** Cart and checkout share one bill component; both register the same lines. */
const bill = (step: "cart" | "checkout"): SlotDef[] => [
  s(`${step}.bill.panel`, "card", "Bill details container; extra lines carry data-dp={step}.summary.line.{key}", null),
  s(`${step}.bill.item-total`, "price", "Item total (sum of item lines from the engine)", "{itemTotal}"),
  s(`${step}.fees.delivery`, "fee", "Delivery fee line (restaurant-specific)", "{deliveryFee}"),
  s(`${step}.fees.packaging`, "fee", "Restaurant packaging line", "{packaging}"),
  s(`${step}.fees.platform`, "fee", "Platform fee line", "₹6"),
  s(`${step}.fees.gst`, "fee", "GST line (5% food + packaging, 18% platform fee)", "{gst}"),
  s(`${step}.bill.total`, "total", "To pay total from the pricing engine", "{total}"),
];

/** Every mutable element in Forkful. GET /api/slots serves this. Header/footer slots render on every page (declared on home). */
export const registry: SlotDef[] = [
  // Header + footer (every page)
  s("header.location.button", "button", "Header delivery-location button (opens location picker)", "Set delivery location"),
  s("header.cart.link", "link", "Header cart link with item count", "Cart"),
  s("footer.links.list", "link", "Footer help/policy links container (reorderable)", null),
  s("footer.links.help", "link", "Footer Help & FAQs link", "Help & FAQs"),
  s("footer.links.delivery", "link", "Footer Delivery policy link", "Delivery policy"),
  s("footer.links.refund", "link", "Footer Refund & cancellation link", "Refunds & cancellation"),
  s("footer.links.terms", "link", "Footer Terms link", "Terms of use"),
  s("footer.links.privacy", "link", "Footer Privacy link", "Privacy policy"),

  // Location picker
  s("location.header.title", "text", "Location picker heading", "Where should we deliver?"),
  s("location.saved.list", "card", "Saved addresses container", null),
  s("location.saved.home", "button", "Deliver to saved Home address", "Deliver here"),
  s("location.saved.work", "button", "Deliver to saved Work address", "Deliver here"),
  s("location.cities.list", "selector", "City list", null),

  // Home
  s("home.hero.title", "text", "Home hero heading", "Good food from neighbourhood kitchens."),
  s("home.hero.subtitle", "text", "Home hero sub-heading", "Fees are shown upfront on every restaurant. No surprises at checkout."),
  s("home.promo.banner", "banner", "Promo banner area on home (empty in honest)", null),
  s("home.cuisines.carousel", "selector", "Cuisine carousel (filters the list)", null),
  s("home.filters.bar", "selector", "Restaurant filter bar container", null),
  s("home.filters.veg", "checkbox", "Pure veg only filter", false),
  s("home.filters.rating", "checkbox", "Rating 4.0+ filter", false),
  s("home.filters.fast", "checkbox", "Delivery under 30 min filter", false),
  s("home.filters.offers", "checkbox", "Restaurants with offers filter", false),
  s("home.sort.selector", "selector", "Sort order for restaurants", "relevance"),
  s("home.restaurants.list", "card", "Restaurant list container; cards carry data-dp=home.list.card.{id}", null),

  // Restaurant
  s("restaurant.header.title", "text", "Restaurant name heading", "{name}"),
  s("restaurant.info.eta", "text", "Delivery time estimate", "{min}–{max} min"),
  s("restaurant.info.cost-for-two", "price", "Cost for two", "{costForTwo} for two"),
  s("restaurant.info.fees", "fee", "Fee disclosure under the restaurant header", "Delivery {deliveryFee} · Packaging {packaging} · Platform fee ₹6 · GST extra"),
  s("restaurant.promo.banner", "banner", "Promo banner area on restaurant page (empty in honest)", null),
  s("restaurant.offers.list", "card", "Offers available at this restaurant", null),
  s("restaurant.menu.search", "selector", "Search within the menu", ""),
  s("restaurant.menu.veg-toggle", "checkbox", "Veg only menu filter", false),
  s("restaurant.item.add", "button", "Add button on each menu item (opens customisation)", "Add"),
  s("restaurant.customise.modal", "modal", "Item customisation dialog", null),
  s("restaurant.customise.size", "selector", "Size options; honest default is the first (cheapest) size", "{firstSize}"),
  s("restaurant.customise.addons", "checkbox", "Add-on checkboxes (all unticked)", false),
  s("restaurant.customise.spice", "selector", "Spice level", "Medium"),
  s("restaurant.customise.price", "price", "Running price of the customised item", "{price}"),
  s("restaurant.customise.add", "button", "Add customised item to cart", "Add item"),
  s("restaurant.customise.close", "button", "Close the customisation dialog", "Close"),
  s("restaurant.cart.panel", "card", "Cart drawer beside the menu", null),
  s("restaurant.cart.cta", "button", "View cart button in the drawer", "View cart"),

  // Cart
  s("cart.header.title", "text", "Cart heading", "Your cart"),
  s("cart.promo.banner", "banner", "Promo banner area on cart (empty in honest)", null),
  s("cart.items.list", "card", "Cart items; rows carry data-dp=cart.summary.line.{key}", null),
  s("cart.cta.add-more", "link", "Back to the restaurant menu", "Add more items"),
  s("cart.coupon.section", "card", "Coupon section", null),
  s("cart.coupon.input", "selector", "Coupon code input", ""),
  s("cart.coupon.apply", "button", "Apply typed coupon", "Apply"),
  s("cart.pass.card", "card", "Forkful Pass membership upsell (optional, not added)", false, "pass"),
  s("cart.pass.add", "button", "Add Forkful Pass", "Add Pass for ₹99"),
  s("cart.pass.decline", "button", "Decline Forkful Pass", "No, thanks"),
  ...bill("cart"),
  s("cart.cta.checkout", "button", "Proceed to checkout", "Proceed to checkout"),

  // Checkout
  s("checkout.header.title", "text", "Checkout heading", "Checkout"),
  s("checkout.address.panel", "card", "Delivery address section", null),
  s("checkout.address.use-saved", "button", "Use the demo profile's saved Home address", "Use saved address"),
  s("checkout.address.new", "button", "Open the new-address form", "Add new address"),
  s("checkout.instructions.options", "selector", "Quick delivery-instruction chips", null),
  s("checkout.instructions.input", "text", "Delivery instructions text box", ""),
  s("checkout.tip.selector", "selector", "Tip selector container (default: No tip)", "none"),
  s("checkout.tip.option-none", "selector", "No tip option", true),
  s("checkout.tip.option-20", "selector", "₹20 tip option", false, "tip-20"),
  s("checkout.tip.option-30", "selector", "₹30 tip option", false, "tip-30"),
  s("checkout.tip.option-50", "selector", "₹50 tip option", false, "tip-50"),
  s("checkout.donation.checkbox", "checkbox", "₹3 donation (unticked)", false, "donation"),
  s("checkout.cutlery.toggle", "checkbox", "Send cutlery (off by default)", false),
  s("checkout.optin.marketing", "checkbox", "Marketing opt-in (unticked)", false),
  ...bill("checkout"),
  s("checkout.cta.payment", "button", "Proceed to payment", "Proceed to payment"),

  ...paymentSlots,
];

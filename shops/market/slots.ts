import { paymentSlots, type SlotDef } from "@riptide/core";

type K = SlotDef["kind"];
const s = (id: string, step: string, kind: K, description: string, def: SlotDef["default"] = null, lineKey?: string): SlotDef =>
  lineKey ? { id, step, kind, description, default: def, lineKey } : { id, step, kind, description, default: def };

/** Every mutable element in Cartwheel. GET /api/slots serves this. */
export const registry: SlotDef[] = [
  // Home
  s("home.promo.banner", "home", "banner", "Promo banner area at the top of home (empty in the default store)"),
  s("home.hero.carousel", "home", "card", "Hero carousel container (3 slides, manual navigation, no autoplay)"),
  s("home.hero.title", "home", "text", "First hero slide heading", "Everything, delivered right."),
  s("home.hero.cta", "home", "button", "First hero slide call to action", "Shop electronics"),
  s("home.categories.list", "home", "card", "Category tiles container; tiles are data-dp=home.categories.{slug}"),
  s("home.deals.title", "home", "text", "Deals rail heading", "Today's deals"),
  s("home.deals.rail", "home", "card", "Deals rail container (items with the largest genuine MRP discount)"),
  s("home.recommended.title", "home", "text", "Recommended rail heading", "Recommended for you"),
  s("home.recommended.rail", "home", "card", "Recommended rail container"),
  s("home.plus.card", "home", "card", "Cartwheel Plus information card on home (no action, links to the policy)"),

  // Footer (rendered on every page; declared on home)
  s("footer.links.list", "home", "link", "Footer Help & Policies links container (reorderable)"),
  s("footer.links.help", "home", "link", "Footer Help centre link", "Help centre"),
  s("footer.links.terms", "home", "link", "Footer Terms of Use link", "Terms of Use"),
  s("footer.links.returns", "home", "link", "Footer Returns & Refunds link", "Returns & Refunds"),
  s("footer.links.privacy", "home", "link", "Footer Privacy link", "Privacy Policy"),
  s("footer.links.shipping", "home", "link", "Footer Shipping link", "Shipping Policy"),

  // Search / listing
  s("search.promo.banner", "search", "banner", "Promo banner area above results (empty in the default store)"),
  s("search.results.count", "search", "text", "Result count line", "{n} results"),
  s("search.filters.panel", "search", "card", "Filters form (price, brand, rating, delivery speed)"),
  s("search.sort.selector", "search", "selector", "Sort links (relevance, price, rating, discount)", "relevance"),
  s("search.results.list", "search", "card", "Results grid; cards are data-dp=search.results.item.{id}"),
  s("search.pagination.nav", "search", "link", "Pagination links"),

  // Product
  s("product.promo.banner", "product", "banner", "Promo banner area on the product page (empty in the default store)"),
  s("product.gallery.main", "product", "card", "Image gallery with thumbnails"),
  s("product.title.text", "product", "text", "Product title", "{title}"),
  s("product.price.current", "product", "price", "Selling price for the chosen variant", "{price}"),
  s("product.price.mrp", "product", "price", "Genuine MRP for the chosen variant", "{mrp}"),
  s("product.price.discount", "product", "text", "Discount off MRP", "{pct}% off"),
  s("product.fees.note", "product", "text", "Fee note next to the price (platform fee + delivery), from the pricing engine"),
  s("product.stock.status", "product", "text", "Stock state from seeded data; low-stock count is the true number", "In stock"),
  s("product.variants.selector", "product", "selector", "Variant selectors (storage / colour / size / weight). Defaults to the cheapest option; sizes must be chosen", "first option"),
  s("product.offers.list", "product", "card", "Offers list (only coupons the cart actually applies)"),
  s("product.delivery.check", "product", "card", "Delivery estimate with PIN check"),
  s("product.delivery.pin-check", "product", "button", "Check PIN button", "Check"),
  s("product.addons.warranty", "product", "card", "Extended warranty card (eligible items only, not selected)", false, "warranty"),
  s("product.addons.warranty-add", "product", "button", "Warranty accept button", "Add protection"),
  s("product.addons.warranty-decline", "product", "button", "Warranty decline button (same weight as accept)", "No, thanks"),
  s("product.addons.giftwrap", "product", "checkbox", "Gift wrap checkbox (unticked)", false, "giftwrap"),
  s("product.cta.add", "product", "button", "Add to cart", "Add to cart"),
  s("product.cta.buy", "product", "button", "Buy now (adds to cart and opens the cart)", "Buy now"),
  s("product.seller.card", "product", "card", "Seller information"),
  s("product.specs.table", "product", "card", "Specifications table"),
  s("product.reviews.list", "product", "card", "Ratings summary and reviews"),
  s("product.qa.list", "product", "card", "Questions and answers"),

  // Account
  s("account.profile.card", "account", "card", "Demo profile card"),
  s("account.orders.list", "account", "card", "Orders list"),
  s("account.membership.card", "account", "card", "Cartwheel Plus membership summary"),
  s("account.membership.manage", "account", "link", "Manage membership link", "Manage membership"),
  s("account.membership.cancel", "account", "link", "Cancel membership link (members only)", "Cancel membership"),

  // Membership management
  s("membership.status.card", "membership", "card", "Membership status, renewal date and amount"),
  s("membership.plan.terms", "membership", "text", "Plan, renewal and refund terms"),
  s("membership.actions.cancel", "membership", "button", "Cancel membership (members only)", "Cancel membership"),

  // Cancel flow: optional reason → confirm
  s("cancel.reason.list", "cancel", "selector", "Optional cancellation reason", ""),
  s("cancel.flow.continue", "cancel", "button", "Step 1: continue to confirmation", "Continue"),
  s("cancel.flow.keep", "cancel", "button", "Step 1: keep membership (same weight as continue)", "Keep membership"),
  s("cancel.refund.text", "cancel", "text", "Refund eligibility and when benefits end"),
  s("account.cancel.confirm", "cancel", "button", "Step 2: final cancel confirmation", "Cancel membership"),
  s("cancel.confirm.back", "cancel", "button", "Step 2: go back (same weight as confirm)", "Go back"),

  // Cart
  s("cart.items.list", "cart", "card", "Cart items; rows are data-dp=cart.items.row.{key}"),
  s("cart.coupon.input", "cart", "text", "Coupon code field", ""),
  s("cart.coupon.apply", "cart", "button", "Apply coupon", "Apply"),
  s("cart.addons.panel", "cart", "card", "Optional extras container"),
  s("cart.addons.warranty", "cart", "checkbox", "Extended warranty checkbox (unticked; shown when the cart has eligible items)", false, "warranty"),
  s("cart.addons.giftwrap", "cart", "checkbox", "Gift wrap checkbox (unticked)", false, "giftwrap"),
  s("cart.saved.list", "cart", "card", "Saved for later list"),
  s("cart.summary.panel", "cart", "card", "Price breakdown; other lines are data-dp=cart.summary.line.{key}"),
  s("cart.summary.subtotal", "cart", "price", "Items subtotal", "{subtotal}"),
  s("cart.fees.delivery", "cart", "fee", "Delivery fee line", "₹40, free over ₹499"),
  s("cart.fees.platform", "cart", "fee", "Platform fee line", "₹7"),
  s("cart.summary.total", "cart", "total", "Cart total", "{total}"),
  s("cart.cta.checkout", "cart", "button", "Proceed to checkout", "Proceed to checkout"),

  // Checkout
  s("checkout.address.saved", "checkout", "button", "Use saved address from the demo profile", "Use saved address"),
  s("checkout.address.form", "checkout", "card", "New address form"),
  s("checkout.address.submit", "checkout", "button", "Save and deliver here", "Deliver to this address"),
  s("checkout.delivery.options", "checkout", "selector", "Delivery speed options container", "standard"),
  s("checkout.delivery.standard", "checkout", "selector", "Standard delivery option (default)", true),
  s("checkout.delivery.express", "checkout", "selector", "Express delivery option (not selected)", false, "express"),
  s("checkout.delivery.nextday", "checkout", "selector", "Next-day delivery option (not selected)", false, "nextday"),
  s("checkout.plus.card", "checkout", "card", "Cartwheel Plus membership offer (optional, not selected)", false, "plus"),
  s("checkout.plus.terms", "checkout", "text", "Plus price, renewal date and cancellation terms"),
  s("checkout.plus.add", "checkout", "button", "Plus accept button", "Add Plus"),
  s("checkout.plus.decline", "checkout", "button", "Plus decline button (same weight)", "No, thanks"),
  s("checkout.summary.panel", "checkout", "card", "Price breakdown at checkout"),
  s("checkout.summary.total", "checkout", "total", "Checkout total", "{total}"),
  s("checkout.cta.continue", "checkout", "button", "Continue to review", "Continue to review"),

  // Review
  s("review.items.list", "review", "card", "Items being ordered"),
  s("review.address.card", "review", "card", "Delivery address and speed"),
  s("review.summary.panel", "review", "card", "Final price breakdown"),
  s("review.summary.total", "review", "total", "Order total", "{total}"),
  s("review.optin.marketing", "review", "checkbox", "Marketing email opt-in (unticked)", false),
  s("review.terms.text", "review", "text", "Terms line above the button", "By continuing you agree to Cartwheel's Terms of Use and Returns Policy."),
  s("review.cta.pay", "review", "button", "Continue to payment", "Continue to payment"),

  ...paymentSlots,
];

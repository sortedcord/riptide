import type { Address } from "@/shop.config";

export const DEMO_USER = { name: "Aarav Sharma", email: "aarav.demo@cartwheel.example", phone: "98450 12345", since: "2023" };

export const DEMO_ADDRESS: Address = {
  name: "Aarav Sharma",
  phone: "9845012345",
  line1: "Flat 402, Tulsi Residency, 12th Main Road",
  line2: "HSR Layout, Sector 6",
  city: "Bengaluru",
  state: "Karnataka",
  pin: "560102",
};

export const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

/** Seeded past orders for the demo profile. */
export const PAST_ORDERS = [
  { id: "CW-408-2213917", date: "12 Sep 2026", status: "Delivered on 15 Sep 2026", total: 1306, items: [{ pid: "tavvy-kettle-15", qty: 1 }] },
  { id: "CW-408-1987345", date: "28 Jul 2026", status: "Delivered on 30 Jul 2026", total: 694, items: [{ pid: "gangadhar-aged-basmati", qty: 2 }, { pid: "pahadi-leaf-assam-ctc", qty: 1 }] },
  { id: "CW-408-1650021", date: "3 May 2026", status: "Returned · refund of ₹1,499 completed", total: 1506, items: [{ pid: "ferrow-slim-stretch-jeans", qty: 1 }] },
];

export const PLUS_BENEFITS = [
  "Free Express (2-day) delivery on every order, from your next order",
  "Early access to sale events",
  "Priority customer support by chat",
];

export type Policy = { slug: string; title: string; updated: string; intro: string; sections: { h: string; p: string[] }[] };

export const POLICIES: Policy[] = [
  {
    slug: "terms", title: "Terms of Use", updated: "1 October 2026",
    intro: "These terms apply when you browse or buy on Cartwheel. Cartwheel is a marketplace: most items are sold by independent sellers, and the seller of each item is shown on its product page.",
    sections: [
      { h: "Prices and charges", p: [
        "Item prices include GST. Every other charge is shown in your cart before checkout: a platform fee of ₹7 per order, and a standard delivery fee of ₹40, which is waived when your items total ₹499 or more.",
        "Optional extras (extended warranty, gift wrap, faster delivery and Cartwheel Plus) are never added unless you select them. Each is listed with its price in the order summary.",
        "The total on the payment page is the total you pay. It only changes from the cart total if you add, remove or change something.",
      ] },
      { h: "Placing an order", p: [
        "Your order is placed when you complete payment. We send a confirmation with the order reference. If an item becomes unavailable before dispatch, we cancel that item and refund it in full.",
      ] },
      { h: "Coupons", p: [
        "Coupons apply only when your cart meets the minimum shown with the coupon. One coupon can be used per order. The discount is shown as its own line in the price breakdown.",
      ] },
      { h: "Cartwheel Plus", p: [
        "Cartwheel Plus is an optional membership that costs ₹999 per year. It renews automatically every year at ₹999 on the date shown at checkout unless you cancel. You can cancel anytime from Account → Membership in two steps. See the Returns & Refunds policy for membership refunds.",
      ] },
      { h: "Marketing", p: [
        "We only send marketing emails if you tick \"Send me offers and updates by email\" when ordering. You can unsubscribe from any email.",
      ] },
    ],
  },
  {
    slug: "returns", title: "Returns & Refunds Policy", updated: "1 October 2026",
    intro: "Most items can be returned within 7 days of delivery. Refunds go back to your original payment method.",
    sections: [
      { h: "Return windows", p: [
        "Electronics, fashion, home, beauty and sports items: 7 days from delivery, unused and in original packaging. Some sellers offer 10 days; the window is shown in the seller box on the product page.",
        "Grocery items: returnable only if damaged, incorrect or past their best-before date on delivery. Report it within 48 hours.",
        "Size exchanges on fashion and footwear are free within the return window.",
      ] },
      { h: "Refunds", p: [
        "We refund the item price within 5–7 working days of the seller receiving the item. Delivery and platform fees are refunded if the whole order is returned because it was damaged, defective or incorrect.",
        "Extended warranty is refundable in full within 30 days of purchase if you haven't made a claim. Gift wrap is non-refundable once the order ships.",
        "Faster-delivery charges are refunded automatically if the order arrives later than the promised date.",
      ] },
      { h: "Cartwheel Plus refunds", p: [
        "If you cancel within 14 days of joining and haven't used a Plus benefit, we refund the full ₹999. After that, your benefits continue until the end of the year you've paid for, and you won't be charged again. There are no cancellation fees.",
      ] },
    ],
  },
  {
    slug: "shipping", title: "Shipping Policy", updated: "1 October 2026",
    intro: "We deliver to most PIN codes in India. Your delivery date is shown before you pay.",
    sections: [
      { h: "Delivery options and fees", p: [
        "Standard delivery (4–6 days): ₹40, free when your items total ₹499 or more.",
        "Express delivery (2 days): ₹79 on top of standard, available when every item in your cart supports it.",
        "Next-day delivery: ₹149 on top of standard, available when every item supports it and your PIN code is serviceable.",
        "Cartwheel Plus members get Express delivery free on orders placed after joining.",
      ] },
      { h: "Delivery estimates", p: [
        "Product pages show an estimate once you enter your PIN code. Estimates exclude Sundays and public holidays. If we miss the promised date on a paid upgrade, the upgrade charge is refunded.",
      ] },
      { h: "Cash on delivery", p: ["Cash on delivery is not available on Cartwheel at this time."] },
    ],
  },
  {
    slug: "privacy", title: "Privacy Policy", updated: "1 October 2026",
    intro: "This policy explains what we collect when you use Cartwheel and why.",
    sections: [
      { h: "What we collect", p: [
        "Your name, phone number and delivery address, so sellers and delivery partners can fulfil your order. Your order history, so you can track and return orders.",
        "We don't store full card numbers or UPI PINs. Payments are processed by our payment partner.",
      ] },
      { h: "Marketing", p: [
        "We use your email for offers only if you opted in by ticking the box at checkout. Opting out is one click from any email and doesn't affect your orders.",
      ] },
      { h: "Sharing", p: [
        "We share your address and phone number with the seller and delivery partner for your order only. We don't sell your personal data.",
      ] },
      { h: "Your choices", p: ["You can view, correct or delete your saved addresses from your account at any time."] },
    ],
  },
];

export const FAQS: [string, string][] = [
  ["What fees will I pay?", "Item prices include GST. Each order has a ₹7 platform fee, and standard delivery costs ₹40, free when your items total ₹499 or more. All of these are shown in your cart before checkout."],
  ["How do I return an item?", "Most items can be returned within 7 days of delivery. See the Returns & Refunds policy for details by category."],
  ["How do I cancel Cartwheel Plus?", "Go to Account → Membership → Cancel membership. It takes two steps (an optional reason, then confirm), and the refund rules are shown before you confirm."],
  ["Do I need an account to order?", "No. You can check out with any address, or use the saved address on the demo profile."],
  ["Which payment methods are accepted?", "UPI, cards, netbanking and wallets."],
  ["When will my order arrive?", "Enter your PIN code on any product page for an estimate. Your chosen delivery speed and date are shown again before you pay."],
];

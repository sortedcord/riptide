import { prng } from "@riptide/core";
import type { ArtKind } from "@/components/Art";

/**
 * Cartwheel catalogue. Hand-written product facts below; ratings, review counts, stock, sellers,
 * reviews and Q&A are derived deterministically with core prng(product id). No randomness at render.
 */

export type CategorySlug = "electronics" | "fashion" | "home-kitchen" | "beauty" | "sports" | "grocery";
export const categories: { slug: CategorySlug; name: string; blurb: string; art: ArtKind; tint: string }[] = [
  { slug: "electronics", name: "Electronics", blurb: "Phones, audio, laptops", art: "headphones", tint: "#dfe9e4" },
  { slug: "fashion", name: "Fashion", blurb: "Clothing, shoes, bags", art: "tshirt", tint: "#f1e3d6" },
  { slug: "home-kitchen", name: "Home & Kitchen", blurb: "Appliances, cookware, decor", art: "kettle", tint: "#e6e2f0" },
  { slug: "beauty", name: "Beauty & Care", blurb: "Skin, hair, grooming", art: "perfume", tint: "#f4dfe1" },
  { slug: "sports", name: "Sports & Fitness", blurb: "Gear for every game", art: "racquet", tint: "#e2ecf3" },
  { slug: "grocery", name: "Grocery", blurb: "Staples, tea, dry fruits", art: "sack", tint: "#efe8cf" },
];
export const categoryBySlug = (s: string) => categories.find((c) => c.slug === s);

export type Option = { label: string; delta: number; swatch?: string };
export type VariantGroup = { name: string; required?: boolean; options: Option[] };
export type Review = { name: string; city: string; rating: number; title: string; body: string; date: string; verified: boolean; helpful: number };
export type QA = { q: string; a: string; by: string };
export type DeliverySpeed = "nextday" | "express" | "standard";
export type Seller = { name: string; city: string; rating: number; since: number; returns: string };

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: CategorySlug;
  art: ArtKind;
  colors: [string, string];
  price: number;
  mrp: number;
  about: string;
  specs: [string, string][];
  variants: VariantGroup[];
  /** 1-year extended warranty price, if the item is eligible. */
  warranty?: number;
  images: number;
  rating: number;
  reviewCount: number;
  stock: number;
  seller: Seller;
  delivery: DeliverySpeed;
  reviews: Review[];
  qa: QA[];
};

const C = (label: string, swatch: string, delta = 0): Option => ({ label, swatch, delta });
const O = (label: string, delta = 0): Option => ({ label, delta });
const colour = (...o: Option[]): VariantGroup => ({ name: "Colour", options: o });
const sizes = (name: string, labels: string[]): VariantGroup => ({ name, required: true, options: labels.map((l) => O(l)) });
const specs = (s: string): [string, string][] => s.split("|").map((kv) => kv.split(": ") as [string, string]);

type Raw = Omit<Product, "images" | "rating" | "reviewCount" | "stock" | "seller" | "delivery" | "reviews" | "qa" | "specs"> & { specs: string };

const raw: Raw[] = [
  // Electronics
  { id: "orvio-nova-5g", title: "Orvio Nova 5G Smartphone", brand: "Orvio", category: "electronics", art: "phone", colors: ["#1f2a3a", "#7fa7c9"], price: 17999, mrp: 21999,
    about: "A 6.6-inch 120 Hz AMOLED phone with a 50 MP main camera and a 5000 mAh battery that comfortably lasts a full day.",
    specs: "Display: 6.6\" AMOLED, 120 Hz|Processor: Octa-core 2.4 GHz|RAM: 8 GB|Rear camera: 50 MP + 8 MP ultra-wide|Battery: 5000 mAh, 33 W charging|In the box: Phone, USB-C cable, charger, case",
    variants: [{ name: "Storage", options: [O("128 GB"), O("256 GB", 2000)] }, colour(C("Midnight", "#1f2a3a"), C("Sage", "#7d9c87"), C("Sand", "#cdb892"))], warranty: 1299 },
  { id: "noisewave-n2-earbuds", title: "Noisewave N2 Wireless Earbuds with ANC", brand: "Noisewave", category: "electronics", art: "earbuds", colors: ["#2b2b2e", "#e2795b"], price: 2499, mrp: 3999,
    about: "Compact earbuds with active noise cancellation, 32 hours of total playback and a low-latency game mode.",
    specs: "Driver: 10 mm dynamic|Noise cancellation: Active, up to 30 dB|Playback: 8 h buds, 32 h with case|Charging: USB-C, 10 min = 2 h|Water resistance: IPX5|Bluetooth: 5.3",
    variants: [colour(C("Charcoal", "#2b2b2e"), C("Ivory", "#ece5d6"), C("Teal", "#2f7f7a"))], warranty: 299 },
  { id: "pebblon-fit-3", title: "Pebblon Fit 3 Smartwatch, 1.8\" AMOLED", brand: "Pebblon", category: "electronics", art: "smartwatch", colors: ["#30343a", "#9fd0c0"], price: 3299, mrp: 4999,
    about: "A light everyday smartwatch with heart-rate and SpO2 tracking, 100+ sport modes and Bluetooth calling.",
    specs: "Display: 1.8\" AMOLED|Battery: Up to 7 days|Sensors: Heart rate, SpO2, accelerometer|Water resistance: 5 ATM|Calling: Bluetooth calling|Strap: 22 mm silicone",
    variants: [colour(C("Graphite", "#30343a"), C("Rose clay", "#c98f84"), C("Olive", "#6c7a4b"))], warranty: 399 },
  { id: "voltrek-airbook-14", title: "Voltrek Airbook 14 Thin & Light Laptop", brand: "Voltrek", category: "electronics", art: "laptop", colors: ["#9aa1a8", "#3e4a59"], price: 54990, mrp: 64990,
    about: "A 1.3 kg aluminium laptop with a 14-inch 2.2K display, 16 GB RAM and a backlit keyboard for work and study.",
    specs: "Display: 14\" 2.2K IPS, 300 nits|Processor: 12-core mobile CPU|RAM: 16 GB LPDDR5|Weight: 1.3 kg|Battery: Up to 12 h|Ports: 2 × USB-C, 1 × USB-A, HDMI, 3.5 mm",
    variants: [{ name: "Storage", options: [O("512 GB SSD"), O("1 TB SSD", 6000)] }, colour(C("Silver", "#b9bec4"), C("Slate", "#4a5563"))], warranty: 3499 },
  { id: "noisewave-boom-mini", title: "Noisewave Boom Mini Bluetooth Speaker, 10 W", brand: "Noisewave", category: "electronics", art: "speaker", colors: ["#3a5a7a", "#f0c35a"], price: 1799, mrp: 2499,
    about: "A palm-sized 10 W speaker with a fabric finish, 12 hours of playback and a built-in strap for travel.",
    specs: "Output: 10 W|Playback: Up to 12 h|Water resistance: IPX7|Pairing: Stereo pairing with a second unit|Bluetooth: 5.3|Weight: 380 g",
    variants: [colour(C("Ocean", "#3a5a7a"), C("Terracotta", "#b9573b"), C("Black", "#232323"))], warranty: 199 },
  { id: "voltrek-powerbank-20k", title: "Voltrek 20000 mAh Power Bank, 22.5 W", brand: "Voltrek", category: "electronics", art: "powerbank", colors: ["#e9e6df", "#3a7d5d"], price: 1499, mrp: 2199,
    about: "Charges a phone about four times over, with two USB-A ports and one USB-C port that also recharges the bank.",
    specs: "Capacity: 20000 mAh|Output: 22.5 W max|Ports: 2 × USB-A, 1 × USB-C (in/out)|Recharge time: About 6 h|Weight: 420 g|Safety: Over-charge and short-circuit protection",
    variants: [colour(C("Chalk", "#e9e6df"), C("Black", "#26282a"))], warranty: 149 },
  { id: "lumetra-studio-headphones", title: "Lumetra Studio Over-ear Wireless Headphones", brand: "Lumetra", category: "electronics", art: "headphones", colors: ["#2e3a33", "#c7a46a"], price: 4499, mrp: 6999,
    about: "Cushioned over-ear headphones with 40 mm drivers, hybrid noise cancellation and 50 hours of battery.",
    specs: "Driver: 40 mm|Noise cancellation: Hybrid ANC|Battery: Up to 50 h|Charging: USB-C fast charge|Microphones: 4, for calls|Foldable: Yes, with travel pouch",
    variants: [colour(C("Forest", "#2e3a33"), C("Oat", "#d8cdb8"), C("Navy", "#26324a"))], warranty: 499 },

  // Fashion
  { id: "kaapi-organic-crew-tee", title: "Kaapi & Co Men's Organic Cotton Crew T-shirt", brand: "Kaapi & Co", category: "fashion", art: "tshirt", colors: ["#c45a3c", "#ffffff"], price: 599, mrp: 999,
    about: "A 180 GSM organic cotton tee with a regular fit, ribbed neck and side-seamless body that keeps its shape wash after wash.",
    specs: "Fabric: 100% organic cotton, 180 GSM|Fit: Regular|Neck: Crew|Sleeve: Half|Care: Machine wash cold|Country of origin: India",
    variants: [sizes("Size", ["S", "M", "L", "XL", "XXL"]), colour(C("Rust", "#c45a3c"), C("Off-white", "#efeadf"), C("Bottle green", "#2f5b45"), C("Navy", "#25304a"))] },
  { id: "stridewell-cloudstep", title: "Stridewell Cloudstep Men's Running Shoes", brand: "Stridewell", category: "fashion", art: "shoe", colors: ["#e8e4dc", "#e2643c"], price: 2799, mrp: 4499,
    about: "Everyday running shoes with a breathable knit upper and a dual-density foam midsole for road runs up to 10 km.",
    specs: "Upper: Engineered knit|Midsole: Dual-density EVA|Outsole: Rubber, road grip|Drop: 8 mm|Weight: 260 g (UK 8)|Closure: Lace-up",
    variants: [sizes("Size (UK)", ["6", "7", "8", "9", "10", "11"]), colour(C("Cloud", "#e8e4dc"), C("Charcoal", "#3a3a3d"))] },
  { id: "trailmark-commuter-28", title: "Trailmark 28 L Commuter Backpack with Laptop Sleeve", brand: "Trailmark", category: "fashion", art: "backpack", colors: ["#3f5446", "#d9b26f"], price: 1899, mrp: 2999,
    about: "A water-resistant daypack with a padded 15.6-inch laptop sleeve, a luggage strap and a hidden back pocket.",
    specs: "Capacity: 28 L|Laptop sleeve: Up to 15.6\"|Material: Recycled polyester, water-resistant|Weight: 780 g|Pockets: 9|Warranty: 1 year manufacturer",
    variants: [colour(C("Moss", "#3f5446"), C("Graphite", "#3a3d42"), C("Maroon", "#6b2c32"))] },
  { id: "saanjh-handblock-kurta", title: "Saanjh Women's Handblock Printed Cotton Kurta", brand: "Saanjh", category: "fashion", art: "kurta", colors: ["#2d5d8a", "#f3e7cf"], price: 1299, mrp: 2199,
    about: "A straight-cut, calf-length kurta in soft cotton, hand block-printed by artisans in Bagru, Rajasthan.",
    specs: "Fabric: 100% cotton cambric|Print: Hand block|Length: Calf length, 46\"|Sleeve: Three-quarter|Neck: Round with keyhole|Care: Hand wash separately",
    variants: [sizes("Size", ["XS", "S", "M", "L", "XL"]), colour(C("Indigo", "#2d5d8a"), C("Madder red", "#a8402f"))] },
  { id: "ferrow-slim-stretch-jeans", title: "Ferrow Men's Slim Fit Stretch Jeans", brand: "Ferrow", category: "fashion", art: "jeans", colors: ["#33476b", "#c9a15d"], price: 1499, mrp: 2499,
    about: "Mid-rise slim jeans in a 2% stretch denim that moves with you, finished with a light stone wash.",
    specs: "Fabric: 98% cotton, 2% elastane|Fit: Slim|Rise: Mid|Closure: Zip fly with button|Pockets: 5|Care: Machine wash inside out",
    variants: [sizes("Waist", ["28", "30", "32", "34", "36"]), colour(C("Mid blue", "#33476b"), C("Black", "#25262a"))] },
  { id: "ferrow-polarised-sunglasses", title: "Ferrow Polarised Square Sunglasses, UV400", brand: "Ferrow", category: "fashion", art: "sunglasses", colors: ["#2a2420", "#556b5a"], price: 999, mrp: 1799,
    about: "Lightweight acetate-look frames with polarised UV400 lenses, a hard case and a microfibre pouch.",
    specs: "Lens: Polarised, UV400|Frame: TR90|Shape: Square|Lens width: 54 mm|Weight: 24 g|In the box: Hard case, cleaning cloth",
    variants: [colour(C("Tortoise", "#6b4a2e"), C("Matte black", "#2a2420"), C("Crystal grey", "#9aa0a3"))] },
  { id: "kaapi-heritage-analog", title: "Kaapi & Co Heritage Analog Watch, 40 mm", brand: "Kaapi & Co", category: "fashion", art: "analog", colors: ["#7a4a2b", "#efe6d2"], price: 2299, mrp: 3499,
    about: "A minimal 40 mm watch with a sunray dial, Japanese quartz movement and a genuine leather strap.",
    specs: "Case: 40 mm stainless steel|Movement: Japanese quartz|Strap: Genuine leather, 20 mm|Water resistance: 3 ATM|Glass: Mineral|Warranty: 1 year manufacturer",
    variants: [colour(C("Tan / Cream", "#7a4a2b"), C("Black / Slate", "#2b2b2b"))] },

  // Home & Kitchen
  { id: "tavvy-kettle-15", title: "Tavvy 1.5 L Electric Kettle, Stainless Steel", brand: "Tavvy", category: "home-kitchen", art: "kettle", colors: ["#c9ced3", "#1f2a2a"], price: 1299, mrp: 1899,
    about: "Boils a full 1.5 L in about four minutes, with auto shut-off, boil-dry protection and a cool-touch handle.",
    specs: "Capacity: 1.5 L|Power: 1500 W|Body: Food-grade stainless steel|Safety: Auto shut-off, boil-dry protection|Base: 360° swivel|Cord length: 0.75 m",
    variants: [], warranty: 149 },
  { id: "hearthly-mixer-750", title: "Hearthly 750 W Mixer Grinder with 3 Jars", brand: "Hearthly", category: "home-kitchen", art: "mixer", colors: ["#f2efe8", "#b8402e"], price: 3499, mrp: 4999,
    about: "A 750 W mixer grinder with wet, dry and chutney jars, three speeds and a pulse function for idli batter to masalas.",
    specs: "Power: 750 W|Jars: 1.5 L wet, 1 L dry, 0.4 L chutney|Speeds: 3 + pulse|Blades: Stainless steel|Motor warranty: 5 years|Safety: Overload protection",
    variants: [colour(C("White / Red", "#f2efe8"), C("Black / Silver", "#2b2d30"))], warranty: 349 },
  { id: "hearthly-pressure-cooker", title: "Hearthly Tri-ply Stainless Steel Pressure Cooker", brand: "Hearthly", category: "home-kitchen", art: "cooker", colors: ["#c3c8cc", "#2b2b2b"], price: 1899, mrp: 2599,
    about: "A tri-ply stainless steel cooker that works on gas and induction, with an inner lid and a precision weight valve.",
    specs: "Material: Tri-ply stainless steel|Compatible: Gas and induction|Lid: Inner lid|Safety: Gasket release, safety valve|Certification: ISI marked|Warranty: 5 years",
    variants: [{ name: "Capacity", options: [O("3 L"), O("5 L", 600)] }] },
  { id: "nestora-300tc-bedsheet", title: "Nestora 300 TC Cotton Double Bedsheet with 2 Pillow Covers", brand: "Nestora", category: "home-kitchen", art: "bedsheet", colors: ["#9fb7c9", "#ffffff"], price: 1199, mrp: 1999,
    about: "A percale-weave cotton bedsheet that gets softer with every wash, with two matching pillow covers.",
    specs: "Material: 100% cotton, percale|Thread count: 300|Bedsheet size: 228 × 254 cm|Pillow covers: 2 × 46 × 69 cm|Fits: Double / queen bed|Care: Machine wash",
    variants: [colour(C("Sky", "#9fb7c9"), C("Sage", "#a9bba1"), C("Blush", "#e3bcb4"))] },
  { id: "dhoop-ceramic-lamp", title: "Dhoop Ceramic Table Lamp with Linen Shade", brand: "Dhoop", category: "home-kitchen", art: "lamp", colors: ["#c77a4f", "#efe3cc"], price: 1649, mrp: 2499,
    about: "A hand-glazed ceramic lamp base with a natural linen shade, made for bedside tables and reading corners.",
    specs: "Base: Hand-glazed ceramic|Shade: Linen, 30 cm|Height: 45 cm|Bulb: E27, up to 40 W (not included)|Switch: Inline cord switch|Cord: 1.5 m",
    variants: [colour(C("Terracotta", "#c77a4f"), C("Glacier", "#a6c3c8"), C("Ivory", "#e8e1d0"))] },
  { id: "tavvy-nonstick-kadhai", title: "Tavvy Non-stick Kadhai with Glass Lid, 24 cm", brand: "Tavvy", category: "home-kitchen", art: "pan", colors: ["#2b2b2b", "#b8402e"], price: 999, mrp: 1499,
    about: "A deep 24 cm kadhai with a three-layer PFOA-free coating and a toughened glass lid. Works on gas and induction.",
    specs: "Diameter: 24 cm|Capacity: 2.6 L|Coating: 3-layer, PFOA-free|Base: Induction compatible|Lid: Toughened glass|Handle: Bakelite, cool touch",
    variants: [] },
  { id: "nestora-steel-bottle", title: "Nestora Insulated Stainless Steel Bottle, 750 ml", brand: "Nestora", category: "home-kitchen", art: "bottle", colors: ["#2f6f62", "#e7e1d4"], price: 699, mrp: 999,
    about: "Double-wall vacuum insulation keeps water cold for 24 hours and tea hot for 12, in a leak-proof bottle.",
    specs: "Capacity: 750 ml|Material: 304 stainless steel|Insulation: Double wall vacuum|Cold: Up to 24 h|Hot: Up to 12 h|Lid: Leak-proof screw cap",
    variants: [colour(C("Pine", "#2f6f62"), C("Saffron", "#e0973a"), C("Steel", "#9ea5aa"))] },

  // Beauty
  { id: "glowmint-foaming-facewash", title: "Glowmint Gentle Foaming Face Wash, 150 ml", brand: "Glowmint", category: "beauty", art: "tube", colors: ["#bfe3d4", "#2f7f6a"], price: 249, mrp: 349,
    about: "A soap-free, pH-balanced cleanser with green tea and niacinamide for daily use on oily and combination skin.",
    specs: "Volume: 150 ml|Skin type: Oily and combination|Key ingredients: Green tea, 2% niacinamide|Free from: Sulphates, parabens|Fragrance: None added|Shelf life: 24 months",
    variants: [{ name: "Pack", options: [O("Single"), O("Pack of 2", 229)] }] },
  { id: "saffra-spf50-gel", title: "Saffra Labs SPF 50 PA++++ Sunscreen Gel, 50 g", brand: "Saffra Labs", category: "beauty", art: "tube", colors: ["#f6d58c", "#c2693a"], price: 449, mrp: 599,
    about: "A lightweight, no-white-cast gel sunscreen with broad-spectrum SPF 50 protection that sits well under makeup.",
    specs: "Net weight: 50 g|Protection: SPF 50, PA++++|Finish: Matte, no white cast|Skin type: All|Water resistant: Up to 40 min|Shelf life: 24 months",
    variants: [] },
  { id: "ourveda-hibiscus-shampoo", title: "Ourveda Hibiscus & Amla Shampoo, 340 ml", brand: "Ourveda", category: "beauty", art: "pump", colors: ["#a83a4a", "#f1e0c8"], price: 379, mrp: 499,
    about: "A mild, sulphate-free shampoo with hibiscus and amla extracts for dry, frizz-prone hair.",
    specs: "Volume: 340 ml|Hair type: Dry, frizzy|Key ingredients: Hibiscus, amla, aloe vera|Free from: Sulphates, silicones|Bottle: Pump dispenser|Shelf life: 30 months",
    variants: [] },
  { id: "trimly-pro-beard-trimmer", title: "Trimly Pro Cordless Beard Trimmer, 40 Length Settings", brand: "Trimly", category: "beauty", art: "trimmer", colors: ["#2a2d31", "#d79a3a"], price: 1599, mrp: 2499,
    about: "Self-sharpening stainless steel blades, a zoom wheel with 40 length settings and 90 minutes of cordless runtime.",
    specs: "Length settings: 40 (0.5–20 mm)|Runtime: 90 min|Charging: USB-C, 2 h|Blades: Self-sharpening stainless steel|Washable: Yes|Warranty: 2 years manufacturer",
    variants: [], warranty: 199 },
  { id: "saffra-vetiver-edp", title: "Saffra Labs Vetiver Eau de Parfum, 50 ml", brand: "Saffra Labs", category: "beauty", art: "perfume", colors: ["#c99a4a", "#3b4a3a"], price: 1299, mrp: 1999,
    about: "A warm, earthy fragrance with notes of vetiver, cardamom and sandalwood that lasts six to eight hours.",
    specs: "Volume: 50 ml|Concentration: Eau de parfum|Top notes: Cardamom, bergamot|Heart notes: Vetiver, iris|Base notes: Sandalwood, musk|Longevity: 6–8 h",
    variants: [] },
  { id: "glowmint-velvet-matte-lipstick", title: "Glowmint Velvet Matte Lipstick, 4.2 g", brand: "Glowmint", category: "beauty", art: "lipstick", colors: ["#a2343e", "#2a2a2a"], price: 499, mrp: 699,
    about: "A creamy matte lipstick with full coverage in one swipe, enriched with vitamin E so it doesn't dry the lips.",
    specs: "Net weight: 4.2 g|Finish: Velvet matte|Coverage: Full|Key ingredients: Vitamin E, jojoba oil|Wear: Up to 8 h|Shelf life: 36 months",
    variants: [colour(C("Brick", "#a2343e"), C("Mauve", "#9a5a6c"), C("Nude rose", "#c48a7c"), C("Berry", "#6e2440"))] },
  { id: "ourveda-kumkumadi-night-cream", title: "Ourveda Kumkumadi Night Cream, 50 g", brand: "Ourveda", category: "beauty", art: "jar", colors: ["#e3b04b", "#7a2e2a"], price: 699, mrp: 999,
    about: "A rich overnight cream with saffron, manjistha and sandalwood oil for brighter, softer skin by morning.",
    specs: "Net weight: 50 g|Skin type: Normal to dry|Key ingredients: Saffron, manjistha, sandalwood oil|Free from: Parabens, mineral oil|Use: Night|Shelf life: 24 months",
    variants: [] },

  // Sports
  { id: "fitrook-yoga-mat-6mm", title: "Fitrook 6 mm Anti-slip Yoga Mat with Strap", brand: "Fitrook", category: "sports", art: "mat", colors: ["#6a8f7a", "#e9e2d0"], price: 899, mrp: 1499,
    about: "A 6 mm TPE mat with a textured anti-slip surface on both sides, alignment lines and a carry strap.",
    specs: "Thickness: 6 mm|Size: 183 × 61 cm|Material: TPE, odour-free|Grip: Dual-side textured|Weight: 900 g|In the box: Mat, carry strap",
    variants: [colour(C("Sage", "#6a8f7a"), C("Plum", "#6e4a6b"), C("Sand", "#cbb68f"))] },
  { id: "fitrook-neoprene-dumbbells", title: "Fitrook Neoprene Dumbbell Pair", brand: "Fitrook", category: "sports", art: "dumbbell", colors: ["#2f6db5", "#2a2a2a"], price: 799, mrp: 1199,
    about: "A pair of cast-iron dumbbells with a soft neoprene coating that is easy on floors and comfortable to grip.",
    specs: "Material: Cast iron, neoprene coated|Shape: Hexagonal ends, anti-roll|Sold as: Pair|Use: Home workouts|Grip: Contoured|Care: Wipe clean",
    variants: [{ name: "Weight", options: [O("2 kg × 2"), O("3 kg × 2", 300), O("5 kg × 2", 700)] }] },
  { id: "pitchside-kashmir-willow-bat", title: "Pitchside Kashmir Willow Cricket Bat", brand: "Pitchside", category: "sports", art: "bat", colors: ["#e0c38c", "#2f5b45"], price: 1999, mrp: 2999,
    about: "A seasoned Kashmir willow bat with a thick edge, a cane handle and a full-size toe guard for tennis and leather balls.",
    specs: "Willow: Kashmir|Handle: Cane, rubber grip|Weight: 1.15–1.25 kg|Edge: 38 mm|Suitable for: Tennis and leather ball|In the box: Bat, cover",
    variants: [sizes("Size", ["5", "6", "Short handle"])] },
  { id: "pitchside-match-football", title: "Pitchside Match Football, Size 5", brand: "Pitchside", category: "sports", art: "ball", colors: ["#f2f0ea", "#d2462f"], price: 899, mrp: 1299,
    about: "A 32-panel thermally bonded football with a butyl bladder that holds air for weeks, built for turf and grass.",
    specs: "Size: 5|Panels: 32, thermally bonded|Bladder: Butyl|Surface: Turf and grass|Weight: 420–440 g|Comes: Deflated, with needle",
    variants: [] },
  { id: "ascentra-cycling-helmet", title: "Ascentra Ventra Cycling Helmet with Rear Light", brand: "Ascentra", category: "sports", art: "helmet", colors: ["#e0643a", "#2a2d31"], price: 1499, mrp: 2299,
    about: "An in-mould helmet with 18 vents, a dial-fit cradle and a USB-rechargeable rear light for evening rides.",
    specs: "Construction: In-mould EPS|Vents: 18|Fit: Dial adjustment|Light: USB rechargeable, 3 modes|Weight: 290 g|Certification: CE EN1078",
    variants: [sizes("Size", ["M (54–58 cm)", "L (58–62 cm)"]), colour(C("Ember", "#e0643a"), C("Matte black", "#2a2d31"))] },
  { id: "kridaa-graphite-racquet", title: "Kridaa G-80 Graphite Badminton Racquet, Strung", brand: "Kridaa", category: "sports", art: "racquet", colors: ["#2b5a9c", "#f0c43a"], price: 1199, mrp: 1899,
    about: "An 84 g full-graphite racquet with an even balance, factory strung at 24 lbs, for club and intermediate players.",
    specs: "Weight: 84 g (4U)|Material: Full graphite|Balance: Even|String tension: 24 lbs (max 28)|Grip: G4|In the box: Racquet, full cover",
    variants: [colour(C("Cobalt", "#2b5a9c"), C("Crimson", "#a4303a"))] },
  { id: "kridaa-court-pro-shoes", title: "Kridaa Court Pro Non-marking Badminton Shoes", brand: "Kridaa", category: "sports", art: "shoe", colors: ["#f2f0ea", "#2b5a9c"], price: 2199, mrp: 3299,
    about: "Indoor court shoes with a non-marking gum rubber sole, a cushioned heel and reinforced toe drag protection.",
    specs: "Sole: Non-marking gum rubber|Upper: Mesh with PU overlays|Cushioning: EVA heel insert|Use: Badminton, squash, indoor courts|Weight: 300 g (UK 8)|Closure: Lace-up",
    variants: [sizes("Size (UK)", ["6", "7", "8", "9", "10"])] },

  // Grocery
  { id: "gangadhar-aged-basmati", title: "Gangadhar Aged Basmati Rice", brand: "Gangadhar", category: "grocery", art: "sack", colors: ["#e8dcc0", "#2f5b45"], price: 189, mrp: 220,
    about: "Long-grain basmati aged for 12 months for fluffy, separate grains and a gentle aroma. Ideal for biryani and pulao.",
    specs: "Type: Aged basmati|Grain: Extra long|Ageing: 12 months|Diet: Vegetarian|Storage: Cool, dry place|Country of origin: India",
    variants: [{ name: "Weight", options: [O("1 kg"), O("5 kg", 690)] }] },
  { id: "pahadi-leaf-assam-ctc", title: "Pahadi Leaf Assam CTC Tea, 500 g", brand: "Pahadi Leaf", category: "grocery", art: "pouch", colors: ["#7a2f2a", "#e7c66a"], price: 249, mrp: 299,
    about: "Strong, malty CTC tea from Upper Assam gardens that brews a deep amber cup, made for milk-and-sugar chai.",
    specs: "Net weight: 500 g|Type: CTC black tea|Origin: Upper Assam|Brew: 2–3 min in boiling water|Packaging: Resealable pouch|Best before: 18 months",
    variants: [] },
  { id: "pahadi-leaf-filter-coffee", title: "Pahadi Leaf Filter Coffee, 80:20 with Chicory, 250 g", brand: "Pahadi Leaf", category: "grocery", art: "pouch", colors: ["#3b2a20", "#d9a066"], price: 299, mrp: 349,
    about: "A medium-dark roast of Chikmagalur arabica and robusta blended with 20% chicory for traditional filter coffee.",
    specs: "Net weight: 250 g|Blend: 80% coffee, 20% chicory|Roast: Medium-dark|Grind: Fine, for filter|Origin: Chikmagalur|Best before: 12 months",
    variants: [] },
  { id: "kalyani-wild-forest-honey", title: "Kalyani Farms Wild Forest Honey, 500 g", brand: "Kalyani Farms", category: "grocery", art: "jar", colors: ["#d99a2b", "#3a5a3a"], price: 349, mrp: 450,
    about: "Raw, unprocessed honey collected from forest hives in the Western Ghats. Naturally crystallises in cooler weather.",
    specs: "Net weight: 500 g|Type: Raw, unprocessed|Source: Western Ghats forests|Added sugar: None|Packaging: Glass jar|Best before: 24 months",
    variants: [] },
  { id: "madhuvan-california-almonds", title: "Madhuvan California Almonds, 500 g", brand: "Madhuvan", category: "grocery", art: "pouch", colors: ["#b77a4a", "#f1e6d0"], price: 549, mrp: 799,
    about: "Crunchy, medium-sized whole almonds, sorted and vacuum packed to stay fresh. Great for soaking or snacking.",
    specs: "Net weight: 500 g|Grade: Medium, whole|Diet: Vegetarian|Packaging: Vacuum-packed pouch|Storage: Airtight container after opening|Best before: 9 months",
    variants: [{ name: "Pack", options: [O("500 g"), O("1 kg", 479)] }] },
  { id: "dhanya-mills-whole-wheat-atta", title: "Dhanya Mills Whole Wheat Chakki Atta, 5 kg", brand: "Dhanya Mills", category: "grocery", art: "sack", colors: ["#e9c98a", "#a8402f"], price: 289, mrp: 335,
    about: "Stone-ground whole wheat atta from Sharbati wheat for soft rotis that stay soft for hours.",
    specs: "Net weight: 5 kg|Wheat: Sharbati|Milling: Stone-ground chakki|Diet: Vegetarian|Storage: Cool, dry place|Best before: 3 months",
    variants: [] },
  { id: "kalyani-groundnut-oil", title: "Kalyani Farms Cold-pressed Groundnut Oil, 1 L", brand: "Kalyani Farms", category: "grocery", art: "oil", colors: ["#e3c45a", "#2f5b45"], price: 279, mrp: 340,
    about: "Wood-pressed groundnut oil, filtered naturally without heat or chemicals, with a mild nutty flavour.",
    specs: "Volume: 1 L|Extraction: Wood-pressed (cold)|Refining: Unrefined, naturally filtered|Packaging: PET bottle|Use: Everyday cooking, frying|Best before: 9 months",
    variants: [] },
];

const SELLERS: Seller[] = [
  { name: "Cartwheel Retail", city: "Bengaluru", rating: 4.6, since: 2019, returns: "7-day returns" },
  { name: "Kaveri Trading Co.", city: "Mysuru", rating: 4.4, since: 2020, returns: "7-day returns" },
  { name: "Northgate Commerce", city: "Gurugram", rating: 4.3, since: 2021, returns: "10-day returns" },
  { name: "Sahyadri Supplies", city: "Pune", rating: 4.5, since: 2018, returns: "7-day returns" },
  { name: "Hooghly Lane Stores", city: "Kolkata", rating: 4.2, since: 2022, returns: "7-day returns" },
];

const NAMES: [string, string][] = [
  ["Aarav M.", "Pune"], ["Priya S.", "Chennai"], ["Rohan K.", "Jaipur"], ["Ananya R.", "Bengaluru"], ["Vikram P.", "Lucknow"],
  ["Sneha D.", "Kolkata"], ["Arjun N.", "Kochi"], ["Meera J.", "Ahmedabad"], ["Kabir T.", "Delhi"], ["Ishita B.", "Hyderabad"],
  ["Farhan A.", "Bhopal"], ["Lakshmi V.", "Coimbatore"], ["Siddharth G.", "Indore"], ["Neha C.", "Chandigarh"], ["Gurpreet S.", "Ludhiana"],
  ["Divya H.", "Mysuru"], ["Rahul Y.", "Nagpur"], ["Tanvi L.", "Surat"], ["Joseph F.", "Goa"], ["Pooja W.", "Bhubaneswar"],
];

type Tpl = [number, string, string];
const REVIEWS: Record<CategorySlug, Tpl[]> = {
  electronics: [
    [5, "Excellent value", "Does everything I need and the build feels solid. Setup took two minutes."],
    [4, "Good, small niggles", "Performance is great for the price. The companion app could be more polished."],
    [5, "Battery is the highlight", "Easily lasts more than the claimed time with my usage. Charges quickly too."],
    [3, "Decent but not perfect", "Works fine, but I expected slightly better sound/screen quality at this price."],
    [4, "Happy with the purchase", "Arrived well packed and a day early. No issues after three weeks of daily use."],
    [2, "Had to get a replacement", "First unit had a fault. The replacement through Cartwheel was quick and works fine."],
  ],
  fashion: [
    [5, "Fits true to size", "Ordered my usual size and it fits perfectly. Fabric feels premium."],
    [4, "Nice quality", "Colour is slightly different from the photos but the stitching and finish are good."],
    [5, "Comfortable all day", "Wore it through a long day out and it stayed comfortable. Would buy again."],
    [3, "Okay for the price", "Material is fine, but sizing runs a little small. Consider one size up."],
    [4, "Looks smart", "Got compliments the first time I wore it. Washing hasn't faded it so far."],
  ],
  "home-kitchen": [
    [5, "Daily use winner", "We use it every day and it has held up well. Easy to clean."],
    [4, "Works as described", "Does the job well. The cord could be a bit longer."],
    [5, "Great build quality", "Sturdy and well finished. Looks nice in the kitchen too."],
    [3, "Average", "It works, but it's a little noisier/heavier than I expected."],
    [4, "Good buy", "Delivery was quick and the product matches the description."],
  ],
  beauty: [
    [5, "Suits my skin", "No irritation at all and a little goes a long way. On my second bottle now."],
    [4, "Pleasant and effective", "Light texture and a mild scent. Results show after a couple of weeks."],
    [3, "Not for me", "Nothing wrong with it, it just didn't suit my skin type. Packaging was good."],
    [5, "Lovely product", "Exactly what I was looking for. Sealed packaging and a long expiry date."],
    [4, "Good value", "Works as well as pricier options I've tried."],
  ],
  sports: [
    [5, "Solid gear", "Good quality for regular practice. Holding up well after a month."],
    [4, "Value for money", "Does the job for a beginner-to-intermediate player like me."],
    [5, "Very comfortable", "Grip and finish are great. My coach approved of it too."],
    [3, "Fine, not great", "Decent for casual use. Serious players may want to spend more."],
    [4, "Recommended", "Arrived on time and well packed. Matches the listed specs."],
  ],
  grocery: [
    [5, "Fresh stock", "Good quality and a long best-before date. Packaging was intact."],
    [4, "Tastes great", "Better than what I get locally. Price is fair for the quality."],
    [5, "Regular buy now", "Ordering this every month. Consistent quality every time."],
    [3, "Okay", "Quality is fine, but I've had slightly better from other brands."],
    [4, "Good product", "Well sealed and delivered quickly. Will reorder."],
  ],
};

const QAS: Record<CategorySlug, [string, string][]> = {
  electronics: [["Does it come with a charger?", "Yes, everything listed under 'In the box' is included."], ["Is the warranty valid across India?", "Yes, the manufacturer warranty is valid at service centres across India with the invoice."], ["Can I use it while it's charging?", "Yes, it works normally while charging."]],
  fashion: [["Is the colour the same as the photos?", "It's close; screens vary slightly. The returns window covers colour mismatches."], ["Does it shrink after washing?", "Not noticeably if you follow the care label."], ["Is exchange for a different size possible?", "Yes, size exchanges are free within the returns window."]],
  "home-kitchen": [["Does it work on induction?", "Check the specs table: induction compatibility is listed for each item."], ["Is installation required?", "No, it's ready to use out of the box."], ["Where do I claim the manufacturer warranty?", "Contact the brand's service centre with your Cartwheel invoice."]],
  beauty: [["Is it suitable for sensitive skin?", "It's dermatologically tested, but we recommend a patch test first."], ["Is it cruelty-free?", "The brand states it does not test on animals."], ["What is the expiry on current stock?", "Current stock has at least 12 months before expiry."]],
  sports: [["Is it suitable for beginners?", "Yes, it's a good fit for beginners and intermediate players."], ["Does it come with a cover?", "Check 'In the box' in the specs; covers are listed where included."], ["Is it returnable if the size is wrong?", "Yes, unused items can be returned or exchanged within 7 days."]],
  grocery: [["What's the best-before on current stock?", "Current stock is packed within the last 2 months."], ["Is it returnable?", "Grocery items are returnable only if damaged or past expiry on delivery."], ["Is it vegetarian?", "Yes, it's 100% vegetarian."]],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

function enrich(r: Raw, i: number): Product {
  const rnd = prng(r.id);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const nReviews = 3 + Math.floor(rnd() * 4); // 3–6
  const pool = [...REVIEWS[r.category]];
  const names = [...NAMES];
  const reviews: Review[] = [];
  for (let k = 0; k < nReviews; k++) {
    const t = pool.splice(Math.floor(rnd() * pool.length), 1)[0] ?? REVIEWS[r.category][k % 5];
    const [name, city] = names.splice(Math.floor(rnd() * names.length), 1)[0];
    reviews.push({ name, city, rating: t[0], title: t[1], body: t[2], date: `${1 + Math.floor(rnd() * 27)} ${pick(MONTHS)} 2026`, verified: rnd() > 0.15, helpful: Math.floor(rnd() * 60) });
  }
  const avg = reviews.reduce((s, x) => s + x.rating, 0) / reviews.length;
  const rating = Math.round(Math.min(4.8, Math.max(3.6, avg * 0.5 + 2.1 + rnd() * 0.4)) * 10) / 10;
  const stockRoll = rnd();
  return {
    ...r,
    specs: specs(r.specs),
    images: 2 + Math.floor(rnd() * 3),
    rating,
    reviewCount: 40 + Math.floor(rnd() * 9000),
    // A few items are genuinely low in stock; the number shown is this number.
    stock: stockRoll < 0.12 ? 2 + Math.floor(rnd() * 4) : 20 + Math.floor(rnd() * 200),
    seller: i % 3 === 0 ? SELLERS[0] : pick(SELLERS),
    delivery: r.category === "grocery" ? "nextday" : pick<DeliverySpeed>(["nextday", "express", "express", "standard"]),
    reviews,
    qa: QAS[r.category].slice(0, 2 + Math.floor(rnd() * 2)).map(([q, a]) => ({ q, a, by: rnd() > 0.5 ? "Seller" : "Cartwheel support" })),
  };
}

export const products: Product[] = raw.map(enrich);
export const productById = (id: string) => products.find((p) => p.id === id);
export const brands = [...new Set(products.map((p) => p.brand))].sort();

/** Unit selling price and MRP for a chosen set of option indices. */
export function unitPrice(p: Product, opts: number[]): { price: number; mrp: number } {
  const delta = p.variants.reduce((s, g, i) => s + (g.options[opts[i]]?.delta ?? 0), 0);
  return { price: p.price + delta, mrp: p.mrp + Math.round((delta * p.mrp) / p.price) };
}
export const discountPct = (price: number, mrp: number) => Math.round(((mrp - price) / mrp) * 100);
export const variantLabel = (p: Product, opts: number[]) =>
  p.variants.map((g, i) => g.options[opts[i]]?.label).filter(Boolean).join(" · ");
/** Colour for the product art: the chosen colour swatch, else the product's base colour. */
export const artColor = (p: Product, opts: number[] = []) => {
  const gi = p.variants.findIndex((g) => g.name === "Colour");
  return (gi >= 0 && p.variants[gi].options[opts[gi] ?? 0]?.swatch) || p.colors[0];
};

export const DELIVERY_LABEL: Record<DeliverySpeed, string> = {
  nextday: "Next-day delivery available",
  express: "Express (2-day) delivery available",
  standard: "Standard delivery, 4–6 days",
};

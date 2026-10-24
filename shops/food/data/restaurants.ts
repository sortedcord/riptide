import { hashString, prng } from "@riptide/core";

/**
 * Forkful catalogue: 12 fictional restaurants, hand-written menus, everything else
 * (descriptions, item ratings, reviews) derived deterministically with prng(seed).
 */

export type Art = "bowl" | "rice" | "bread" | "pizza" | "burger" | "drink" | "dessert" | "dosa" | "momo" | "salad" | "snack" | "fish";
export type Option = { id: string; label: string; price: number };
export type MenuItem = {
  id: string;
  name: string;
  veg: boolean;
  price: number;
  description: string;
  category: string;
  art: Art;
  bestseller: boolean;
  rating: number | null;
  ratingCount: number;
  sizes: Option[];
  addons: Option[];
  spice: boolean;
};
export type Review = { name: string; rating: number; text: string; when: string };
export type Restaurant = {
  id: string;
  name: string;
  tagline: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  eta: [number, number];
  costForTwo: number;
  deliveryFee: number;
  packaging: number;
  pureVeg: boolean;
  hue: number;
  art: Art;
  areaIndex: number;
  license: string;
  categories: string[];
  items: MenuItem[];
  reviews: Review[];
};

type SizeKey = "portion" | "halffull" | "pizza" | "drink" | "pieces" | "pair" | "patty" | "weight" | "scoop" | "thali" | "serves";
type AddonKey = "tandoor" | "breads" | "south" | "asian" | "pizza" | "biryani" | "bowls" | "chaat" | "coastal" | "burger" | "mithai" | "icecream" | "momo" | "thali" | "dessert" | "drink";
type RawCategory = { name: string; size: SizeKey; addons: AddonKey; spice: boolean; items: string[] };
type RawRestaurant = Omit<Restaurant, "categories" | "items" | "reviews" | "areaIndex" | "license"> & { menu: RawCategory[] };

const round10 = (n: number) => Math.max(10, Math.round(n / 10) * 10);

function sizesFor(key: SizeKey, price: number): Option[] {
  const s = (id: string, label: string, extra: number): Option => ({ id, label, price: extra });
  switch (key) {
    case "portion": return [s("regular", "Regular", 0), s("large", "Large", round10(price * 0.4))];
    case "halffull": return [s("half", "Half", 0), s("full", "Full", round10(price * 0.7))];
    case "pizza": return [s("small", "Regular 7\"", 0), s("medium", "Medium 10\"", 150), s("large", "Large 12\"", 280)];
    case "drink": return [s("regular", "Regular 300 ml", 0), s("large", "Large 500 ml", round10(price * 0.35))];
    case "pieces": return [s("6", "6 pieces", 0), s("10", "10 pieces", round10(price * 0.6))];
    case "pair": return [s("1", "1 piece", 0), s("2", "2 pieces", price)];
    case "patty": return [s("single", "Single patty", 0), s("double", "Double patty", round10(price * 0.45))];
    case "weight": return [s("250", "250 g", 0), s("500", "500 g", price)];
    case "scoop": return [s("single", "Single scoop", 0), s("double", "Double scoop", round10(price * 0.7))];
    case "thali": return [s("regular", "Regular", 0), s("deluxe", "Deluxe (2 extra sabzis)", 120)];
    case "serves": return [s("single", "Serves 1", 0), s("two", "Serves 2", round10(price * 0.8)), s("family", "Family pack (serves 4)", round10(price * 2.4))];
  }
}

const ADDONS: Record<AddonKey, [string, number][]> = {
  tandoor: [["Mint chutney dip", 20], ["Onion lachha salad", 30], ["Extra butter glaze", 25]],
  breads: [["Extra butter", 15], ["Cheese filling", 40], ["Chopped garlic & coriander", 15]],
  south: [["Extra coconut chutney", 15], ["Extra sambar", 25], ["Ghee drizzle", 20], ["Podi sprinkle", 15]],
  asian: [["Extra Schezwan sauce", 20], ["Steamed rice side", 60], ["Add fried egg", 30], ["Crispy chilli oil", 25]],
  pizza: [["Extra cheese", 60], ["Jalapeños", 35], ["Olives", 35], ["Cheese-burst crust", 90], ["Garlic dip", 25]],
  biryani: [["Burani raita", 40], ["Mirchi ka salan", 50], ["Boiled egg", 25], ["Extra fried onions", 20]],
  bowls: [["Avocado", 80], ["Grilled tofu", 60], ["Grilled paneer", 60], ["Toasted seeds", 30], ["Hummus side", 50]],
  chaat: [["Extra sev", 15], ["Extra sweet chutney", 10], ["Extra curd", 20], ["Butter on pav", 15]],
  coastal: [["Extra Malabar parotta", 45], ["Lemon wedges", 10], ["Kokum curry side", 40]],
  burger: [["Cheese slice", 30], ["Jalapeños", 25], ["Fried egg", 30], ["Chipotle mayo", 20], ["Make it a meal (fries + drink)", 99]],
  mithai: [["Festive gift box", 30], ["Silver-leaf finish", 40]],
  icecream: [["Hot fudge", 30], ["Roasted nuts", 30], ["Waffle cone", 25]],
  momo: [["Extra red chilli chutney", 15], ["Cheese dip", 35], ["Clear soup side", 40]],
  thali: [["Extra roti", 20], ["Ghee", 25], ["Roasted papad", 15], ["Masala chaas", 40]],
  dessert: [["Vanilla scoop", 50], ["Extra dry fruits", 30]],
  drink: [["Less sugar", 0], ["Add ice cream", 50], ["Extra ice", 0]],
};

const DESCRIPTIONS: Record<Art, string[]> = {
  bowl: ["Slow-cooked gravy finished with fresh coriander.", "A house recipe, simmered for hours and served hot.", "Rich, comforting and best eaten with bread or rice."],
  rice: ["Long-grain rice, dum-cooked and fragrant.", "Fluffy rice tempered with whole spices.", "Cooked to order and packed hot."],
  bread: ["Hand-stretched and baked fresh to order.", "Soft inside, crisp on the edges.", "Straight from the hot pan, brushed with butter."],
  pizza: ["Hand-tossed sourdough base with slow-cooked tomato sauce.", "Stone-baked crust, generous mozzarella.", "Thin, crisp base baked at 400°C."],
  burger: ["Toasted brioche bun, house sauce and crunchy lettuce.", "Stacked tall with pickles and a soft milk bun.", "Grilled to order with our smoky house sauce."],
  drink: ["Made fresh with every order.", "Chilled, lightly sweetened and refreshing.", "Brewed in-house, served the traditional way."],
  dessert: ["Made in small batches every morning.", "A sweet finish, not too heavy.", "Classic recipe, finished with nuts and saffron."],
  dosa: ["Crisp fermented rice-and-lentil crepe with sambar and chutneys.", "Thin, golden and served with two chutneys.", "Batter ground fresh daily, roasted on a cast-iron tawa."],
  momo: ["Hand-folded dumplings with a fiery red chutney.", "Thin wrappers, juicy filling, steamed to order.", "Pleated by hand, served with house chutney."],
  salad: ["Crisp greens with a bright citrus dressing.", "Fresh, crunchy and dressed to order.", "Seasonal vegetables with a light house vinaigrette."],
  snack: ["Crunchy, tangy and made to order.", "A street-side favourite, packed to stay crisp.", "Perfect for sharing, with house dips."],
  fish: ["Fresh catch marinated in coastal spices.", "Pan-fried with a semolina crust and lemon.", "Coastal masala, cooked on a hot tawa."],
};

const REVIEW_NAMES = ["Ananya R.", "Rohan K.", "Meera S.", "Vikram P.", "Sneha I.", "Arjun M.", "Kavya N.", "Farhan Q.", "Ishita D.", "Rahul V.", "Divya T.", "Sameer A.", "Pooja B.", "Nikhil J.", "Lakshmi G.", "Harpreet S."];
const REVIEW_TEXTS: [number, string][] = [
  [5, "Arrived hot and well packed. Portions were generous for the price."],
  [5, "Our go-to for weeknight dinners. Consistent every single time."],
  [4, "Tasty, though the delivery took about ten minutes longer than shown."],
  [4, "Good flavours. I'd order the large size next time, regular was a bit small."],
  [5, "Spice level was exactly as selected. Loved the packaging."],
  [3, "Food was fine but slightly less hot on arrival. Will try again."],
  [4, "Fresh and not too oily. The add-ons were worth it."],
  [5, "Delivery partner was polite and on time. Food was excellent."],
  [4, "Solid value for money. Packaging could be more eco-friendly."],
];
const REVIEW_WHEN = ["2 days ago", "4 days ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago"];

const RAW: RawRestaurant[] = [
  {
    id: "tandoor-tales", name: "Tandoor Tales", tagline: "Clay-oven classics from the North", cuisines: ["North Indian", "Mughlai", "Kebabs"],
    rating: 4.4, ratingCount: 2140, eta: [30, 40], costForTwo: 600, deliveryFee: 39, packaging: 25, pureVeg: false, hue: 18, art: "bread",
    menu: [
      { name: "Starters", size: "portion", addons: "tandoor", spice: true, items: ["Paneer Tikka|v|279|snack|b", "Malai Soya Chaap|v|249|snack", "Tandoori Mushroom|v|259|snack", "Chicken Tikka|n|319|snack|b", "Murgh Seekh Kebab|n|329|snack", "Fish Amritsari|n|349|fish"] },
      { name: "Tandoori Platters", size: "halffull", addons: "tandoor", spice: true, items: ["Tandoori Chicken|n|299|snack|b", "Veg Tandoori Platter|v|329|snack"] },
      { name: "Main Course", size: "portion", addons: "breads", spice: true, items: ["Dal Makhani|v|249|bowl|b", "Paneer Butter Masala|v|289|bowl", "Kadai Veg|v|259|bowl", "Butter Chicken|n|349|bowl|b", "Rogan Josh|n|389|bowl", "Chicken Changezi|n|359|bowl"] },
      { name: "Breads", size: "pair", addons: "breads", spice: false, items: ["Butter Naan|v|59|bread", "Garlic Naan|v|69|bread|b", "Laccha Paratha|v|65|bread", "Tandoori Roti|v|35|bread"] },
      { name: "Rice", size: "portion", addons: "tandoor", spice: false, items: ["Jeera Rice|v|179|rice", "Veg Pulao|v|199|rice"] },
      { name: "Desserts & Drinks", size: "portion", addons: "dessert", spice: false, items: ["Gulab Jamun|v|99|dessert", "Phirni|v|119|dessert", "Sweet Lassi|v|99|drink"] },
    ],
  },
  {
    id: "dosa-dynasty", name: "Dosa Dynasty", tagline: "Udupi-style tiffin, all day", cuisines: ["South Indian", "Udupi", "Tiffin"],
    rating: 4.5, ratingCount: 3410, eta: [20, 30], costForTwo: 300, deliveryFee: 25, packaging: 15, pureVeg: true, hue: 42, art: "dosa",
    menu: [
      { name: "Dosas", size: "portion", addons: "south", spice: true, items: ["Masala Dosa|v|119|dosa|b", "Ghee Roast Dosa|v|139|dosa|b", "Mysore Masala Dosa|v|139|dosa", "Rava Onion Dosa|v|149|dosa", "Set Dosa|v|109|dosa", "Paneer Dosa|v|159|dosa", "Neer Dosa|v|99|dosa"] },
      { name: "Idli & Vada", size: "pair", addons: "south", spice: false, items: ["Idli|v|69|snack", "Medu Vada|v|79|snack|b", "Idli Vada Combo|v|99|snack", "Rasam Vada|v|99|bowl"] },
      { name: "Rice Specials", size: "portion", addons: "south", spice: true, items: ["Bisi Bele Bath|v|129|rice", "Curd Rice|v|109|rice", "Lemon Rice|v|109|rice", "Puliyogare|v|119|rice"] },
      { name: "Uttapam", size: "portion", addons: "south", spice: true, items: ["Onion Uttapam|v|129|dosa", "Tomato Uttapam|v|129|dosa"] },
      { name: "Sweets & Coffee", size: "drink", addons: "drink", spice: false, items: ["Kesari Bath|v|69|dessert", "Filter Coffee|v|49|drink|b", "Badam Milk|v|79|drink"] },
    ],
  },
  {
    id: "bamboo-steam-house", name: "Bamboo Steam House", tagline: "Woks, dimsum and Thai curries", cuisines: ["Chinese", "Asian", "Thai"],
    rating: 4.2, ratingCount: 1820, eta: [35, 45], costForTwo: 700, deliveryFee: 45, packaging: 30, pureVeg: false, hue: 140, art: "momo",
    menu: [
      { name: "Soups", size: "portion", addons: "asian", spice: true, items: ["Hot & Sour Veg Soup|v|149|bowl", "Lemon Coriander Soup|v|139|bowl", "Manchow Chicken Soup|n|169|bowl", "Tom Yum Prawn Soup|n|229|bowl"] },
      { name: "Starters", size: "portion", addons: "asian", spice: true, items: ["Chilli Paneer|v|249|snack|b", "Crispy Corn Salt & Pepper|v|219|snack", "Honey Chilli Potato|v|199|snack", "Dragon Chicken|n|289|snack|b", "Salt & Pepper Prawns|n|349|fish"] },
      { name: "Dimsum", size: "pieces", addons: "momo", spice: false, items: ["Crystal Veg Dimsum|v|219|momo", "Chicken Sui Mai|n|249|momo"] },
      { name: "Rice & Noodles", size: "portion", addons: "asian", spice: true, items: ["Veg Hakka Noodles|v|199|bowl", "Burnt Garlic Fried Rice|v|209|rice|b", "Chicken Schezwan Noodles|n|239|bowl", "Egg Fried Rice|n|199|rice", "Thai Green Curry with Rice|v|299|bowl", "Thai Red Curry Chicken|n|329|bowl"] },
      { name: "Desserts & Drinks", size: "portion", addons: "dessert", spice: false, items: ["Date Pancake with Ice Cream|v|179|dessert", "Iced Lemon Tea|v|99|drink"] },
    ],
  },
  {
    id: "crust-collective", name: "Crust Collective", tagline: "Sourdough pizzas and fresh pasta", cuisines: ["Pizza", "Italian", "Pasta"],
    rating: 4.3, ratingCount: 2630, eta: [30, 40], costForTwo: 650, deliveryFee: 35, packaging: 30, pureVeg: false, hue: 8, art: "pizza",
    menu: [
      { name: "Pizzas", size: "pizza", addons: "pizza", spice: true, items: ["Margherita|v|249|pizza|b", "Farmhouse Garden|v|329|pizza", "Paneer Makhani Pizza|v|349|pizza", "Four Cheese|v|379|pizza", "Spicy Chicken Tikka Pizza|n|389|pizza|b", "Chicken Pepperoni|n|409|pizza", "BBQ Chicken|n|399|pizza"] },
      { name: "Pasta", size: "portion", addons: "pizza", spice: true, items: ["Penne Arrabbiata|v|279|bowl", "Alfredo Mushroom|v|299|bowl", "Pesto Chicken Spaghetti|n|339|bowl"] },
      { name: "Sides", size: "portion", addons: "pizza", spice: false, items: ["Garlic Bread Sticks|v|129|bread|b", "Cheesy Garlic Bread|v|159|bread", "Peri Peri Fries|v|139|snack", "Chicken Wings|n|249|snack"] },
      { name: "Desserts & Drinks", size: "portion", addons: "dessert", spice: false, items: ["Choco Lava Cake|v|109|dessert", "Tiramisu Cup|v|179|dessert", "Cold Coffee|v|129|drink", "Sparkling Lemonade|v|99|drink"] },
    ],
  },
  {
    id: "biryani-bagh", name: "Biryani Bagh", tagline: "Dum biryani, sealed and slow-cooked", cuisines: ["Biryani", "Hyderabadi", "Mughlai"],
    rating: 4.5, ratingCount: 5180, eta: [35, 45], costForTwo: 500, deliveryFee: 39, packaging: 20, pureVeg: false, hue: 30, art: "rice",
    menu: [
      { name: "Biryani", size: "serves", addons: "biryani", spice: true, items: ["Hyderabadi Chicken Dum Biryani|n|299|rice|b", "Mutton Dum Biryani|n|399|rice|b", "Egg Biryani|n|229|rice", "Veg Dum Biryani|v|229|rice", "Paneer Biryani|v|259|rice", "Prawn Biryani|n|369|rice", "Kolkata-style Chicken Biryani|n|309|rice"] },
      { name: "Kebabs & Fry", size: "portion", addons: "tandoor", spice: true, items: ["Chicken 65|n|249|snack|b", "Pathar ka Gosht|n|379|snack", "Paneer 65|v|229|snack"] },
      { name: "Curries", size: "portion", addons: "breads", spice: true, items: ["Mirchi ka Salan|v|129|bowl", "Chicken Korma|n|279|bowl", "Dalcha|v|149|bowl"] },
      { name: "Sides", size: "portion", addons: "biryani", spice: false, items: ["Burani Raita|v|59|bowl", "Rumali Roti|v|35|bread"] },
      { name: "Desserts & Chai", size: "portion", addons: "dessert", spice: false, items: ["Double ka Meetha|v|119|dessert|b", "Qubani ka Meetha|v|149|dessert", "Irani Chai|v|39|drink"] },
    ],
  },
  {
    id: "green-leaf-bowls", name: "Green Leaf Bowls", tagline: "Salads, grain bowls and smoothies", cuisines: ["Healthy", "Salads", "Bowls"],
    rating: 4.6, ratingCount: 980, eta: [25, 35], costForTwo: 550, deliveryFee: 29, packaging: 20, pureVeg: true, hue: 95, art: "salad",
    menu: [
      { name: "Salads", size: "portion", addons: "bowls", spice: false, items: ["Greek Salad|v|279|salad", "Quinoa Crunch|v|299|salad|b", "Caesar with Tofu|v|289|salad", "Thai Raw Papaya|v|259|salad", "Watermelon Feta|v|269|salad"] },
      { name: "Power Bowls", size: "portion", addons: "bowls", spice: true, items: ["Burrito Bowl|v|319|bowl|b", "Teriyaki Tofu Bowl|v|329|bowl", "Paneer Tikka Grain Bowl|v|339|bowl", "Millet Khichdi Bowl|v|249|bowl"] },
      { name: "Wraps", size: "portion", addons: "bowls", spice: true, items: ["Falafel Hummus Wrap|v|229|bread", "Grilled Veg Wrap|v|209|bread"] },
      { name: "Smoothies", size: "drink", addons: "drink", spice: false, items: ["Green Detox|v|179|drink", "Berry Oat|v|199|drink|b", "Mango Chia|v|189|drink"] },
      { name: "Desserts", size: "portion", addons: "dessert", spice: false, items: ["Date & Walnut Bites|v|149|dessert", "Greek Yogurt Parfait|v|169|dessert"] },
    ],
  },
  {
    id: "chaat-chowk", name: "Chaat Chowk", tagline: "Street-side favourites, tangy and fresh", cuisines: ["Street Food", "Chaat", "Snacks"],
    rating: 4.3, ratingCount: 2230, eta: [20, 30], costForTwo: 250, deliveryFee: 25, packaging: 15, pureVeg: true, hue: 55, art: "snack",
    menu: [
      { name: "Chaat", size: "portion", addons: "chaat", spice: true, items: ["Pani Puri|v|79|snack|b", "Sev Puri|v|89|snack", "Dahi Puri|v|99|snack", "Papdi Chaat|v|99|snack", "Aloo Tikki Chaat|v|109|snack", "Raj Kachori|v|129|snack", "Bhel Puri|v|79|snack"] },
      { name: "Pav Specials", size: "pair", addons: "chaat", spice: true, items: ["Pav Bhaji|v|149|bread|b", "Vada Pav|v|49|bread", "Misal Pav|v|139|bowl", "Dabeli|v|59|bread"] },
      { name: "Rolls", size: "portion", addons: "chaat", spice: true, items: ["Paneer Kathi Roll|v|149|bread", "Aloo Masala Roll|v|109|bread"] },
      { name: "Sweets", size: "weight", addons: "dessert", spice: false, items: ["Jalebi|v|79|dessert", "Rabdi|v|99|dessert"] },
      { name: "Drinks", size: "drink", addons: "drink", spice: false, items: ["Masala Soda|v|49|drink", "Kesar Badam Thandai|v|99|drink", "Nimbu Pani|v|39|drink"] },
    ],
  },
  {
    id: "coastal-kadai", name: "Coastal Kadai", tagline: "Konkan and Malabar coast kitchens", cuisines: ["Seafood", "Konkan", "Kerala"],
    rating: 4.4, ratingCount: 1530, eta: [40, 50], costForTwo: 800, deliveryFee: 49, packaging: 25, pureVeg: false, hue: 190, art: "fish",
    menu: [
      { name: "Starters", size: "portion", addons: "coastal", spice: true, items: ["Rava Fried Surmai|n|389|fish|b", "Prawn Koliwada|n|349|fish", "Squid Butter Garlic|n|369|fish", "Chicken Sukka|n|299|bowl", "Mushroom Pepper Fry|v|229|bowl"] },
      { name: "Curries", size: "portion", addons: "coastal", spice: true, items: ["Kerala Fish Curry|n|349|bowl|b", "Prawn Gassi|n|389|bowl", "Malvani Chicken|n|319|bowl", "Kadala Curry|v|199|bowl", "Vegetable Stew|v|219|bowl"] },
      { name: "Rice & Breads", size: "pair", addons: "coastal", spice: false, items: ["Steamed Matta Rice|v|99|rice", "Appam|v|69|dosa", "Malabar Parotta|v|49|bread|b", "Neer Dosa|v|79|dosa", "Ghee Rice|v|149|rice"] },
      { name: "Thalis", size: "thali", addons: "thali", spice: true, items: ["Fish Thali|n|449|bowl", "Veg Sadya Thali|v|349|bowl"] },
      { name: "Desserts & Drinks", size: "portion", addons: "dessert", spice: false, items: ["Elaneer Payasam|v|139|dessert", "Sol Kadhi|v|79|drink"] },
    ],
  },
  {
    id: "burger-bureau", name: "Burger Bureau", tagline: "Stacked burgers, loaded fries, thick shakes", cuisines: ["Burgers", "American", "Fast Food"],
    rating: 4.1, ratingCount: 3020, eta: [25, 35], costForTwo: 450, deliveryFee: 29, packaging: 20, pureVeg: false, hue: 28, art: "burger",
    menu: [
      { name: "Burgers", size: "patty", addons: "burger", spice: true, items: ["Classic Veg Crunch|v|149|burger", "Paneer Tandoori Burger|v|189|burger|b", "Mushroom Swiss|v|219|burger", "Crispy Chicken|n|199|burger|b", "Smoky BBQ Chicken|n|229|burger", "Double Chicken Melt|n|279|burger", "Fish Fillet Burger|n|239|burger"] },
      { name: "Sides", size: "portion", addons: "burger", spice: true, items: ["Salted Fries|v|99|snack|b", "Loaded Cheese Fries|v|159|snack", "Onion Rings|v|129|snack", "Chicken Popcorn|n|179|snack"] },
      { name: "Wraps", size: "portion", addons: "burger", spice: true, items: ["Veg Mexican Wrap|v|159|bread", "Chicken Shawarma Wrap|n|189|bread"] },
      { name: "Shakes & Desserts", size: "drink", addons: "drink", spice: false, items: ["Chocolate Shake|v|159|drink", "Strawberry Shake|v|159|drink", "Salted Caramel Shake|v|179|drink", "Brownie Sundae|v|149|dessert"] },
    ],
  },
  {
    id: "sugar-saffron", name: "Sugar & Saffron", tagline: "Mithai, kulfi and warm halwas", cuisines: ["Desserts", "Mithai", "Ice Cream"],
    rating: 4.6, ratingCount: 1240, eta: [20, 30], costForTwo: 300, deliveryFee: 29, packaging: 15, pureVeg: true, hue: 330, art: "dessert",
    menu: [
      { name: "Mithai", size: "weight", addons: "mithai", spice: false, items: ["Kaju Katli|v|299|dessert|b", "Motichoor Ladoo|v|199|dessert", "Mysore Pak|v|229|dessert|b", "Gulab Jamun|v|129|dessert", "Kalakand|v|249|dessert", "Dharwad Peda|v|199|dessert"] },
      { name: "Bengali Sweets", size: "pair", addons: "mithai", spice: false, items: ["Rasmalai|v|149|dessert", "Rasgulla|v|99|dessert"] },
      { name: "Ice Creams & Kulfi", size: "scoop", addons: "icecream", spice: false, items: ["Tender Coconut|v|99|dessert", "Sitaphal|v|109|dessert|b", "Filter Coffee Gelato|v|119|dessert", "Gulkand Kulfi|v|89|dessert"] },
      { name: "Hot Desserts", size: "portion", addons: "dessert", spice: false, items: ["Gajar Halwa|v|149|dessert", "Moong Dal Halwa|v|159|dessert", "Shahi Tukda|v|139|dessert"] },
      { name: "Drinks", size: "drink", addons: "drink", spice: false, items: ["Rose Falooda|v|169|drink|b", "Kesar Badam Milk|v|99|drink"] },
    ],
  },
  {
    id: "thukpa-trail", name: "Thukpa Trail", tagline: "Himalayan momos and noodle soups", cuisines: ["Tibetan", "Momos", "Himalayan"],
    rating: 4.3, ratingCount: 1120, eta: [30, 40], costForTwo: 400, deliveryFee: 35, packaging: 20, pureVeg: false, hue: 210, art: "momo",
    menu: [
      { name: "Momos", size: "pieces", addons: "momo", spice: true, items: ["Veg Steamed Momos|v|129|momo|b", "Paneer Momos|v|149|momo", "Corn Cheese Momos|v|159|momo", "Chicken Steamed Momos|n|159|momo|b", "Chicken Fried Momos|n|179|momo", "Chicken Kothey Momos|n|189|momo", "Mutton Jhol Momos|n|219|momo"] },
      { name: "Thukpa & Soups", size: "portion", addons: "momo", spice: true, items: ["Veg Thukpa|v|169|bowl", "Chicken Thukpa|n|199|bowl|b", "Thenthuk|n|189|bowl"] },
      { name: "Mains", size: "portion", addons: "asian", spice: true, items: ["Chicken Shaphalay|n|179|bread", "Chicken Chilli Dry|n|229|snack", "Veg Chowmein|v|159|bowl", "Tingmo with Aloo Dum|v|149|bread"] },
      { name: "Drinks", size: "drink", addons: "drink", spice: false, items: ["Butter Tea|v|69|drink", "Ginger Honey Lemon|v|79|drink"] },
    ],
  },
  {
    id: "rasoi-rang", name: "Rasoi Rang", tagline: "Gujarati and Rajasthani home-style thalis", cuisines: ["Gujarati", "Rajasthani", "Thali"],
    rating: 4.4, ratingCount: 870, eta: [30, 40], costForTwo: 500, deliveryFee: 35, packaging: 20, pureVeg: true, hue: 48, art: "bowl",
    menu: [
      { name: "Thalis", size: "thali", addons: "thali", spice: true, items: ["Gujarati Thali|v|299|bowl|b", "Rajasthani Thali|v|329|bowl|b", "Mini Thali|v|199|bowl", "Jain Thali|v|299|bowl"] },
      { name: "Farsan", size: "portion", addons: "chaat", spice: true, items: ["Khaman Dhokla|v|99|snack|b", "Khandvi|v|109|snack", "Fafda Jalebi|v|119|snack", "Patra|v|99|snack", "Pyaaz Kachori|v|79|snack"] },
      { name: "Main Course", size: "portion", addons: "thali", spice: true, items: ["Dal Baati Churma|v|279|bowl", "Gatte ki Sabzi|v|219|bowl", "Undhiyu|v|249|bowl", "Sev Tameta|v|189|bowl", "Ker Sangri|v|239|bowl"] },
      { name: "Breads", size: "pair", addons: "breads", spice: false, items: ["Bajra Rotla|v|39|bread", "Methi Thepla|v|59|bread", "Missi Roti|v|45|bread"] },
      { name: "Sweets & Drinks", size: "portion", addons: "dessert", spice: false, items: ["Shrikhand|v|109|dessert", "Mohanthal|v|129|dessert", "Masala Chaas|v|49|drink"] },
    ],
  },
];

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function build(raw: RawRestaurant, index: number): Restaurant {
  const rnd = prng(raw.id);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const items: MenuItem[] = raw.menu.flatMap((cat) =>
    cat.items.map((line) => {
      const [name, v, p, art, flag] = line.split("|");
      const price = Number(p);
      const rated = rnd() < 0.75;
      return {
        id: `${raw.id}--${slug(name)}`,
        name,
        veg: v === "v",
        price,
        description: pick(DESCRIPTIONS[art as Art]),
        category: cat.name,
        art: art as Art,
        bestseller: flag === "b",
        rating: rated ? Math.round((3.8 + rnd() * 1.0) * 10) / 10 : null,
        ratingCount: rated ? 20 + Math.floor(rnd() * 880) : 0,
        sizes: sizesFor(cat.size, price),
        addons: ADDONS[cat.addons].map(([label, ap]) => ({ id: slug(label), label, price: ap })),
        spice: cat.spice,
      };
    }),
  );
  const reviews: Review[] = Array.from({ length: 3 }, (_, i) => {
    const [rating, text] = REVIEW_TEXTS[(hashString(raw.id) + i * 4) % REVIEW_TEXTS.length];
    return { name: REVIEW_NAMES[(index * 3 + i) % REVIEW_NAMES.length], rating, text, when: REVIEW_WHEN[(index + i * 2) % REVIEW_WHEN.length] };
  });
  return {
    ...raw,
    areaIndex: index,
    license: `FSSAI Lic. No. 1${String(hashString(raw.id)).padStart(13, "0").slice(0, 13)}`,
    categories: raw.menu.map((c) => c.name),
    items,
    reviews,
  };
}

export const restaurants: Restaurant[] = RAW.map(build);
const byId = new Map(restaurants.map((r) => [r.id, r]));
const itemById = new Map(restaurants.flatMap((r) => r.items.map((i) => [i.id, i] as const)));

export const restaurantById = (id: string | null | undefined) => (id ? byId.get(id) : undefined);
export const itemByIdLookup = (id: string) => itemById.get(id);
export const restaurantOfItem = (itemId: string) => byId.get(itemId.split("--")[0]);

export const CUISINES = ["North Indian", "South Indian", "Biryani", "Pizza", "Chinese", "Healthy", "Street Food", "Seafood", "Burgers", "Desserts", "Momos", "Thali"];
export const cuisineArt: Record<string, Art> = {
  "North Indian": "bread", "South Indian": "dosa", Biryani: "rice", Pizza: "pizza", Chinese: "bowl", Healthy: "salad",
  "Street Food": "snack", Seafood: "fish", Burgers: "burger", Desserts: "dessert", Momos: "momo", Thali: "bowl",
};

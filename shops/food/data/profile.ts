/** Demo profile, cities and coupons. All fictional. */

export type Address = { id: string; label: string; name: string; line1: string; line2: string; city: string; pin: string };

export const DEMO_USER = { name: "Ananya Rao", phone: "+91 90000 12345", email: "ananya.demo@forkful.example" };

export const SAVED_ADDRESSES: Address[] = [
  { id: "home", label: "Home", name: "Ananya Rao", line1: "Flat 4B, Lakeview Residency, 12th Main Road", line2: "HAL 2nd Stage, Indiranagar", city: "Bengaluru", pin: "560038" },
  { id: "work", label: "Work", name: "Ananya Rao", line1: "Floor 6, Orbit Tech Park, Outer Ring Road", line2: "Bellandur", city: "Bengaluru", pin: "560103" },
];

/** City → neighbourhoods; restaurant areas are picked from the chosen city. */
export const CITIES: Record<string, string[]> = {
  Bengaluru: ["Indiranagar", "Jayanagar", "Koramangala", "HSR Layout", "BTM Layout", "Whitefield", "Malleshwaram", "Ulsoor", "Basavanagudi", "Kammanahalli", "Rajajinagar", "JP Nagar"],
  Mumbai: ["Bandra West", "Andheri East", "Powai", "Dadar", "Colaba", "Malad West", "Chembur", "Juhu", "Lower Parel", "Goregaon", "Vile Parle", "Thane West"],
  Delhi: ["Connaught Place", "Hauz Khas", "Lajpat Nagar", "Saket", "Rajouri Garden", "Karol Bagh", "Dwarka", "Greater Kailash", "Vasant Kunj", "Pitampura", "Mayur Vihar", "Janakpuri"],
  Hyderabad: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur", "Begumpet", "Ameerpet", "Kukatpally", "Secunderabad", "Himayatnagar", "Tolichowki", "Miyapur"],
  Chennai: ["T. Nagar", "Adyar", "Anna Nagar", "Velachery", "Mylapore", "Nungambakkam", "Besant Nagar", "OMR Thoraipakkam", "Porur", "Tambaram", "Kilpauk", "Guindy"],
  Pune: ["Koregaon Park", "Baner", "Kothrud", "Viman Nagar", "Hinjewadi", "Aundh", "Kalyani Nagar", "Wakad", "Shivaji Nagar", "Hadapsar", "Camp", "Kharadi"],
  Kolkata: ["Park Street", "Salt Lake", "Ballygunge", "New Town", "Gariahat", "Behala", "Esplanade", "Tollygunge", "Dum Dum", "Alipore", "Bhowanipore", "Rajarhat"],
  Ahmedabad: ["Navrangpura", "Satellite", "Bodakdev", "Prahlad Nagar", "Vastrapur", "Maninagar", "Paldi", "Thaltej", "Bopal", "Ellisbridge", "Chandkheda", "Gota"],
  Jaipur: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Raja Park", "Mansarovar", "Tonk Road", "Bani Park", "Jagatpura", "MI Road", "Civil Lines", "Sodala", "Shyam Nagar"],
  Kochi: ["Kakkanad", "Edappally", "Panampilly Nagar", "Fort Kochi", "Kadavanthra", "Vyttila", "Marine Drive", "Palarivattom", "Kaloor", "Thrippunithura", "Aluva", "Vytilla Hub"],
};

export type Coupon = { code: string; title: string; terms: string; min: number; flat?: number; percent?: number; cap?: number; restaurants?: string[] };

export const COUPONS: Coupon[] = [
  { code: "WELCOME60", title: "₹60 off", terms: "On item total of ₹249 or more. Valid at every restaurant.", min: 249, flat: 60 },
  { code: "FEAST100", title: "₹100 off", terms: "On item total of ₹699 or more at participating restaurants.", min: 699, flat: 100, restaurants: ["tandoor-tales", "bamboo-steam-house", "biryani-bagh", "coastal-kadai"] },
  { code: "TREAT15", title: "15% off up to ₹75", terms: "On item total of ₹199 or more at participating restaurants.", min: 199, percent: 15, cap: 75, restaurants: ["chaat-chowk", "sugar-saffron", "thukpa-trail", "crust-collective"] },
];

export const couponsFor = (restaurantId: string) => COUPONS.filter((c) => !c.restaurants || c.restaurants.includes(restaurantId));
export const restaurantOffers = (restaurantId: string) => COUPONS.filter((c) => c.restaurants?.includes(restaurantId));

/** Discount in rupees for an item total, or 0 if the coupon doesn't apply. */
export function couponDiscount(c: Coupon | undefined, restaurantId: string, itemTotal: number): number {
  if (!c || (c.restaurants && !c.restaurants.includes(restaurantId)) || itemTotal < c.min) return 0;
  if (c.flat) return c.flat;
  return Math.min(c.cap ?? Infinity, Math.round((itemTotal * (c.percent ?? 0)) / 100));
}

export const findCoupon = (code: string | null | undefined) => COUPONS.find((c) => c.code === code?.trim().toUpperCase());

export const PLATFORM_FEE = 6;
export const PASS_PRICE = 99;
export const DONATION = 3;
export const TIPS = [20, 30, 50];
export const GST_FOOD = 0.05;
export const GST_SERVICE = 0.18;

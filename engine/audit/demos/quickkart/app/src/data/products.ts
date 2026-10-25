export type Product = {
  id: string; name: string; genericName: string; brand: string; price: number; mrp: number;
  /** Lowest price in the 30 days before the current offer. */
  lowest30d: number; netQuantity: string; unitPrice: string; packedOn: string; bestBefore: string;
  manufacturer: string; countryOfOrigin: string; importer?: string; consumerCare: string;
  seller: { name: string; address: string; rating: number };
  stock: number; rating: number; deliveryHours: number; sponsored: boolean; offerEndsAt?: string;
};

export const PRODUCTS: Product[] = [
  { id: "atta-5", name: "Whole Wheat Atta 5 kg", genericName: "Whole wheat flour (atta)", brand: "Annapoorna Mills", price: 289, mrp: 330, lowest30d: 289, netQuantity: "5 kg", unitPrice: "₹57.80 / kg",
    packedOn: "2026-10-02", bestBefore: "2027-01-02", manufacturer: "Annapoorna Mills Pvt Ltd, Indore", countryOfOrigin: "India", consumerCare: "1800 120 4455",
    seller: { name: "Sri Lakshmi Traders", address: "Peenya Industrial Area, Bengaluru 560058", rating: 4.5 }, stock: 120, rating: 4.4, deliveryHours: 2, sponsored: false },
  { id: "olive-1", name: "Extra Virgin Olive Oil 1 L", genericName: "Edible olive oil (extra virgin)", brand: "Verdea", price: 849, mrp: 999, lowest30d: 879, netQuantity: "1 L", unitPrice: "₹84.90 / 100 ml",
    packedOn: "2026-07-15", bestBefore: "2028-07-14", manufacturer: "Oleícola Verdea S.L., Jaén", countryOfOrigin: "Spain",
    importer: "Mediterra Foods India LLP, Mumbai 400072", consumerCare: "022 6120 7788",
    seller: { name: "Mediterra Foods India LLP", address: "Andheri East, Mumbai 400072", rating: 4.6 }, stock: 3, rating: 4.7, deliveryHours: 4, sponsored: false, offerEndsAt: "2026-11-02T23:59:00+05:30" },
  { id: "tea-500", name: "Assam CTC Tea 500 g", genericName: "Black tea (CTC)", brand: "Bramhaputra Estates", price: 245, mrp: 260, lowest30d: 245, netQuantity: "500 g", unitPrice: "₹49 / 100 g",
    packedOn: "2026-09-20", bestBefore: "2027-09-19", manufacturer: "Bramhaputra Estates, Dibrugarh", countryOfOrigin: "India", consumerCare: "1800 345 0011",
    seller: { name: "Sri Lakshmi Traders", address: "Peenya Industrial Area, Bengaluru 560058", rating: 4.5 }, stock: 60, rating: 4.3, deliveryHours: 2, sponsored: true },
];

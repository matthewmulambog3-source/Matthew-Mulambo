export interface Candle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  color: string; // Hex code for wax color
  vessel: string; // 'Amber Glass' | 'Matte Ceramic Slate' | 'Frosted Quartz'
  wick: string; // 'Wooden Wick (Crackling)' | 'Organic Cotton (Even Glow)'
  rating: number;
  reviewsCount: number;
  burnTime: string; // e.g., "60-70 Hours"
  weight: string; // e.g., "9.5 oz / 270g"
  category: "Classic" | "Bespoke" | "AI Scent Selection";
  collection?: "Prestige Heritage" | "Scholastic Scholar" | "Coastal & Nature";
  stockCount?: number; // How many physical candles are ready to sell
  imageUri?: string; // Optional custom submitted picture (Base64 or external url)
}

export interface CartItem {
  candle: Candle;
  quantity: number;
}

export interface VesselOption {
  name: string;
  description: string;
  colorClass: string;
  priceModifier: number;
}

export interface WickOption {
  name: string;
  description: string;
  priceModifier: number;
}

export interface ScentOption {
  id: string;
  name: string;
  category: "Base" | "Heart" | "Top";
  description: string;
  color: string; // Representative color for blending
}

export interface StudentOrder {
  orderId: string;
  studentName: string;
  studentId: string;
  studentEmail?: string;
  gradeClass: string;
  deliveryMethod: string;
  notes?: string;
  items: CartItem[];
  total: number;
  currency: "MZN" | "USD";
  timestamp: string;
  paymentMethod?: string;
  transactionId?: string;
  deliveryStatus?: "pending" | "delivered" | "confirmed_completed";
}

export const SCENT_OPTIONS: ScentOption[] = [
  // Base Notes (Deep, grounding)
  { id: "vanilla", name: "Warm Madagascar Vanilla", category: "Base", description: "Rich, creamy, comforting sweetness", color: "#f3e5ab" },
  { id: "cedarwood", name: "Smoked Himalayan Cedarwood", category: "Base", description: "Dry, woody, grounding forest floor", color: "#a0785a" },
  { id: "sandalwood", name: "Sandalwood & Velvet Musk", category: "Base", description: "Warm, soft, balsamic, precious timber", color: "#d2b48c" },
  { id: "patchouli", name: "Patchouli & Dark Vetiver", category: "Base", description: "Earthy, exotic, sweet, herbal depth", color: "#6e4f3a" },
  
  // Heart Notes (The body of the scent)
  { id: "rose", name: "Damask Rose & Velvet", category: "Heart", description: "Intense, deep, romantic floral honey", color: "#dca4b0" },
  { id: "lavender", name: "French Lavender Buds", category: "Heart", description: "Herbaceous, calming, timeless tranquility", color: "#a2a2d0" },
  { id: "jasmine", name: "Night-Blooming Jasmine", category: "Heart", description: "Heady, sweet, exotic nocturnal bloom", color: "#e3e4e5" },
  { id: "cinnamon", name: "Spiced Ceylon Cinnamon", category: "Heart", description: "Warm, dry-spicy, cozy and stimulating", color: "#b87333" },

  // Top Notes (The immediate breath)
  { id: "bergamot", name: "Calabrian Bergamot", category: "Top", description: "Fresh, zesty, sophisticated citrus blossom", color: "#cbd578" },
  { id: "eucalyptus", name: "Crushed Eucalyptus Leaves", category: "Top", description: "Minty-camphorous, clearing, crisp focus", color: "#8ea399" },
  { id: "sweetorange", name: "Blood Orange & Neroli", category: "Top", description: "Sunny, bright citrus with honeyed backnotes", color: "#ffa500" },
  { id: "peppermint", name: "Wild Field Peppermint", category: "Top", description: "Cooling, clean, stimulating mint burst", color: "#98ffd9" },
];

export const VESSEL_OPTIONS: VesselOption[] = [
  { name: "Amber Glass", description: "A vintage pharmaceutical look that radiates a warm, golden, nostalgic candle glow.", colorClass: "from-[#80501c] to-[#402005]", priceModifier: 0 },
  { name: "Matte Ceramic Slate", description: "A modern, minimalist architectural vessel crafted with sand-textured slate gray.", colorClass: "from-[#3a3d3c] to-[#1e1f1f]", priceModifier: 4 },
  { name: "Frosted Quartz", description: "An ethereal semi-translucent vessel that diffuses light in a soft, dreamy prism.", colorClass: "from-[#eceff1] to-[#cfd8dc]", priceModifier: 2 },
];

export const WICK_OPTIONS: WickOption[] = [
  { name: "Wooden Wick (Crackling)", description: "Sustainable organic cherrywood that mimics a miniature wood-burning fireplace crackle.", priceModifier: 2 },
  { name: "Organic Cotton (Even Glow)", description: "Classic Egyptian long-staple cotton wick for an extremely clean, soot-free, quiet burn.", priceModifier: 0 },
];

export const PRESET_CANDLES: Candle[] = [
  {
    id: "royal-crown",
    name: "Royal Crown",
    tagline: "Ouro de Sofala — Gold Crown & Laurels",
    description: "A majestic fragrance honoring prestige and victory. Deep sandalwood, rich Madagascar vanilla, and velvet musk notes are crowned with blood orange and a hint of warm honeyed neroli.",
    price: 36,
    topNotes: ["Blood Orange", "Neroli Buds"],
    heartNotes: ["Warm Honey", "Ceylon Cinnamon"],
    baseNotes: ["Sandalwood Suede", "Velvet Musk"],
    color: "#D4AF37",
    vessel: "Amber Glass",
    wick: "Wooden Wick (Crackling)",
    rating: 4.9,
    reviewsCount: 142,
    burnTime: "60-70 Hours",
    weight: "9.5 oz / 270g",
    category: "Classic",
    collection: "Prestige Heritage",
    stockCount: 15
  },
  {
    id: "starry-wisdom",
    name: "Starry Wisdom",
    tagline: "Estrelas da Beira — Shield of Seven Stars",
    description: "An intellectual, clearing aroma crafted for nocturnal study sessions. Crisp wild peppermint and camphorous eucalyptus leaves rest upon dark vetiver and smoked cedarwood foundations.",
    price: 32,
    topNotes: ["Wild Peppermint", "Bergamot Zest"],
    heartNotes: ["Eucalyptus Leaf", "White Sage"],
    baseNotes: ["Smoked Cedarwood", "Dark Vetiver"],
    color: "#8A1540",
    vessel: "Matte Ceramic Slate",
    wick: "Organic Cotton (Even Glow)",
    rating: 4.8,
    reviewsCount: 95,
    burnTime: "60-70 Hours",
    weight: "9.5 oz / 270g",
    category: "Classic",
    collection: "Scholastic Scholar",
    stockCount: 8
  },
  {
    id: "scholastic-laurel",
    name: "Scholastic Laurel",
    tagline: "Páginas do Saber — Stack of Books",
    description: "Evokes the comforting atmosphere of the Prestige School archives. Scented with antique paperback paper, damask rose petal infusions, and dry Himalayan timber woods.",
    price: 34,
    topNotes: ["Calabrian Bergamot", "White Thyme"],
    heartNotes: ["Damask Rose", "Linen Accord"],
    baseNotes: ["Smoked Himalayan Cedar", "Amber Crystals"],
    color: "#2D6A4F",
    vessel: "Frosted Quartz",
    wick: "Wooden Wick (Crackling)",
    rating: 4.9,
    reviewsCount: 118,
    burnTime: "60-70 Hours",
    weight: "9.5 oz / 270g",
    category: "Classic",
    collection: "Scholastic Scholar",
    stockCount: 20
  },
  {
    id: "macuti-breeze",
    name: "Macuti Breeze",
    tagline: "Brisa de Macuti — Ocean Coast",
    description: "A crisp, fresh breath of Indian Ocean saltwater spray, sun-bleached driftwood, and crushed green garden herbs that invigorates the spirit and focuses the mind.",
    price: 32,
    topNotes: ["Indian Ocean Salt", "Lime Squeeze"],
    heartNotes: ["Ocean Thyme", "Eucalyptus Leaves"],
    baseNotes: ["Sun-Bleached Driftwood", "Warm Vetiver"],
    color: "#5B8C9E",
    vessel: "Frosted Quartz",
    wick: "Organic Cotton (Even Glow)",
    rating: 4.7,
    reviewsCount: 84,
    burnTime: "60-70 Hours",
    weight: "9.5 oz / 270g",
    category: "Classic",
    collection: "Coastal & Nature",
    stockCount: 12
  },
  {
    id: "prestige-unity",
    name: "Prestige Unity",
    tagline: "Sementes do Futuro — Children of the World",
    description: "A heartwarming, cozy scent designed for unity and friendship. Creamy Madagascar vanilla and rich sandalwood are blended with soft French lavender buds and hints of sweet clove.",
    price: 34,
    topNotes: ["Clove Bud", "Sweet Lavender"],
    heartNotes: ["French Lavender Buds", "Velvet Musk"],
    baseNotes: ["Madagascar Vanilla Suede", "Sandalwood Timber"],
    color: "#9C8474",
    vessel: "Amber Glass",
    wick: "Wooden Wick (Crackling)",
    rating: 4.9,
    reviewsCount: 156,
    burnTime: "60-70 Hours",
    weight: "9.5 oz / 270g",
    category: "Classic",
    collection: "Prestige Heritage",
    stockCount: 6
  }
];

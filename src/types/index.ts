export type Category =
  | "restaurant"
  | "cafe"
  | "hairdresser"
  | "doctor"
  | "dentist"
  | "lawyer"
  | "accountant"
  | "grocery"
  | "beauty"
  | "real-estate"
  | "other";

export interface Business {
  id: string;
  name: string;
  name_fa?: string; // Persian name
  category: Category;
  city?: string; // legacy — DB column renamed to canton
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  description?: string;
  description_fa?: string;
  logo_url?: string;
  image_url?: string;
  google_maps_url?: string;
  instagram?: string;
  canton?: string;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  lat?: number;
  lng?: number;
}

export interface CategoryMeta {
  slug: Category;
  label_en: string;
  label_fa: string;
  icon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: "restaurant", label_en: "Restaurant", label_fa: "رستوران", icon: "🍽️" },
  { slug: "cafe", label_en: "Café", label_fa: "کافه", icon: "☕" },
  { slug: "hairdresser", label_en: "Hairdresser", label_fa: "آرایشگاه", icon: "✂️" },
  { slug: "doctor", label_en: "Doctor", label_fa: "دکتر", icon: "🩺" },
  { slug: "dentist", label_en: "Dentist", label_fa: "دندانپزشک", icon: "🦷" },
  { slug: "lawyer", label_en: "Lawyer", label_fa: "وکیل", icon: "⚖️" },
  { slug: "accountant", label_en: "Accountant", label_fa: "حسابدار", icon: "📊" },
  { slug: "grocery", label_en: "Grocery", label_fa: "سوپرمارکت", icon: "🛒" },
  { slug: "beauty", label_en: "Beauty & Spa", label_fa: "سالن زیبایی", icon: "💅" },
  { slug: "real-estate", label_en: "Real Estate", label_fa: "مشاور املاک", icon: "🏠" },
  { slug: "other", label_en: "Other", label_fa: "سایر", icon: "🔍" },
];

export const SWISS_CANTONS = [
  "Aargau",
  "Appenzell Ausserrhoden",
  "Appenzell Innerrhoden",
  "Basel-Landschaft",
  "Basel-Stadt",
  "Bern",
  "Fribourg",
  "Geneva",
  "Glarus",
  "Graubünden",
  "Jura",
  "Lucerne",
  "Neuchâtel",
  "Nidwalden",
  "Obwalden",
  "Schaffhausen",
  "Schwyz",
  "Solothurn",
  "St. Gallen",
  "Thurgau",
  "Ticino",
  "Uri",
  "Valais",
  "Vaud",
  "Zug",
  "Zurich",
];

// Keep for backward compatibility
export const SWISS_CITIES = SWISS_CANTONS;

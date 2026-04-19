export type Category =
  | "restaurant"
  | "cafe"
  | "hairdresser"
  | "doctor"
  | "dentist"
  | "lawyer"
  | "grocery"
  | "other";

export interface Business {
  id: string;
  name: string;
  name_fa?: string;
  category: Category;
  country?: string;
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
  { slug: "grocery", label_en: "Grocery", label_fa: "سوپرمارکت", icon: "🛒" },
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

export const COUNTRIES = [
  "Switzerland",
  "Germany",
  "Austria",
  "France",
  "United Kingdom",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Belgium",
  "Italy",
  "Spain",
];

export const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  Switzerland: [
    "Aargau","Appenzell Ausserrhoden","Appenzell Innerrhoden","Basel-Landschaft",
    "Basel-Stadt","Bern","Fribourg","Geneva","Glarus","Graubünden","Jura","Lucerne",
    "Neuchâtel","Nidwalden","Obwalden","Schaffhausen","Schwyz","Solothurn",
    "St. Gallen","Thurgau","Ticino","Uri","Valais","Vaud","Zug","Zurich",
  ],
  Germany: [
    "Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg",
    "Hesse","Lower Saxony","Mecklenburg-Vorpommern","North Rhine-Westphalia",
    "Rhineland-Palatinate","Saarland","Saxony","Saxony-Anhalt",
    "Schleswig-Holstein","Thuringia",
  ],
  Austria: [
    "Burgenland","Carinthia","Lower Austria","Salzburg","Styria",
    "Tyrol","Upper Austria","Vienna","Vorarlberg",
  ],
  France: [
    "Auvergne-Rhône-Alpes","Bourgogne-Franche-Comté","Bretagne",
    "Centre-Val de Loire","Corse","Grand Est","Hauts-de-France",
    "Île-de-France","Normandie","Nouvelle-Aquitaine","Occitanie",
    "Pays de la Loire","Provence-Alpes-Côte d'Azur",
  ],
  "United Kingdom": [
    "England","Scotland","Wales","Northern Ireland",
    "London","South East","South West","East of England",
    "West Midlands","East Midlands","Yorkshire","North West","North East",
  ],
  Netherlands: [
    "Drenthe","Flevoland","Friesland","Gelderland","Groningen",
    "Limburg","North Brabant","North Holland","Overijssel",
    "South Holland","Utrecht","Zeeland",
  ],
  Sweden: [
    "Stockholm","Västra Götaland","Skåne","Östergötland","Uppsala",
    "Dalarna","Halland","Örebro","Västmanland","Jönköping",
  ],
  Norway: [
    "Oslo","Viken","Innlandet","Vestfold","Agder",
    "Rogaland","Vestland","Møre","Trøndelag","Nordland","Troms","Finnmark",
  ],
  Denmark: [
    "Copenhagen","Jutland","Funen","Zealand","Bornholm",
  ],
  Belgium: ["Brussels","Flanders","Wallonia"],
  Italy: [
    "Lombardy","Lazio","Campania","Sicily","Veneto",
    "Piedmont","Emilia-Romagna","Tuscany","Puglia","Calabria",
  ],
  Spain: [
    "Madrid","Catalonia","Andalusia","Valencia","Galicia",
    "Castile and León","Basque Country","Canary Islands","Murcia","Aragon",
  ],
};

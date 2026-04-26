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
  is_approved: boolean;
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
  // Europe
  "Albania","Andorra","Austria","Belarus","Belgium","Bosnia and Herzegovina",
  "Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland",
  "France","Germany","Greece","Hungary","Iceland","Ireland","Italy","Kosovo",
  "Latvia","Liechtenstein","Lithuania","Luxembourg","Malta","Moldova","Monaco",
  "Montenegro","Netherlands","North Macedonia","Norway","Poland","Portugal",
  "Romania","San Marino","Serbia","Slovakia","Slovenia","Spain","Sweden",
  "Switzerland","Ukraine","United Kingdom","Vatican City",
  // Middle East & Central Asia (excl. Iran)
  "Afghanistan","Armenia","Azerbaijan","Bahrain","Georgia","Iraq","Israel",
  "Jordan","Kazakhstan","Kuwait","Kyrgyzstan","Lebanon","Oman","Pakistan",
  "Palestine","Qatar","Saudi Arabia","Syria","Tajikistan","Turkey",
  "Turkmenistan","United Arab Emirates","Uzbekistan","Yemen",
  // North America
  "Canada","Mexico","United States",
  // Central America & Caribbean
  "Belize","Costa Rica","Cuba","Dominican Republic","El Salvador","Guatemala",
  "Haiti","Honduras","Jamaica","Nicaragua","Panama","Puerto Rico","Trinidad and Tobago",
  // South America
  "Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana",
  "Paraguay","Peru","Suriname","Uruguay","Venezuela",
  // Africa
  "Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cameroon",
  "Cape Verde","Central African Republic","Chad","Comoros","Congo",
  "Democratic Republic of Congo","Djibouti","Egypt","Equatorial Guinea","Eritrea",
  "Eswatini","Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau",
  "Ivory Coast","Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali",
  "Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria",
  "Rwanda","Senegal","Sierra Leone","Somalia","South Africa","South Sudan","Sudan",
  "Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe",
  // Asia & Pacific
  "Australia","Bangladesh","Bhutan","Brunei","Cambodia","China","East Timor",
  "Fiji","India","Indonesia","Japan","Laos","Malaysia","Maldives","Mongolia",
  "Myanmar","Nepal","New Zealand","North Korea","Papua New Guinea","Philippines",
  "Singapore","South Korea","Sri Lanka","Taiwan","Thailand","Vietnam",
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
  "United States": [
    "California","Texas","New York","Florida","Illinois","Pennsylvania",
    "Ohio","Georgia","North Carolina","Michigan","New Jersey","Virginia",
    "Washington","Arizona","Massachusetts","Tennessee","Indiana","Missouri",
    "Maryland","Wisconsin","Colorado","Minnesota","South Carolina","Alabama",
    "Louisiana","Kentucky","Oregon","Oklahoma","Connecticut","Utah","Nevada",
    "Iowa","Arkansas","Mississippi","Kansas","New Mexico","Nebraska","Idaho",
    "Hawaii","New Hampshire","Maine","Montana","Rhode Island","Delaware",
    "South Dakota","North Dakota","Alaska","Vermont","Wyoming",
  ],
  Canada: [
    "Ontario","Quebec","British Columbia","Alberta","Manitoba",
    "Saskatchewan","Nova Scotia","New Brunswick","Newfoundland and Labrador",
    "Prince Edward Island","Northwest Territories","Yukon","Nunavut",
  ],
  Australia: [
    "New South Wales","Victoria","Queensland","Western Australia",
    "South Australia","Tasmania","Australian Capital Territory","Northern Territory",
  ],
  "United Arab Emirates": [
    "Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah",
  ],
  Turkey: [
    "Istanbul","Ankara","Izmir","Antalya","Bursa","Adana","Gaziantep","Konya","Mersin","Kayseri",
  ],
};

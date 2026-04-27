export type Category =
  | "restaurant"
  | "cafe"
  | "hairdresser"
  | "doctor"
  | "dentist"
  | "lawyer"
  | "grocery"
  | "kitchen"
  | "school"
  | "carpet"
  | "airbnb"
  | "tour"
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

export type SquareLinkCategory = "student" | "cultural" | "media" | "religious" | "sport" | "charity" | "political" | "professional" | "other";

export interface SquareLink {
  id: number;
  square_id: number;
  title_en: string;
  title_fa?: string;
  url: string;
  category: SquareLinkCategory;
  sort_order: number;
}

export interface CitySquare {
  id: number;
  name_en: string;
  name_fa: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  description_en?: string;
  description_fa?: string;
  is_active: boolean;
  created_at: string;
  links: SquareLink[];
}

export const SQUARE_LINK_CATEGORIES: { slug: SquareLinkCategory; label_en: string; label_fa: string }[] = [
  { slug: "student",      label_en: "Student Association", label_fa: "انجمن دانشجویی" },
  { slug: "cultural",     label_en: "Cultural Group",      label_fa: "گروه فرهنگی" },
  { slug: "media",        label_en: "Media & Press",       label_fa: "رسانه و مطبوعات" },
  { slug: "religious",    label_en: "Religious & Mosque",  label_fa: "مذهبی و مسجد" },
  { slug: "sport",        label_en: "Sport Club",          label_fa: "باشگاه ورزشی" },
  { slug: "charity",      label_en: "Charity & NGO",       label_fa: "خیریه و سازمان مردم‌نهاد" },
  { slug: "political",    label_en: "Political & Civic",   label_fa: "سیاسی و مدنی" },
  { slug: "professional", label_en: "Professional Network",label_fa: "شبکه حرفه‌ای" },
  { slug: "other",        label_en: "Other",               label_fa: "سایر" },
];

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
  { slug: "kitchen", label_en: "Kitchen & Catering", label_fa: "آشپزخانه و کترینگ", icon: "🍳" },
  { slug: "school", label_en: "School & Classes", label_fa: "مدرسه و کلاس", icon: "🎓" },
  { slug: "carpet", label_en: "Carpet Shop", label_fa: "قالی‌فروشی", icon: "🪆" },
  { slug: "airbnb", label_en: "Airbnb & Rentals", label_fa: "اجاره مکان", icon: "🏠" },
  { slug: "tour", label_en: "Tour Guide", label_fa: "راهنمای تور", icon: "🗺️" },
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
  // Europe
  Switzerland: ["Zurich","Geneva","Basel","Bern","Lausanne","Lucerne","Winterthur","St. Gallen","Lugano","Biel","Zug","Schaffhausen","Thun","Fribourg","Neuchâtel","Sion","La Chaux-de-Fonds","Uster","Köniz","Vernier"],
  Germany: ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden","Hanover","Nuremberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster","Karlsruhe","Mannheim","Augsburg","Wiesbaden","Aachen","Braunschweig","Kiel","Freiburg","Erfurt","Mainz","Rostock","Kassel","Osnabrück","Heidelberg","Regensburg","Würzburg","Ulm","Wolfsburg","Göttingen","Chemnitz","Magdeburg","Halle","Ingolstadt"],
  Austria: ["Vienna","Graz","Linz","Salzburg","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn","Wiener Neustadt","Steyr","Feldkirch","Bregenz","Leoben"],
  France: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims","Le Havre","Saint-Étienne","Toulon","Grenoble","Dijon","Angers","Nîmes","Clermont-Ferrand","Brest","Tours","Amiens","Limoges","Metz","Perpignan","Besançon","Orléans","Mulhouse","Rouen","Caen","Nancy","Avignon","Poitiers"],
  "United Kingdom": ["London","Birmingham","Manchester","Glasgow","Liverpool","Bristol","Sheffield","Leeds","Edinburgh","Leicester","Coventry","Bradford","Nottingham","Newcastle","Southampton","Portsmouth","Cardiff","Aberdeen","Brighton","Derby","Plymouth","Wolverhampton","Belfast","Cambridge","Oxford","Reading","Sunderland","Huddersfield","Swansea","Bournemouth","Peterborough","Luton","Ipswich","Milton Keynes","Norwich","York","Bath","Exeter"],
  Netherlands: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Tilburg","Groningen","Almere","Breda","Nijmegen","Enschede","Apeldoorn","Haarlem","Arnhem","Amersfoort","Leiden","Maastricht","Delft","Deventer","Venlo","Leeuwarden"],
  Sweden: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg","Jönköping","Norrköping","Lund","Umeå","Gävle","Borås","Eskilstuna","Halmstad","Växjö","Karlstad","Sundsvall","Östersund","Luleå"],
  Norway: ["Oslo","Bergen","Trondheim","Stavanger","Drammen","Fredrikstad","Tromsø","Kristiansand","Sandnes","Ålesund","Sarpsborg","Bodø","Tønsberg","Hamar","Molde"],
  Denmark: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg","Randers","Kolding","Horsens","Vejle","Roskilde","Herning","Silkeborg","Næstved","Viborg"],
  Belgium: ["Brussels","Antwerp","Ghent","Charleroi","Liège","Bruges","Namur","Leuven","Mons","Aalst","Mechelen","Kortrijk","Hasselt","Ostend","Genk"],
  Italy: ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Bari","Catania","Venice","Verona","Messina","Padua","Trieste","Brescia","Taranto","Modena","Reggio Emilia","Perugia","Livorno","Cagliari","Foggia","Rimini","Salerno","Parma","Bergamo"],
  Spain: ["Madrid","Barcelona","Valencia","Seville","Zaragoza","Málaga","Murcia","Palma","Las Palmas","Bilbao","Alicante","Córdoba","Valladolid","Vigo","Gijón","La Coruña","Granada","Vitoria","Elche","Oviedo","Badalona","Cartagena","Terrassa","Jerez","Sabadell","Santa Cruz de Tenerife","Pamplona","Almería","Burgos","Santander"],
  Portugal: ["Lisbon","Porto","Braga","Coimbra","Funchal","Setúbal","Aveiro","Guimarães","Almada","Viseu","Faro","Cascais","Leiria","Vila Nova de Gaia","Matosinhos","Sintra","Viana do Castelo","Évora"],
  Poland: ["Warsaw","Kraków","Łódź","Wrocław","Poznań","Gdańsk","Szczecin","Bydgoszcz","Lublin","Katowice","Białystok","Gdynia","Częstochowa","Radom","Sosnowiec","Toruń","Kielce","Rzeszów","Gliwice","Olsztyn","Opole"],
  "Czech Republic": ["Prague","Brno","Ostrava","Plzeň","Liberec","Olomouc","Ústí nad Labem","České Budějovice","Hradec Králové","Pardubice","Zlín","Kladno","Jihlava","Teplice"],
  Hungary: ["Budapest","Debrecen","Miskolc","Szeged","Pécs","Győr","Nyíregyháza","Kecskemét","Székesfehérvár","Szombathely","Szolnok","Kaposvár","Sopron","Eger","Zalaegerszeg","Veszprém"],
  Romania: ["Bucharest","Cluj-Napoca","Timișoara","Iași","Constanța","Craiova","Brașov","Galați","Ploiești","Oradea","Brăila","Arad","Pitești","Sibiu","Bacău","Târgu Mureș","Baia Mare"],
  Bulgaria: ["Sofia","Plovdiv","Varna","Burgas","Ruse","Stara Zagora","Pleven","Sliven","Dobrich","Shumen","Pernik","Haskovo","Yambol","Pazardzhik","Blagoevgrad"],
  Greece: ["Athens","Thessaloniki","Patras","Piraeus","Heraklion","Larissa","Volos","Ioannina","Chania","Kavala","Serres","Rhodes","Corfu","Alexandroupoli"],
  Croatia: ["Zagreb","Split","Rijeka","Osijek","Zadar","Pula","Karlovac","Varaždin","Šibenik","Dubrovnik","Slavonski Brod"],
  Serbia: ["Belgrade","Novi Sad","Niš","Kragujevac","Subotica","Zrenjanin","Pančevo","Čačak","Leskovac","Novi Pazar"],
  Slovakia: ["Bratislava","Košice","Prešov","Žilina","Banská Bystrica","Nitra","Trnava","Martin","Trenčín","Poprad"],
  Slovenia: ["Ljubljana","Maribor","Celje","Kranj","Koper","Novo Mesto","Velenje","Ptuj"],
  "Bosnia and Herzegovina": ["Sarajevo","Banja Luka","Tuzla","Zenica","Mostar","Bijeljina","Prijedor"],
  Montenegro: ["Podgorica","Nikšić","Herceg Novi","Bar","Bijelo Polje","Cetinje"],
  "North Macedonia": ["Skopje","Bitola","Kumanovo","Ohrid","Tetovo","Gostivar","Strumica"],
  Albania: ["Tirana","Durrës","Vlorë","Shkodër","Elbasan","Fier","Korçë"],
  Kosovo: ["Pristina","Prizren","Ferizaj","Peja","Mitrovica","Gjilan","Gjakova"],
  Finland: ["Helsinki","Espoo","Tampere","Vantaa","Oulu","Turku","Jyväskylä","Lahti","Kuopio","Pori","Joensuu","Lappeenranta","Hämeenlinna","Vaasa","Rovaniemi"],
  Estonia: ["Tallinn","Tartu","Narva","Pärnu","Kohtla-Järve","Viljandi","Rakvere"],
  Latvia: ["Riga","Daugavpils","Liepāja","Jelgava","Jūrmala","Ventspils","Rēzekne","Valmiera"],
  Lithuania: ["Vilnius","Kaunas","Klaipėda","Šiauliai","Panevėžys","Alytus","Marijampolė"],
  Belarus: ["Minsk","Gomel","Mogilev","Vitebsk","Grodno","Brest","Bobruisk","Baranovichi"],
  Ukraine: ["Kyiv","Kharkiv","Odessa","Dnipro","Zaporizhzhia","Lviv","Kryvyi Rih","Mykolaiv","Vinnytsia","Simferopol","Chernivtsi","Poltava","Kherson","Cherkasy","Zhytomyr","Chernihiv"],
  Moldova: ["Chișinău","Tiraspol","Bălți","Cahul","Ungheni","Soroca"],
  Ireland: ["Dublin","Cork","Limerick","Galway","Waterford","Drogheda","Dundalk","Kilkenny","Dún Laoghaire","Bray","Tralee"],
  Iceland: ["Reykjavik","Kopavogur","Hafnarfjörður","Akureyri","Reykjanesbær"],
  Luxembourg: ["Luxembourg City","Esch-sur-Alzette","Dudelange","Differdange","Petange"],
  Malta: ["Valletta","Birkirkara","Qormi","Mosta","Sliema","St. Julian's","Msida"],
  Cyprus: ["Nicosia","Limassol","Larnaca","Paphos","Famagusta","Kyrenia"],
  // Middle East & Central Asia
  Turkey: ["Istanbul","Ankara","Izmir","Bursa","Adana","Gaziantep","Konya","Antalya","Kayseri","Mersin","Diyarbakır","Eskişehir","Urfa","Samsun","Denizli","Malatya","Trabzon","Erzurum","Van","Kocaeli","Manisa","Balıkesir"],
  "United Arab Emirates": ["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Al Ain","Fujairah","Umm Al Quwain"],
  "Saudi Arabia": ["Riyadh","Jeddah","Mecca","Medina","Dammam","Khobar","Jubail","Tabuk","Abha","Buraidah","Taif","Yanbu","Najran","Jizan","Hail"],
  Israel: ["Tel Aviv","Jerusalem","Haifa","Rishon LeZion","Petah Tikva","Ashdod","Netanya","Beer Sheva","Bnei Brak","Holon","Bat Yam","Ramat Gan","Rehovot","Herzliya","Nazareth","Eilat"],
  Jordan: ["Amman","Zarqa","Irbid","Russeifa","Aqaba","Madaba","Mafraq","Al-Karak"],
  Lebanon: ["Beirut","Tripoli","Sidon","Tyre","Jounieh","Zahle","Baalbek","Nabatieh"],
  Syria: ["Damascus","Aleppo","Homs","Latakia","Hama","Deir ez-Zor","Raqqa","Idlib","Tartus"],
  Iraq: ["Baghdad","Basra","Mosul","Erbil","Najaf","Karbala","Kirkuk","Sulaymaniyah","Fallujah","Ramadi"],
  Kuwait: ["Kuwait City","Hawalli","Salmiya","Farwaniya","Ahmadi","Jahra","Fahaheel"],
  Bahrain: ["Manama","Muharraq","Riffa","Hamad Town","Isa Town","Sitra"],
  Qatar: ["Doha","Al Rayyan","Al Wakrah","Al Khor","Lusail","Umm Salal"],
  Oman: ["Muscat","Salalah","Sohar","Nizwa","Sur","Ibri","Rustaq","Buraimi"],
  Yemen: ["Sanaa","Aden","Taiz","Hodeidah","Ibb","Mukalla","Dhamar"],
  Palestine: ["Gaza","Ramallah","Nablus","Hebron","Jenin","Jericho","Tulkarm","Bethlehem"],
  Afghanistan: ["Kabul","Kandahar","Herat","Mazar-i-Sharif","Jalalabad","Kunduz","Ghazni"],
  Pakistan: ["Karachi","Lahore","Faisalabad","Rawalpindi","Gujranwala","Peshawar","Multan","Hyderabad","Islamabad","Quetta","Sialkot","Bahawalpur","Sargodha","Sukkur"],
  Kazakhstan: ["Almaty","Nur-Sultan","Shymkent","Karaganda","Aktobe","Taraz","Pavlodar","Ust-Kamenogorsk","Semey","Atyrau"],
  Uzbekistan: ["Tashkent","Samarkand","Namangan","Andijan","Nukus","Bukhara","Fergana","Qarshi","Kokand"],
  Turkmenistan: ["Ashgabat","Turkmenbashi","Mary","Türkmenabat","Daşoguz"],
  Tajikistan: ["Dushanbe","Khujand","Qurghonteppa","Kulob","Konibodom"],
  Kyrgyzstan: ["Bishkek","Osh","Jalal-Abad","Tokmok","Karakol"],
  Georgia: ["Tbilisi","Kutaisi","Batumi","Rustavi","Zugdidi","Gori","Poti"],
  Armenia: ["Yerevan","Gyumri","Vanadzor","Vagharshapat","Hrazdan","Abovyan"],
  Azerbaijan: ["Baku","Ganja","Sumqayit","Mingachevir","Nakhchivan","Lankaran","Shaki"],
  // North America
  "United States": ["New York City","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Nashville","El Paso","Washington DC","Las Vegas","Louisville","Portland","Oklahoma City","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Kansas City","Atlanta","Mesa","Omaha","Colorado Springs","Raleigh","Long Beach","Virginia Beach","Minneapolis","Tampa","New Orleans","Arlington","Wichita","Bakersfield","Aurora","Anaheim","Santa Ana","Corpus Christi","Riverside","Pittsburgh","Anchorage","Cincinnati","St. Paul","Greensboro","Newark","Plano","Henderson","Lincoln","Buffalo","Jersey City","Chula Vista","St. Petersburg","Norfolk","Chandler","Laredo","Madison","Durham","Lubbock","Garland","Glendale","Hialeah","Reno","Baton Rouge","Irvine","Irving","Scottsdale","Fremont","Gilbert","San Bernardino","Birmingham","Boise","Rochester","Spokane","Des Moines","Modesto","Tacoma","Fontana","Akron","Yonkers","Huntington Beach","Little Rock","Augusta","Grand Rapids","Tallahassee","Knoxville","Worcester","Providence","Fort Collins","Detroit","Miami","Baltimore","Boston"],
  Canada: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Kitchener","London","Halifax","Victoria","Saskatoon","Regina","Windsor","Barrie","Kelowna","Burnaby","Surrey","Brampton","Mississauga","Markham","Oakville","Longueuil","Laval","Gatineau","Sherbrooke","Trois-Rivières","Abbotsford","Coquitlam","Sudbury","Kingston","Thunder Bay","Guelph","Moncton","St. John's"],
  Mexico: ["Mexico City","Guadalajara","Monterrey","Puebla","Tijuana","Toluca","León","Juárez","Zapopan","Mérida","San Luis Potosí","Aguascalientes","Hermosillo","Saltillo","Mexicali","Culiacán","Chihuahua","Acapulco","Veracruz","Morelia","Querétaro","Cancún","Oaxaca","Torreón"],
  // Central America & Caribbean
  Guatemala: ["Guatemala City","Mixco","Villa Nueva","Quetzaltenango","Escuintla","Huehuetenango"],
  Belize: ["Belize City","San Ignacio","Orange Walk","Belmopan","Dangriga"],
  Honduras: ["Tegucigalpa","San Pedro Sula","Choloma","La Ceiba","El Progreso","Choluteca"],
  "El Salvador": ["San Salvador","Soyapango","Santa Ana","San Miguel","Mejicanos"],
  Nicaragua: ["Managua","León","Masaya","Chinandega","Matagalpa","Estelí"],
  "Costa Rica": ["San José","Cartago","Alajuela","Heredia","Liberia","Puntarenas"],
  Panama: ["Panama City","San Miguelito","David","Colón","Arraiján","La Chorrera"],
  Cuba: ["Havana","Santiago de Cuba","Camaguey","Holguín","Santa Clara","Guantánamo"],
  "Dominican Republic": ["Santo Domingo","Santiago de los Caballeros","San Pedro de Macorís","La Romana","Puerto Plata"],
  Haiti: ["Port-au-Prince","Cap-Haïtien","Gonaïves","Saint-Marc","Les Cayes"],
  Jamaica: ["Kingston","Montego Bay","Spanish Town","Portmore","Ocho Rios","Mandeville"],
  "Puerto Rico": ["San Juan","Bayamón","Carolina","Ponce","Caguas","Guaynabo","Arecibo"],
  "Trinidad and Tobago": ["Port of Spain","San Fernando","Arima","Chaguanas"],
  // South America
  Brazil: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Goiânia","Belém","Porto Alegre","Campinas","São Luís","Maceió","Natal","Teresina","Campo Grande","João Pessoa","Ribeirão Preto","Sorocaba","Uberlândia","Florianópolis","São Gonçalo","Feira de Santana","Aracaju","Cuiabá","Joinville"],
  Argentina: ["Buenos Aires","Córdoba","Rosario","Mendoza","Tucumán","La Plata","Mar del Plata","Salta","Santa Fe","San Juan","Corrientes","Neuquén","Bahía Blanca","Resistencia","Posadas"],
  Colombia: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Bucaramanga","Pereira","Santa Marta","Ibagué","Manizales","Neiva","Villavicencio","Armenia","Pasto"],
  Venezuela: ["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay","Ciudad Guayana","Barcelona","Maturín","Cumaná"],
  Peru: ["Lima","Arequipa","Trujillo","Chiclayo","Huancayo","Piura","Iquitos","Chimbote","Cusco","Callao","Tacna"],
  Chile: ["Santiago","Valparaíso","Concepción","La Serena","Antofagasta","Temuco","Iquique","Puerto Montt","Rancagua","Talca","Arica"],
  Ecuador: ["Quito","Guayaquil","Cuenca","Santo Domingo","Ambato","Manta","Portoviejo","Esmeraldas"],
  Bolivia: ["Santa Cruz","La Paz","Cochabamba","Oruro","Sucre","Potosí","Tarija"],
  Paraguay: ["Asunción","Ciudad del Este","Luque","San Lorenzo","Capiatá","Lambaré"],
  Uruguay: ["Montevideo","Salto","Paysandú","Las Piedras","Rivera","Maldonado"],
  Guyana: ["Georgetown","Linden","New Amsterdam","Bartica"],
  Suriname: ["Paramaribo","Lelydorp","Nieuw Nickerie"],
  // Africa
  Egypt: ["Cairo","Alexandria","Giza","Port Said","Suez","Luxor","Mansoura","Tanta","Assiut","Ismailia","Aswan","Damietta","Zagazig","Hurghada","Sharm El Sheikh","Fayoum"],
  Morocco: ["Casablanca","Rabat","Fez","Marrakech","Agadir","Tangier","Meknes","Oujda","Kenitra","Tetouan","Safi","El Jadida","Nador","Beni Mellal"],
  Algeria: ["Algiers","Oran","Constantine","Annaba","Blida","Batna","Sétif","Sidi Bel Abbès","Biskra","Tébessa","Béjaïa","Tlemcen","Mostaganem","Skikda","Tiaret"],
  Tunisia: ["Tunis","Sfax","Sousse","Kairouan","Bizerte","Gabès","Ariana","Monastir","Nabeul","Hammamet","Gafsa","Djerba"],
  Libya: ["Tripoli","Benghazi","Misrata","Bayda","Zawiya","Ajdabiya","Sirt","Sabha","Tobruk"],
  "South Africa": ["Johannesburg","Cape Town","Durban","Pretoria","Port Elizabeth","Bloemfontein","East London","Polokwane","Nelspruit","Pietermaritzburg","Rustenburg","George","Kimberley"],
  Nigeria: ["Lagos","Abuja","Kano","Ibadan","Port Harcourt","Benin City","Maiduguri","Zaria","Aba","Jos","Ilorin","Enugu","Abeokuta","Kaduna","Warri","Sokoto","Owerri","Akure"],
  Kenya: ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Malindi","Kitale","Nyeri","Meru","Machakos","Kakamega"],
  Ethiopia: ["Addis Ababa","Dire Dawa","Mekelle","Gondar","Adama","Hawassa","Bahir Dar","Dessie","Jimma","Jijiga"],
  Ghana: ["Accra","Kumasi","Tamale","Sekondi-Takoradi","Cape Coast","Tema","Koforidua","Sunyani","Ho"],
  Tanzania: ["Dar es Salaam","Arusha","Mwanza","Zanzibar City","Dodoma","Moshi","Tanga","Morogoro"],
  Sudan: ["Khartoum","Omdurman","Khartoum North","Port Sudan","Kassala","Wad Madani","Gedaref"],
  "South Sudan": ["Juba","Malakal","Wau","Yei","Rumbek","Aweil"],
  Angola: ["Luanda","Huambo","Lobito","Benguela","Kuito","Lubango","Malanje","Namibe"],
  Mozambique: ["Maputo","Beira","Nampula","Chimoio","Quelimane","Tete","Pemba"],
  Uganda: ["Kampala","Gulu","Mbarara","Jinja","Mbale","Entebbe","Lira"],
  Rwanda: ["Kigali","Gisenyi","Butare","Gitarama","Ruhengeri","Cyangugu"],
  Cameroon: ["Douala","Yaoundé","Bamenda","Bafoussam","Maroua","Ngaoundéré","Garoua"],
  "Ivory Coast": ["Abidjan","Yamoussoukro","Bouaké","Daloa","Korhogo","San-Pédro","Man","Divo"],
  Senegal: ["Dakar","Pikine","Touba","Thiès","Rufisque","Kaolack","Ziguinchor","Saint-Louis"],
  Mali: ["Bamako","Sikasso","Mopti","Ségou","Kayes","Gao","Koutiala"],
  "Burkina Faso": ["Ouagadougou","Bobo-Dioulasso","Koudougou","Ouahigouya","Banfora"],
  Niger: ["Niamey","Zinder","Maradi","Tahoua","Agadez","Dosso"],
  Somalia: ["Mogadishu","Hargeisa","Bosaso","Kismayo","Berbera","Galkayo"],
  Djibouti: ["Djibouti City","Ali Sabieh","Tadjoura","Obock"],
  Eritrea: ["Asmara","Assab","Keren","Massawa","Mendefera"],
  Madagascar: ["Antananarivo","Toamasina","Antsirabe","Fianarantsoa","Mahajanga","Toliara"],
  Gabon: ["Libreville","Port-Gentil","Franceville","Oyem","Moanda"],
  Congo: ["Brazzaville","Pointe-Noire","Dolisie","Nkayi"],
  "Democratic Republic of Congo": ["Kinshasa","Lubumbashi","Mbuji-Mayi","Kananga","Kisangani","Bukavu","Kolwezi","Likasi","Uvira"],
  "Central African Republic": ["Bangui","Bimbo","Berbérati","Carnot","Bambari"],
  Chad: ["N'Djamena","Moundou","Abéché","Sarh","Kélo","Doba"],
  Benin: ["Cotonou","Porto-Novo","Abomey-Calavi","Parakou","Godomey","Djougou"],
  Togo: ["Lomé","Sokodé","Kara","Atakpamé","Kpalimé"],
  Liberia: ["Monrovia","Gbarnga","Kakata","Buchanan","Voinjama"],
  "Sierra Leone": ["Freetown","Bo","Kenema","Koidu","Makeni"],
  Gambia: ["Banjul","Serekunda","Brikama","Bakau","Farafenni"],
  Mauritania: ["Nouakchott","Nouadhibou","Rosso","Kaédi","Zouerate"],
  "Cape Verde": ["Praia","Mindelo","Santa Maria","Assomada"],
  Comoros: ["Moroni","Mutsamudu","Fomboni","Domoni"],
  Mauritius: ["Port Louis","Beau Bassin","Vacoas","Curepipe","Quatre Bornes","Rose Hill"],
  Eswatini: ["Mbabane","Manzini","Big Bend","Nhlangano"],
  Lesotho: ["Maseru","Teyateyaneng","Mafeteng","Hlotse"],
  Malawi: ["Lilongwe","Blantyre","Mzuzu","Zomba","Karonga"],
  Burundi: ["Gitega","Bujumbura","Muyinga","Ngozi","Rumonge"],
  Namibia: ["Windhoek","Rundu","Walvis Bay","Oshakati","Swakopmund","Grootfontein"],
  Botswana: ["Gaborone","Francistown","Molepolole","Maun","Kanye","Serowe"],
  Zambia: ["Lusaka","Kitwe","Ndola","Kabwe","Chingola","Livingstone","Luanshya"],
  Zimbabwe: ["Harare","Bulawayo","Chitungwiza","Mutare","Gweru","Kwekwe","Masvingo"],
  // Asia & Pacific
  India: ["Mumbai","Delhi","Bangalore","Hyderabad","Ahmedabad","Chennai","Kolkata","Pune","Surat","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Patna","Vadodara","Bhopal","Visakhapatnam","Ludhiana","Agra","Nashik","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Ranchi","Coimbatore","Amritsar","Jodhpur","Chandigarh","Guwahati","Mysore","Madurai","Thiruvananthapuram","Gwalior","Vijayawada","Allahabad","Kota"],
  China: ["Shanghai","Beijing","Guangzhou","Shenzhen","Chengdu","Chongqing","Tianjin","Wuhan","Xi'an","Hangzhou","Nanjing","Shenyang","Harbin","Changchun","Qingdao","Dongguan","Foshan","Jinan","Changsha","Dalian","Kunming","Guiyang","Hefei","Suzhou","Nanchang","Zhengzhou","Taiyuan","Nanning","Shijiazhuang","Fuzhou","Urumqi","Wuxi","Wenzhou","Xiamen","Ningbo"],
  Japan: ["Tokyo","Yokohama","Osaka","Nagoya","Sapporo","Fukuoka","Kobe","Kawasaki","Kyoto","Saitama","Hiroshima","Sendai","Kitakyushu","Chiba","Sakai","Niigata","Hamamatsu","Shizuoka","Okayama","Kumamoto","Kagoshima","Matsuyama","Utsunomiya","Kanazawa","Oita","Kurashiki"],
  "South Korea": ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Suwon","Ulsan","Changwon","Seongnam","Goyang","Bucheon","Yongin","Cheongju","Jeonju","Ansan"],
  Indonesia: ["Jakarta","Surabaya","Bandung","Medan","Bekasi","Depok","Tangerang","Semarang","Makassar","Palembang","Batam","Pekanbaru","Bogor","Malang","Padang","Denpasar"],
  Bangladesh: ["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Comilla","Narayanganj","Gazipur","Rangpur","Mymensingh"],
  Vietnam: ["Hanoi","Ho Chi Minh City","Da Nang","Hai Phong","Bien Hoa","Hue","Nha Trang","Can Tho","Vung Tau"],
  Philippines: ["Manila","Quezon City","Davao","Caloocan","Cebu City","Zamboanga","Antipolo","Pasig","Taguig","Valenzuela","Makati","Cagayan de Oro","Parañaque","General Santos"],
  Thailand: ["Bangkok","Chiang Mai","Pattaya","Phuket","Khon Kaen","Hat Yai","Nakhon Ratchasima","Udon Thani","Nonthaburi","Surat Thani","Rayong","Chonburi"],
  Malaysia: ["Kuala Lumpur","George Town","Johor Bahru","Ipoh","Shah Alam","Petaling Jaya","Kota Kinabalu","Kuching","Subang Jaya","Klang","Seremban","Kota Bharu","Malacca City","Kuantan","Alor Setar"],
  Myanmar: ["Yangon","Mandalay","Naypyidaw","Mawlamyine","Bago","Pathein","Sittwe","Taunggyi","Monywa"],
  "Sri Lanka": ["Colombo","Dehiwala-Mount Lavinia","Moratuwa","Jaffna","Negombo","Kandy","Galle","Trincomalee","Batticaloa"],
  Nepal: ["Kathmandu","Pokhara","Lalitpur","Bharatpur","Biratnagar","Birgunj","Dharan","Bhaktapur"],
  Cambodia: ["Phnom Penh","Siem Reap","Preah Sihanouk","Battambang","Kampong Cham"],
  Laos: ["Vientiane","Savannakhet","Luang Prabang","Pakse","Thakhek"],
  Mongolia: ["Ulaanbaatar","Erdenet","Darkhan","Khovd","Mörön"],
  Taiwan: ["Taipei","New Taipei","Taichung","Kaohsiung","Taoyuan","Tainan","Hsinchu","Keelung","Chiayi"],
  Singapore: ["Singapore","Jurong","Woodlands","Tampines","Ang Mo Kio","Bedok","Clementi","Yishun"],
  Brunei: ["Bandar Seri Begawan","Kuala Belait","Seria","Tutong"],
  Bhutan: ["Thimphu","Phuntsholing","Paro","Punakha"],
  Maldives: ["Malé","Addu City","Fuvahmulah"],
  "East Timor": ["Dili","Baucau","Maliana","Suai"],
  Fiji: ["Suva","Lautoka","Nadi","Labasa"],
  "Papua New Guinea": ["Port Moresby","Lae","Mount Hagen","Madang","Wewak"],
  "New Zealand": ["Auckland","Wellington","Christchurch","Hamilton","Tauranga","Dunedin","Palmerston North","Nelson","Rotorua","Napier","Whangarei","New Plymouth","Invercargill"],
  Australia: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Newcastle","Wollongong","Sunshine Coast","Hobart","Geelong","Townsville","Cairns","Darwin","Toowoomba","Ballarat","Bendigo","Bunbury","Hervey Bay","Wagga Wagga","Mackay","Rockhampton"],
  "North Korea": ["Pyongyang","Hamhung","Chongjin","Nampo","Wonsan","Sinuiju"],
  // Europe remaining small
  Andorra: ["Andorra la Vella","Escaldes-Engordany","Encamp","Sant Julià de Lòria"],
  Liechtenstein: ["Vaduz","Schaan","Triesen","Balzers","Eschen"],
  Monaco: ["Monaco","Monte Carlo","La Condamine","Fontvieille"],
  "San Marino": ["San Marino","Serravalle","Fiorentino","Borgo Maggiore"],
  "Vatican City": ["Vatican City"],
};

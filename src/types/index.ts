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
  owner_user_id?: number | null;
  owner_name?: string | null;
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
  Switzerland: ["Basel","Bern","Biel","Frauenfeld","Fribourg","Geneva","Köniz","La Chaux-de-Fonds","Lausanne","Lucerne","Lugano","Neuchâtel","Schaffhausen","Sion","St. Gallen","Thun","Uster","Vernier","Winterthur","Zug","Zurich"],
  Germany: ["Aachen","Augsburg","Berlin","Bielefeld","Bochum","Bonn","Braunschweig","Bremen","Chemnitz","Cologne","Dortmund","Dresden","Duisburg","Düsseldorf","Erfurt","Essen","Frankfurt","Freiburg","Göttingen","Halle","Hamburg","Hanover","Heidelberg","Ingolstadt","Karlsruhe","Kassel","Kiel","Leipzig","Lübeck","Magdeburg","Mainz","Mannheim","Munich","Münster","Nuremberg","Osnabrück","Potsdam","Regensburg","Rostock","Saarbrücken","Stuttgart","Trier","Ulm","Wiesbaden","Wolfsburg","Wuppertal","Würzburg"],
  Austria: ["Bregenz","Dornbirn","Feldkirch","Graz","Innsbruck","Klagenfurt","Leoben","Linz","Salzburg","Sankt Pölten","Steyr","Vienna","Villach","Wels","Wiener Neustadt"],
  France: ["Amiens","Angers","Avignon","Besançon","Bordeaux","Brest","Caen","Clermont-Ferrand","Dijon","Grenoble","Le Havre","Lille","Limoges","Lyon","Marseille","Metz","Montpellier","Mulhouse","Nancy","Nantes","Nice","Nîmes","Orléans","Paris","Perpignan","Poitiers","Reims","Rennes","Rouen","Saint-Étienne","Strasbourg","Toulon","Toulouse","Tours"],
  "United Kingdom": ["Aberdeen","Bath","Belfast","Birmingham","Bournemouth","Bradford","Brighton","Bristol","Cambridge","Cardiff","Coventry","Derby","Edinburgh","Exeter","Glasgow","Huddersfield","Ipswich","Leeds","Leicester","Liverpool","London","Luton","Manchester","Milton Keynes","Newcastle","Norwich","Nottingham","Oxford","Peterborough","Plymouth","Portsmouth","Reading","Salford","Sheffield","Southampton","Sunderland","Swansea","Wolverhampton","York"],
  Netherlands: ["Almere","Amersfoort","Amsterdam","Apeldoorn","Arnhem","Breda","Delft","Deventer","Eindhoven","Enschede","Groningen","Haarlem","Leeuwarden","Leiden","Maastricht","Nijmegen","Rotterdam","The Hague","Tilburg","Utrecht","Venlo"],
  Sweden: ["Borås","Eskilstuna","Gävle","Gothenburg","Halmstad","Helsingborg","Jönköping","Karlstad","Linköping","Luleå","Lund","Malmö","Norrköping","Örebro","Östersund","Stockholm","Sundsvall","Umeå","Uppsala","Västerås","Växjö"],
  Norway: ["Ålesund","Bergen","Bodø","Drammen","Fredrikstad","Hamar","Kristiansand","Molde","Oslo","Sandnes","Sarpsborg","Stavanger","Tønsberg","Trondheim","Tromsø"],
  Denmark: ["Aalborg","Aarhus","Copenhagen","Esbjerg","Herning","Horsens","Kolding","Næstved","Odense","Randers","Roskilde","Silkeborg","Vejle","Viborg"],
  Belgium: ["Aalst","Antwerp","Bruges","Brussels","Charleroi","Genk","Ghent","Hasselt","Kortrijk","Leuven","Liège","Mechelen","Mons","Namur","Ostend"],
  Italy: ["Bari","Bergamo","Bologna","Brescia","Cagliari","Catania","Florence","Foggia","Genoa","Livorno","Messina","Milan","Modena","Naples","Padua","Palermo","Parma","Perugia","Reggio Emilia","Rimini","Rome","Salerno","Taranto","Trieste","Turin","Venice","Verona"],
  Spain: ["Alicante","Almería","Badalona","Barcelona","Bilbao","Burgos","Cartagena","Córdoba","Elche","Gijón","Granada","Jerez","La Coruña","Las Palmas","Madrid","Málaga","Murcia","Oviedo","Palma","Pamplona","Sabadell","Santa Cruz de Tenerife","Santander","Seville","Terrassa","Valencia","Valladolid","Vigo","Vitoria","Zaragoza"],
  Portugal: ["Almada","Aveiro","Braga","Cascais","Coimbra","Évora","Faro","Funchal","Guimarães","Leiria","Lisbon","Matosinhos","Porto","Setúbal","Sintra","Viana do Castelo","Vila Nova de Gaia","Viseu"],
  Poland: ["Białystok","Bydgoszcz","Częstochowa","Gdańsk","Gdynia","Gliwice","Katowice","Kielce","Kraków","Lublin","Łódź","Olsztyn","Opole","Poznań","Radom","Rzeszów","Sosnowiec","Szczecin","Toruń","Warsaw","Wrocław"],
  "Czech Republic": ["Brno","České Budějovice","Hradec Králové","Jihlava","Kladno","Liberec","Olomouc","Ostrava","Pardubice","Plzeň","Prague","Teplice","Ústí nad Labem","Zlín"],
  Hungary: ["Budapest","Debrecen","Eger","Győr","Kaposvár","Kecskemét","Miskolc","Nyíregyháza","Pécs","Sopron","Szeged","Székesfehérvár","Szolnok","Szombathely","Veszprém","Zalaegerszeg"],
  Romania: ["Arad","Bacău","Baia Mare","Brăila","Brașov","Bucharest","Cluj-Napoca","Constanța","Craiova","Galați","Iași","Oradea","Pitești","Ploiești","Sibiu","Târgu Mureș","Timișoara"],
  Bulgaria: ["Blagoevgrad","Burgas","Dobrich","Haskovo","Pazardzhik","Pernik","Pleven","Plovdiv","Ruse","Shumen","Sliven","Sofia","Stara Zagora","Varna","Yambol"],
  Greece: ["Alexandroupoli","Athens","Chania","Corfu","Heraklion","Ioannina","Kavala","Larissa","Patras","Piraeus","Rhodes","Serres","Thessaloniki","Volos"],
  Croatia: ["Dubrovnik","Karlovac","Osijek","Pula","Rijeka","Šibenik","Slavonski Brod","Split","Varaždin","Zadar","Zagreb"],
  Serbia: ["Belgrade","Čačak","Kragujevac","Leskovac","Niš","Novi Pazar","Novi Sad","Pančevo","Subotica","Zrenjanin"],
  Slovakia: ["Banská Bystrica","Bratislava","Košice","Martin","Nitra","Poprad","Prešov","Trenčín","Trnava","Žilina"],
  Slovenia: ["Celje","Koper","Kranj","Ljubljana","Maribor","Novo Mesto","Ptuj","Velenje"],
  "Bosnia and Herzegovina": ["Banja Luka","Bijeljina","Mostar","Prijedor","Sarajevo","Tuzla","Zenica"],
  Montenegro: ["Bar","Bijelo Polje","Cetinje","Herceg Novi","Nikšić","Podgorica"],
  "North Macedonia": ["Bitola","Gostivar","Kumanovo","Ohrid","Skopje","Strumica","Tetovo"],
  Albania: ["Durrës","Elbasan","Fier","Korçë","Shkodër","Tirana","Vlorë"],
  Kosovo: ["Ferizaj","Gjakova","Gjilan","Mitrovica","Peja","Pristina","Prizren"],
  Finland: ["Espoo","Hämeenlinna","Helsinki","Joensuu","Jyväskylä","Kuopio","Lahti","Lappeenranta","Oulu","Pori","Rovaniemi","Tampere","Turku","Vantaa","Vaasa"],
  Estonia: ["Kohtla-Järve","Narva","Pärnu","Tallinn","Tartu","Rakvere","Viljandi"],
  Latvia: ["Daugavpils","Jelgava","Jūrmala","Liepāja","Rēzekne","Riga","Valmiera","Ventspils"],
  Lithuania: ["Alytus","Kaunas","Klaipėda","Marijampolė","Panevėžys","Šiauliai","Vilnius"],
  Belarus: ["Baranovichi","Bobruisk","Brest","Gomel","Grodno","Minsk","Mogilev","Vitebsk"],
  Ukraine: ["Cherkasy","Chernihiv","Chernivtsi","Dnipro","Kharkiv","Kherson","Kyiv","Kryvyi Rih","Lviv","Mykolaiv","Odessa","Poltava","Simferopol","Vinnytsia","Zaporizhzhia","Zhytomyr"],
  Moldova: ["Bălți","Cahul","Chișinău","Soroca","Tiraspol","Ungheni"],
  Ireland: ["Bray","Cork","Drogheda","Dublin","Dundalk","Dún Laoghaire","Galway","Kilkenny","Limerick","Tralee","Waterford"],
  Iceland: ["Akureyri","Hafnarfjörður","Kopavogur","Reykjavik","Reykjanesbær"],
  Luxembourg: ["Differdange","Dudelange","Esch-sur-Alzette","Luxembourg City","Petange"],
  Malta: ["Birkirkara","Mosta","Msida","Qormi","Sliema","St. Julian's","Valletta"],
  Cyprus: ["Famagusta","Kyrenia","Larnaca","Limassol","Nicosia","Paphos"],
  // Middle East & Central Asia
  Turkey: ["Adana","Ankara","Antalya","Balıkesir","Bursa","Denizli","Diyarbakır","Erzurum","Eskişehir","Gaziantep","Istanbul","Izmir","Kayseri","Kocaeli","Konya","Malatya","Manisa","Mersin","Samsun","Trabzon","Urfa","Van"],
  "United Arab Emirates": ["Abu Dhabi","Ajman","Al Ain","Dubai","Fujairah","Ras Al Khaimah","Sharjah","Umm Al Quwain"],
  "Saudi Arabia": ["Abha","Buraidah","Dammam","Hail","Jeddah","Jizan","Jubail","Khobar","Mecca","Medina","Najran","Riyadh","Tabuk","Taif","Yanbu"],
  Israel: ["Ashdod","Bat Yam","Beer Sheva","Bnei Brak","Eilat","Haifa","Herzliya","Holon","Jerusalem","Nazareth","Netanya","Petah Tikva","Ramat Gan","Rehovot","Rishon LeZion","Tel Aviv"],
  Jordan: ["Al-Karak","Amman","Aqaba","Irbid","Madaba","Mafraq","Russeifa","Zarqa"],
  Lebanon: ["Baalbek","Beirut","Jounieh","Nabatieh","Sidon","Tripoli","Tyre","Zahle"],
  Syria: ["Aleppo","Damascus","Deir ez-Zor","Hama","Homs","Idlib","Latakia","Raqqa","Tartus"],
  Iraq: ["Baghdad","Basra","Erbil","Fallujah","Karbala","Kirkuk","Mosul","Najaf","Ramadi","Sulaymaniyah"],
  Kuwait: ["Ahmadi","Fahaheel","Farwaniya","Hawalli","Jahra","Kuwait City","Salmiya"],
  Bahrain: ["Hamad Town","Isa Town","Manama","Muharraq","Riffa","Sitra"],
  Qatar: ["Al Khor","Al Rayyan","Al Wakrah","Doha","Lusail","Umm Salal"],
  Oman: ["Buraimi","Ibri","Muscat","Nizwa","Rustaq","Salalah","Sohar","Sur"],
  Yemen: ["Aden","Dhamar","Hodeidah","Ibb","Mukalla","Sanaa","Taiz"],
  Palestine: ["Bethlehem","Gaza","Hebron","Jenin","Jericho","Nablus","Ramallah","Tulkarm"],
  Afghanistan: ["Ghazni","Herat","Jalalabad","Kabul","Kandahar","Kunduz","Mazar-i-Sharif"],
  Pakistan: ["Bahawalpur","Faisalabad","Gujranwala","Hyderabad","Islamabad","Karachi","Lahore","Multan","Peshawar","Quetta","Rawalpindi","Sargodha","Sialkot","Sukkur"],
  Kazakhstan: ["Almaty","Aktobe","Atyrau","Karaganda","Nur-Sultan","Pavlodar","Semey","Shymkent","Taraz","Ust-Kamenogorsk"],
  Uzbekistan: ["Andijan","Bukhara","Fergana","Kokand","Namangan","Nukus","Qarshi","Samarkand","Tashkent"],
  Turkmenistan: ["Ashgabat","Daşoguz","Mary","Türkmenabat","Turkmenbashi"],
  Tajikistan: ["Dushanbe","Khujand","Konibodom","Kulob","Qurghonteppa"],
  Kyrgyzstan: ["Bishkek","Jalal-Abad","Karakol","Osh","Tokmok"],
  Georgia: ["Batumi","Gori","Kutaisi","Poti","Rustavi","Tbilisi","Zugdidi"],
  Armenia: ["Abovyan","Gyumri","Hrazdan","Vagharshapat","Vanadzor","Yerevan"],
  Azerbaijan: ["Baku","Ganja","Lankaran","Mingachevir","Nakhchivan","Shaki","Sumqayit"],
  // North America
  "United States": ["Akron","Albuquerque","Anaheim","Anchorage","Arlington","Atlanta","Aurora","Austin","Bakersfield","Baltimore","Baton Rouge","Birmingham","Boise","Boston","Buffalo","Chandler","Charlotte","Chicago","Chula Vista","Cincinnati","Colorado Springs","Columbus","Corpus Christi","Dallas","Denver","Des Moines","Detroit","Durham","El Paso","Fontana","Fort Collins","Fort Lauderdale","Fort Worth","Fremont","Fresno","Garland","Gilbert","Glendale","Grand Rapids","Greensboro","Henderson","Hermosa Beach","Hialeah","Houston","Huntington Beach","Indianapolis","Irvine","Irving","Jacksonville","Jersey City","Kansas City","Knoxville","Laredo","Las Vegas","Lincoln","Little Rock","Long Beach","Los Angeles","Louisville","Lubbock","Madison","Memphis","Mesa","Miami","Minneapolis","Milwaukee","Modesto","Nashville","New Orleans","New York City","Newark","Norfolk","Oklahoma City","Omaha","Orlando","Pasadena","Philadelphia","Phoenix","Pittsburgh","Plano","Portland","Providence","Raleigh","Reno","Riverside","Rochester","Sacramento","San Antonio","San Bernardino","San Diego","San Francisco","San Jose","Santa Ana","Scottsdale","Seattle","Skokie","Spokane","St. Paul","St. Petersburg","Tacoma","Tallahassee","Tampa","Tucson","Tulsa","Virginia Beach","Washington DC","Wichita","Winston-Salem","Worcester","Yonkers"],
  Canada: ["Abbotsford","Barrie","Brampton","Burnaby","Calgary","Coquitlam","Edmonton","Gatineau","Guelph","Halifax","Hamilton","Kelowna","Kingston","Kitchener","Laval","London","Longueuil","Markham","Mississauga","Moncton","Montreal","Oakville","Ottawa","Quebec City","Regina","Saskatoon","Sherbrooke","St. John's","Sudbury","Surrey","Thunder Bay","Toronto","Trois-Rivières","Vancouver","Victoria","Windsor","Winnipeg"],
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

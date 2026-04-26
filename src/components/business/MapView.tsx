"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Business, CATEGORIES } from "@/types";

const CANTON_COORDS: Record<string, [number, number]> = {
  Zurich: [47.3769, 8.5417],
  Geneva: [46.2044, 6.1432],
  Basel: [47.5596, 7.5886],
  "Basel-Stadt": [47.5596, 7.5886],
  "Basel-Landschaft": [47.4800, 7.7300],
  Bern: [46.9481, 7.4474],
  Lausanne: [46.5197, 6.6323],
  Vaud: [46.5700, 6.5200],
  Lucerne: [47.0502, 8.3093],
  Winterthur: [47.5, 8.7241],
  "St. Gallen": [47.4245, 9.3767],
  Lugano: [46.0037, 8.9511],
  Ticino: [46.3300, 8.8000],
  Aargau: [47.3900, 8.0500],
  Solothurn: [47.2088, 7.5323],
  Schaffhausen: [47.6960, 8.6340],
  Thurgau: [47.5500, 9.1000],
  Graubünden: [46.6570, 9.5780],
  Valais: [46.2333, 7.3667],
  Fribourg: [46.8065, 7.1620],
  Neuchâtel: [47.0000, 6.9333],
  Jura: [47.3500, 7.1500],
  Zug: [47.1667, 8.5167],
  Schwyz: [47.0207, 8.6530],
  Glarus: [47.0407, 9.0676],
  Uri: [46.7957, 8.6310],
  Nidwalden: [46.9270, 8.3850],
  Obwalden: [46.8780, 8.2520],
  Appenzell: [47.3326, 9.4100],
  "Appenzell Ausserrhoden": [47.3700, 9.3000],
  "Appenzell Innerrhoden": [47.3156, 9.4157],
  Biel: [47.1368, 7.2467],
  // Germany
  Berlin: [52.5200, 13.4050],
  Hamburg: [53.5753, 10.0153],
  Bavaria: [48.7904, 11.4979],
  Hesse: [50.6521, 9.1624],
  "North Rhine-Westphalia": [51.4332, 7.6616],
  "Baden-Württemberg": [48.6616, 9.3501],
  Brandenburg: [52.4125, 12.5316],
  Bremen: [53.0793, 8.8017],
  "Lower Saxony": [52.6367, 9.8451],
  "Mecklenburg-Vorpommern": [53.6127, 12.4296],
  "Rhineland-Palatinate": [50.1183, 7.3080],
  Saarland: [49.3964, 6.9987],
  Saxony: [51.1045, 13.2017],
  "Saxony-Anhalt": [51.9503, 11.6924],
  "Schleswig-Holstein": [54.2194, 9.6961],
  Thuringia: [50.9272, 11.5863],
  // France
  "Île-de-France": [48.8499, 2.6370],
  "Auvergne-Rhône-Alpes": [45.4473, 4.3859],
  "Provence-Alpes-Côte d'Azur": [43.9352, 6.0679],
  "Nouvelle-Aquitaine": [45.7597, 0.3468],
  Occitanie: [43.8927, 3.2828],
  "Hauts-de-France": [50.4801, 2.7932],
  "Grand Est": [48.6991, 6.1858],
  Normandie: [49.1829, 0.3707],
  Bretagne: [48.2020, -2.9326],
  "Pays de la Loire": [47.7632, -0.3299],
  "Centre-Val de Loire": [47.7516, 1.6751],
  "Bourgogne-Franche-Comté": [47.2805, 4.9994],
  Corse: [42.0396, 9.0129],
  // Austria
  Vienna: [48.2082, 16.3738],
  "Lower Austria": [48.1074, 15.8066],
  "Upper Austria": [48.0257, 13.9726],
  Styria: [47.3593, 14.4702],
  Tyrol: [47.2537, 11.6014],
  Salzburg: [47.5162, 13.0638],
  Carinthia: [46.7440, 13.9130],
  Vorarlberg: [47.2497, 9.9797],
  Burgenland: [47.5316, 16.5347],
  // United Kingdom
  England: [52.3555, -1.1743],
  Scotland: [56.4907, -4.2026],
  Wales: [52.1307, -3.7837],
  "Northern Ireland": [54.7877, -6.4923],
  London: [51.5074, -0.1278],
  "South East": [51.2787, -0.6040],
  "South West": [50.8167, -3.5322],
  "East of England": [52.2405, 0.5034],
  "West Midlands": [52.4862, -1.8904],
  "East Midlands": [52.8358, -1.3368],
  Yorkshire: [53.9590, -1.0815],
  "North West": [53.5809, -2.4332],
  "North East": [54.9783, -1.6178],
  // Netherlands
  Drenthe: [52.9476, 6.6231],
  Flevoland: [52.5279, 5.5953],
  Friesland: [53.1642, 5.7817],
  Gelderland: [52.0457, 5.8718],
  Groningen: [53.2194, 6.5665],
  Limburg: [51.2093, 5.9699],
  "North Brabant": [51.5719, 5.0913],
  "North Holland": [52.5200, 4.7883],
  Overijssel: [52.4387, 6.5017],
  "South Holland": [52.0116, 4.3571],
  Utrecht: [52.0907, 5.1214],
  Zeeland: [51.4940, 3.8497],
  // Sweden
  Stockholm: [59.3293, 18.0686],
  "Västra Götaland": [58.0028, 13.1358],
  Skåne: [55.9903, 13.5958],
  Östergötland: [58.4108, 15.6214],
  Uppsala: [59.8586, 17.6389],
  Dalarna: [61.0910, 14.6669],
  Halland: [56.9059, 12.7340],
  Örebro: [59.2741, 15.2066],
  Västmanland: [59.6099, 16.5448],
  Jönköping: [57.7826, 14.1618],
  // Belgium
  Brussels: [50.8503, 4.3517],
  Flanders: [51.0501, 3.7174],
  Wallonia: [50.4176, 4.4559],
  // Italy
  Lombardy: [45.4654, 9.1859],
  Lazio: [41.8947, 12.4823],
  Campania: [40.8518, 14.2681],
  Sicily: [37.5999, 14.0154],
  Veneto: [45.4340, 12.3388],
  Piedmont: [45.0703, 7.6869],
  "Emilia-Romagna": [44.4949, 11.3426],
  Tuscany: [43.7711, 11.2486],
  Puglia: [41.1253, 16.8620],
  Calabria: [38.9098, 16.5872],
  // Spain
  Madrid: [40.4168, -3.7038],
  Catalonia: [41.5912, 1.5209],
  Andalusia: [37.3891, -5.9845],
  Valencia: [39.4699, -0.3763],
  Galicia: [42.5751, -8.1339],
  "Castile and León": [41.6523, -4.7245],
  "Basque Country": [43.0097, -2.6189],
  "Canary Islands": [28.2916, -16.6291],
  Murcia: [37.9922, -1.1307],
  Aragon: [41.5976, -0.9057],
  // Norway
  Oslo: [59.9139, 10.7522],
  "Viken": [59.7440, 10.2057],
  Innlandet: [61.1927, 10.5736],
  Vestfold: [59.2181, 10.3671],
  Agder: [58.4636, 7.7232],
  Rogaland: [58.9700, 5.7331],
  Vestland: [60.3913, 5.3221],
  Møre: [62.6372, 7.3788],
  Trøndelag: [63.4305, 10.3951],
  Nordland: [67.2804, 14.4049],
  Troms: [69.6489, 18.9551],
  Finnmark: [70.0725, 25.0151],
  // Denmark
  Copenhagen: [55.6761, 12.5683],
  Jutland: [56.2639, 9.5018],
  Funen: [55.3639, 10.3864],
  "Zealand": [55.4596, 11.7873],
  Bornholm: [55.1001, 14.9002],
  // United States
  California: [36.7783, -119.4179],
  Texas: [31.9686, -99.9018],
  "New York": [42.1657, -74.9481],
  Florida: [27.6648, -81.5158],
  Illinois: [40.3495, -88.9861],
  Pennsylvania: [41.2033, -77.1945],
  Ohio: [40.4173, -82.9071],
  Georgia: [32.1656, -82.9001],
  "North Carolina": [35.7596, -79.0193],
  Michigan: [44.3148, -85.6024],
  "New Jersey": [40.0583, -74.4057],
  "Virginia": [37.4316, -78.6569],
  Washington: [47.7511, -120.7401],
  Arizona: [34.0489, -111.0937],
  Massachusetts: [42.4072, -71.3824],
  Tennessee: [35.5175, -86.5804],
  Indiana: [40.2672, -86.1349],
  Missouri: [37.9643, -91.8318],
  Maryland: [39.0458, -76.6413],
  Wisconsin: [43.7844, -88.7879],
  Colorado: [39.5501, -105.7821],
  Minnesota: [46.7296, -94.6859],
  "South Carolina": [33.8361, -81.1637],
  Alabama: [32.3182, -86.9023],
  Louisiana: [31.1695, -91.8678],
  Kentucky: [37.6681, -84.6701],
  Oregon: [44.5720, -122.0709],
  Oklahoma: [35.4676, -97.5164],
  Connecticut: [41.6032, -73.0877],
  Utah: [39.3210, -111.0937],
  Nevada: [38.8026, -116.4194],
  Iowa: [42.0115, -93.2105],
  Arkansas: [34.9697, -92.3731],
  Mississippi: [32.7364, -89.6678],
  Kansas: [38.5266, -96.7265],
  "New Mexico": [34.5199, -105.8701],
  Nebraska: [41.4925, -99.9018],
  Idaho: [44.0682, -114.7420],
  Hawaii: [19.8968, -155.5828],
  "New Hampshire": [43.1939, -71.5724],
  Maine: [45.2538, -69.4455],
  Montana: [46.8797, -110.3626],
  "Rhode Island": [41.6809, -71.5118],
  Delaware: [38.9108, -75.5277],
  "South Dakota": [44.2998, -99.4388],
  "North Dakota": [47.5515, -101.0020],
  Alaska: [64.2008, -153.4937],
  Vermont: [44.5588, -72.5778],
  Wyoming: [43.0760, -107.2903],
  // Canada
  Ontario: [51.2538, -85.3232],
  Quebec: [53.9333, -73.5491],
  "British Columbia": [53.7267, -127.6476],
  Alberta: [53.9333, -116.5765],
  Manitoba: [56.4150, -98.7390],
  Saskatchewan: [52.9399, -106.4509],
  "Nova Scotia": [44.6820, -63.7443],
  "New Brunswick": [46.5653, -66.4619],
  "Newfoundland and Labrador": [53.1355, -57.6604],
  "Prince Edward Island": [46.5107, -63.4168],
  "Northwest Territories": [64.8255, -124.8457],
  Yukon: [64.2823, -135.0000],
  Nunavut: [70.2998, -83.1076],
  // Australia
  "New South Wales": [-33.8688, 151.2093],
  Victoria: [-37.4713, 144.7852],
  Queensland: [-22.5752, 144.0850],
  "Western Australia": [-27.6728, 121.6283],
  "South Australia": [-30.0002, 136.2092],
  Tasmania: [-41.4545, 145.9707],
  "Australian Capital Territory": [-35.4735, 149.0124],
  "Northern Territory": [-19.4914, 132.5510],
  // United Arab Emirates
  "Abu Dhabi": [24.4539, 54.3773],
  Dubai: [25.2048, 55.2708],
  Sharjah: [25.3463, 55.4209],
  Ajman: [25.4052, 55.5136],
  "Umm Al Quwain": [25.5647, 55.5533],
  "Ras Al Khaimah": [25.7895, 55.9432],
  Fujairah: [25.1288, 56.3265],
  // Turkey
  Istanbul: [41.0082, 28.9784],
  Ankara: [39.9334, 32.8597],
  Izmir: [38.4192, 27.1287],
  Antalya: [36.8969, 30.7133],
  Bursa: [40.1826, 29.0665],
  Adana: [37.0000, 35.3213],
  Gaziantep: [37.0662, 37.3833],
  Konya: [37.8715, 32.4846],
  Mersin: [36.8121, 34.6415],
  Kayseri: [38.7312, 35.4787],
};

const COUNTRY_COORDS: Record<string, { center: [number, number]; zoom: number }> = {
  // Europe
  Switzerland:            { center: [46.8182, 8.2275],   zoom: 8 },
  Germany:                { center: [51.1657, 10.4515],  zoom: 6 },
  Austria:                { center: [47.5162, 14.5501],  zoom: 7 },
  France:                 { center: [46.2276, 2.2137],   zoom: 6 },
  "United Kingdom":       { center: [55.3781, -3.4360],  zoom: 5 },
  Netherlands:            { center: [52.1326, 5.2913],   zoom: 7 },
  Sweden:                 { center: [60.1282, 18.6435],  zoom: 5 },
  Norway:                 { center: [60.4720, 8.4689],   zoom: 5 },
  Denmark:                { center: [56.2639, 9.5018],   zoom: 6 },
  Belgium:                { center: [50.5039, 4.4699],   zoom: 7 },
  Italy:                  { center: [41.8719, 12.5674],  zoom: 6 },
  Spain:                  { center: [40.4637, -3.7492],  zoom: 6 },
  Portugal:               { center: [39.3999, -8.2245],  zoom: 7 },
  Poland:                 { center: [51.9194, 19.1451],  zoom: 6 },
  "Czech Republic":       { center: [49.8175, 15.4730],  zoom: 7 },
  Slovakia:               { center: [48.6690, 19.6990],  zoom: 7 },
  Hungary:                { center: [47.1625, 19.5033],  zoom: 7 },
  Romania:                { center: [45.9432, 24.9668],  zoom: 7 },
  Bulgaria:               { center: [42.7339, 25.4858],  zoom: 7 },
  Greece:                 { center: [39.0742, 21.8243],  zoom: 7 },
  Croatia:                { center: [45.1000, 15.2000],  zoom: 7 },
  Slovenia:               { center: [46.1512, 14.9955],  zoom: 8 },
  Serbia:                 { center: [44.0165, 21.0059],  zoom: 7 },
  "Bosnia and Herzegovina":{ center: [43.9159, 17.6791], zoom: 7 },
  Montenegro:             { center: [42.7087, 19.3744],  zoom: 8 },
  "North Macedonia":      { center: [41.6086, 21.7453],  zoom: 8 },
  Albania:                { center: [41.1533, 20.1683],  zoom: 8 },
  Kosovo:                 { center: [42.6026, 20.9030],  zoom: 8 },
  Finland:                { center: [61.9241, 25.7482],  zoom: 5 },
  Estonia:                { center: [58.5953, 25.0136],  zoom: 7 },
  Latvia:                 { center: [56.8796, 24.6032],  zoom: 7 },
  Lithuania:              { center: [55.1694, 23.8813],  zoom: 7 },
  Belarus:                { center: [53.7098, 27.9534],  zoom: 7 },
  Ukraine:                { center: [48.3794, 31.1656],  zoom: 6 },
  Moldova:                { center: [47.4116, 28.3699],  zoom: 8 },
  Iceland:                { center: [64.9631, -19.0208], zoom: 6 },
  Ireland:                { center: [53.4129, -8.2439],  zoom: 7 },
  Luxembourg:             { center: [49.8153, 6.1296],   zoom: 9 },
  Malta:                  { center: [35.9375, 14.3754],  zoom: 11 },
  Cyprus:                 { center: [35.1264, 33.4299],  zoom: 9 },
  Andorra:                { center: [42.5063, 1.5218],   zoom: 11 },
  Liechtenstein:          { center: [47.1660, 9.5554],   zoom: 11 },
  Monaco:                 { center: [43.7384, 7.4246],   zoom: 13 },
  "San Marino":           { center: [43.9424, 12.4578],  zoom: 12 },
  "Vatican City":         { center: [41.9029, 12.4534],  zoom: 14 },
  // Middle East & Central Asia
  Turkey:                 { center: [38.9637, 35.2433],  zoom: 6 },
  "United Arab Emirates": { center: [23.4241, 53.8478],  zoom: 7 },
  "Saudi Arabia":         { center: [23.8859, 45.0792],  zoom: 5 },
  Israel:                 { center: [31.0461, 34.8516],  zoom: 8 },
  Jordan:                 { center: [30.5852, 36.2384],  zoom: 7 },
  Lebanon:                { center: [33.8547, 35.8623],  zoom: 8 },
  Syria:                  { center: [34.8021, 38.9968],  zoom: 7 },
  Iraq:                   { center: [33.2232, 43.6793],  zoom: 6 },
  Kuwait:                 { center: [29.3117, 47.4818],  zoom: 9 },
  Bahrain:                { center: [26.0275, 50.5500],  zoom: 10 },
  Qatar:                  { center: [25.3548, 51.1839],  zoom: 9 },
  Oman:                   { center: [21.4735, 55.9754],  zoom: 7 },
  Yemen:                  { center: [15.5527, 48.5164],  zoom: 6 },
  Palestine:              { center: [31.9522, 35.2332],  zoom: 9 },
  Afghanistan:            { center: [33.9391, 67.7100],  zoom: 6 },
  Pakistan:               { center: [30.3753, 69.3451],  zoom: 5 },
  Kazakhstan:             { center: [48.0196, 66.9237],  zoom: 5 },
  Uzbekistan:             { center: [41.3775, 64.5853],  zoom: 6 },
  Turkmenistan:           { center: [38.9697, 59.5563],  zoom: 6 },
  Tajikistan:             { center: [38.8610, 71.2761],  zoom: 7 },
  Kyrgyzstan:             { center: [41.2044, 74.7661],  zoom: 7 },
  Georgia:                { center: [42.3154, 43.3569],  zoom: 7 },
  Armenia:                { center: [40.0691, 45.0382],  zoom: 8 },
  Azerbaijan:             { center: [40.1431, 47.5769],  zoom: 7 },
  // North America
  "United States":        { center: [37.0902, -95.7129], zoom: 4 },
  Canada:                 { center: [56.1304, -106.3468],zoom: 4 },
  Mexico:                 { center: [23.6345, -102.5528],zoom: 5 },
  // Central America & Caribbean
  Guatemala:              { center: [15.7835, -90.2308], zoom: 7 },
  Belize:                 { center: [17.1899, -88.4976], zoom: 8 },
  Honduras:               { center: [15.1995, -86.2419], zoom: 7 },
  "El Salvador":          { center: [13.7942, -88.8965], zoom: 8 },
  Nicaragua:              { center: [12.8654, -85.2072], zoom: 7 },
  "Costa Rica":           { center: [9.7489, -83.7534],  zoom: 8 },
  Panama:                 { center: [8.5380, -80.7821],  zoom: 7 },
  Cuba:                   { center: [21.5218, -77.7812], zoom: 7 },
  "Dominican Republic":   { center: [18.7357, -70.1627], zoom: 8 },
  Haiti:                  { center: [18.9712, -72.2852], zoom: 8 },
  Jamaica:                { center: [18.1096, -77.2975], zoom: 9 },
  "Puerto Rico":          { center: [18.2208, -66.5901], zoom: 9 },
  "Trinidad and Tobago":  { center: [10.6918, -61.2225], zoom: 10 },
  // South America
  Brazil:                 { center: [-14.2350, -51.9253],zoom: 4 },
  Argentina:              { center: [-38.4161, -63.6167],zoom: 4 },
  Colombia:               { center: [4.5709, -74.2973],  zoom: 6 },
  Venezuela:              { center: [6.4238, -66.5897],  zoom: 6 },
  Peru:                   { center: [-9.1900, -75.0152], zoom: 5 },
  Chile:                  { center: [-35.6751, -71.5430],zoom: 4 },
  Ecuador:                { center: [-1.8312, -78.1834], zoom: 7 },
  Bolivia:                { center: [-16.2902, -63.5887],zoom: 6 },
  Paraguay:               { center: [-23.4425, -58.4438],zoom: 7 },
  Uruguay:                { center: [-32.5228, -55.7658],zoom: 7 },
  Guyana:                 { center: [4.8604, -58.9302],  zoom: 7 },
  Suriname:               { center: [3.9193, -56.0278],  zoom: 7 },
  // Africa
  Egypt:                  { center: [26.8206, 30.8025],  zoom: 6 },
  Morocco:                { center: [31.7917, -7.0926],  zoom: 6 },
  Algeria:                { center: [28.0339, 1.6596],   zoom: 5 },
  Tunisia:                { center: [33.8869, 9.5375],   zoom: 7 },
  Libya:                  { center: [26.3351, 17.2283],  zoom: 5 },
  "South Africa":         { center: [-30.5595, 22.9375], zoom: 5 },
  Nigeria:                { center: [9.0820, 8.6753],    zoom: 6 },
  Kenya:                  { center: [-0.0236, 37.9062],  zoom: 6 },
  Ethiopia:               { center: [9.1450, 40.4897],   zoom: 6 },
  Ghana:                  { center: [7.9465, -1.0232],   zoom: 7 },
  Tanzania:               { center: [-6.3690, 34.8888],  zoom: 6 },
  Angola:                 { center: [-11.2027, 17.8739], zoom: 6 },
  Mozambique:             { center: [-18.6657, 35.5296], zoom: 6 },
  Madagascar:             { center: [-18.7669, 46.8691], zoom: 6 },
  Cameroon:               { center: [3.8480, 11.5021],   zoom: 6 },
  "Ivory Coast":          { center: [7.5400, -5.5471],   zoom: 7 },
  Niger:                  { center: [17.6078, 8.0817],   zoom: 6 },
  Mali:                   { center: [17.5707, -3.9962],  zoom: 6 },
  Senegal:                { center: [14.4974, -14.4524], zoom: 7 },
  Sudan:                  { center: [12.8628, 30.2176],  zoom: 6 },
  "South Sudan":          { center: [6.8770, 31.3070],   zoom: 6 },
  Uganda:                 { center: [1.3733, 32.2903],   zoom: 7 },
  Rwanda:                 { center: [-1.9403, 29.8739],  zoom: 8 },
  Zambia:                 { center: [-13.1339, 27.8493], zoom: 6 },
  Zimbabwe:               { center: [-19.0154, 29.1549], zoom: 7 },
  Botswana:               { center: [-22.3285, 24.6849], zoom: 6 },
  Namibia:                { center: [-22.9576, 18.4904], zoom: 6 },
  Somalia:                { center: [5.1521, 46.1996],   zoom: 6 },
  Djibouti:               { center: [11.8251, 42.5903],  zoom: 8 },
  Eritrea:                { center: [15.1794, 39.7823],  zoom: 7 },
  Gabon:                  { center: [-0.8037, 11.6094],  zoom: 7 },
  Congo:                  { center: [-0.2280, 15.8277],  zoom: 7 },
  "Democratic Republic of Congo": { center: [-4.0383, 21.7587], zoom: 5 },
  "Burkina Faso":         { center: [12.3641, -1.5317],  zoom: 7 },
  Guinea:                 { center: [9.9456, -11.3247],  zoom: 7 },
  "Guinea-Bissau":        { center: [11.8037, -15.1804], zoom: 8 },
  "Equatorial Guinea":    { center: [1.6508, 10.2679],   zoom: 8 },
  "Central African Republic": { center: [6.6111, 20.9394], zoom: 6 },
  Chad:                   { center: [15.4542, 18.7322],  zoom: 6 },
  Benin:                  { center: [9.3077, 2.3158],    zoom: 7 },
  Togo:                   { center: [8.6195, 0.8248],    zoom: 8 },
  Liberia:                { center: [6.4281, -9.4295],   zoom: 8 },
  "Sierra Leone":         { center: [8.4606, -11.7799],  zoom: 8 },
  Gambia:                 { center: [13.4432, -15.3101], zoom: 9 },
  Mauritania:             { center: [21.0079, -10.9408], zoom: 6 },
  "Cape Verde":           { center: [16.5388, -23.0418], zoom: 9 },
  Comoros:                { center: [-11.6455, 43.3333], zoom: 10 },
  Mauritius:              { center: [-20.3484, 57.5522], zoom: 10 },
  Eswatini:               { center: [-26.5225, 31.4659], zoom: 9 },
  Lesotho:                { center: [-29.6100, 28.2336], zoom: 9 },
  Malawi:                 { center: [-13.2543, 34.3015], zoom: 7 },
  Burundi:                { center: [-3.3731, 29.9189],  zoom: 8 },
  // Asia & Pacific
  India:                  { center: [20.5937, 78.9629],  zoom: 5 },
  China:                  { center: [35.8617, 104.1954], zoom: 4 },
  Japan:                  { center: [36.2048, 138.2529], zoom: 5 },
  "South Korea":          { center: [35.9078, 127.7669], zoom: 7 },
  Indonesia:              { center: [-0.7893, 113.9213], zoom: 5 },
  Bangladesh:             { center: [23.6850, 90.3563],  zoom: 7 },
  Vietnam:                { center: [14.0583, 108.2772], zoom: 5 },
  Philippines:            { center: [12.8797, 121.7740], zoom: 6 },
  Thailand:               { center: [15.8700, 100.9925], zoom: 6 },
  Malaysia:               { center: [4.2105, 101.9758],  zoom: 6 },
  Myanmar:                { center: [21.9162, 95.9560],  zoom: 6 },
  "Sri Lanka":            { center: [7.8731, 80.7718],   zoom: 8 },
  Nepal:                  { center: [28.3949, 84.1240],  zoom: 7 },
  Cambodia:               { center: [12.5657, 104.9910], zoom: 7 },
  Laos:                   { center: [19.8563, 102.4955], zoom: 6 },
  Mongolia:               { center: [46.8625, 103.8467], zoom: 5 },
  Taiwan:                 { center: [23.6978, 120.9605], zoom: 8 },
  Singapore:              { center: [1.3521, 103.8198],  zoom: 11 },
  Brunei:                 { center: [4.5353, 114.7277],  zoom: 9 },
  Bhutan:                 { center: [27.5142, 90.4336],  zoom: 8 },
  Maldives:               { center: [3.2028, 73.2207],   zoom: 8 },
  "East Timor":           { center: [-8.8742, 125.7275], zoom: 9 },
  Fiji:                   { center: [-17.7134, 178.0650],zoom: 9 },
  "Papua New Guinea":     { center: [-6.3150, 143.9555], zoom: 6 },
  "New Zealand":          { center: [-40.9006, 174.8860],zoom: 5 },
  Australia:              { center: [-25.2744, 133.7751],zoom: 4 },
  "North Korea":          { center: [40.3399, 127.5101], zoom: 7 },
};

const DEFAULT_CENTER: [number, number] = [46.8182, 8.2275];

interface Props {
  businesses: Business[];
  onSelect: (business: Business) => void;
  selected: Business | null;
  focusCountry?: string;
  focusCanton?: string;
}

export default function MapView({ businesses, onSelect, selected, focusCountry, focusCanton }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 8,
        minZoom: 4,
        maxZoom: 19,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Beating heart on Iran — inject keyframes globally then add marker
      if (!document.getElementById("heartbeat-style")) {
        const s = document.createElement("style");
        s.id = "heartbeat-style";
        s.textContent = `@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}}`;
        document.head.appendChild(s);
      }
      const heartIcon = L.divIcon({
        html: `<div style="font-size:96px;line-height:1;animation:heartbeat 1s ease-in-out infinite;transform-origin:center;filter:drop-shadow(0 0 10px rgba(80,0,0,0.6)) sepia(0.4) saturate(0.6) brightness(0.55);">❤️</div>`,
        className: "",
        iconSize: [120, 120],
        iconAnchor: [60, 60],
      });
      L.marker([32.4279, 53.6880], { icon: heartIcon, interactive: false, zIndexOffset: -1000 }).addTo(map);

      // Detect user location via IP (same as HomeMap)
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((data) => {
          if (data.latitude && data.longitude) {
            map.flyTo([data.latitude, data.longitude], 10, { duration: 1.5 });
          }
        })
        .catch(() => {});

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => map.invalidateSize(), 150);
      };
      window.addEventListener("resize", onResize);
      (map as any)._onResize = onResize;
    });

    return () => {
      if (mapInstanceRef.current) {
        window.removeEventListener("resize", (mapInstanceRef.current as any)._onResize);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      businesses.forEach((business) => {
        const category = CATEGORIES.find((c) => c.slug === business.category);
        const icon = category?.icon ?? "🏪";
        const cityKey = business.canton ?? "";
        const lat = business.lat ?? CANTON_COORDS[cityKey]?.[0];
        const lng = business.lng ?? CANTON_COORDS[cityKey]?.[1];
        if (!lat || !lng) return;

        const approved = business.is_approved !== false;
        const divIcon = L.divIcon({
          html: `<div style="
            font-size: 20px;
            background: ${approved ? "white" : "#fefce8"};
            border: 2.5px solid ${approved ? "#8B1A1A" : "#eab308"};
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            cursor: pointer;
            position: relative;
            transition: transform 0.15s, box-shadow 0.15s;
          " onmouseover="this.style.transform='scale(1.25)';this.style.boxShadow='0 6px 16px rgba(139,26,26,0.4)'"
             onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 3px 8px rgba(0,0,0,0.25)'"
          >${icon}${!approved ? '<span style="position:absolute;top:-4px;right:-4px;font-size:10px;line-height:1;">⚠️</span>' : ''}</div>`,
          className: "",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        // Tooltip: shows on hover
        const tooltipHtml = `
          <div style="font-family:Arial,sans-serif;min-width:140px;max-width:200px;">
            <div style="font-weight:700;font-size:13px;color:#1a0a0a;margin-bottom:2px;">${business.name}</div>
            <div style="font-size:11px;color:#8B1A1A;font-weight:600;">${icon} ${category?.label_en ?? ""}</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">📍 ${business.canton ?? ""}</div>
            <div style="font-size:11px;color:#C9A84C;margin-top:4px;font-weight:600;">Click to view →</div>
          </div>`;

        const marker = L.marker([lat, lng], { icon: divIcon })
          .addTo(mapInstanceRef.current!)
          .bindTooltip(tooltipHtml, {
            direction: "top",
            offset: [0, -20],
            opacity: 1,
            className: "persian-hub-tooltip",
          })
          .on("click", () => {
            onSelect(business);
            router.push(`/businesses/detail?id=${business.id}`);
          });

        markersRef.current.push(marker);
      });
    });
  }, [businesses, onSelect, router]);

  // Fly to selected business
  useEffect(() => {
    if (!mapInstanceRef.current || !selected) return;
    const cityKey = selected.canton ?? "";
    const lat = selected.lat ?? CANTON_COORDS[cityKey]?.[0];
    const lng = selected.lng ?? CANTON_COORDS[cityKey]?.[1];
    if (lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [selected]);

  // Fly to country when country filter changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (focusCanton && CANTON_COORDS[focusCanton]) {
      const [lat, lng] = CANTON_COORDS[focusCanton];
      mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1 });
    } else if (focusCountry && COUNTRY_COORDS[focusCountry]) {
      const { center, zoom } = COUNTRY_COORDS[focusCountry];
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [focusCountry, focusCanton]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>{`
        .persian-hub-tooltip {
          background: white !important;
          border: 1.5px solid #e8d5b0 !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
          font-size: 13px;
        }
        .persian-hub-tooltip::before {
          border-top-color: #e8d5b0 !important;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          70% { transform: scale(1); }
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </>
  );
}

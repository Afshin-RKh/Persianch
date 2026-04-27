"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Business, CATEGORIES, CitySquare, SQUARE_LINK_CATEGORIES } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

// Persian 8-pointed star (Khatam) SVG path — centered at 12,12 outer r=9.5 inner r=4
const PERSIAN_STAR_PATH = "M12,2.5 L13.82,7.73 L19.28,5.65 L17.2,11.11 L22.43,12.93 L17.2,14.75 L19.28,20.21 L13.82,18.13 L12,23.37 L10.18,18.13 L4.72,20.21 L6.8,14.75 L1.57,12.93 L6.8,11.11 L4.72,5.65 L10.18,7.73 Z";

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
  // Denmark cities
  Copenhagen: [55.6761, 12.5683],
  Aarhus: [56.1629, 10.2039],
  Odense: [55.3959, 10.3883],
  Aalborg: [57.0488, 9.9217],
  Esbjerg: [55.4761, 8.4597],
  Randers: [56.4607, 10.0361],
  Kolding: [55.4904, 9.4722],
  Horsens: [55.8607, 9.8498],
  Vejle: [55.7093, 9.5362],
  Roskilde: [55.6415, 12.0803],
  Herning: [56.1396, 8.9742],
  Silkeborg: [56.1497, 9.5461],
  Næstved: [55.2295, 11.7608],
  Viborg: [56.4531, 9.4028],
  // Germany cities
  Munich: [48.1351, 11.5820],
  Cologne: [50.9333, 6.9500],
  Frankfurt: [50.1109, 8.6821],
  Stuttgart: [48.7758, 9.1829],
  "Düsseldorf": [51.2217, 6.7762],
  Dortmund: [51.5138, 7.4653],
  Essen: [51.4556, 7.0116],
  Leipzig: [51.3397, 12.3731],
  Dresden: [51.0544, 13.7966],
  Hanover: [52.3759, 9.7320],
  Nuremberg: [49.4521, 11.0767],
  Duisburg: [51.4344, 6.7623],
  Bochum: [51.4818, 7.2162],
  Wuppertal: [51.2562, 7.1508],
  Bielefeld: [52.0302, 8.5325],
  Bonn: [50.7374, 7.0982],
  "Münster": [51.9607, 7.6261],
  Karlsruhe: [49.0069, 8.4037],
  Mannheim: [49.4875, 8.4660],
  Augsburg: [48.3705, 10.8978],
  Wiesbaden: [50.0782, 8.2398],
  Aachen: [50.7753, 6.0839],
  Braunschweig: [52.2689, 10.5268],
  Kiel: [54.3233, 10.1228],
  Freiburg: [47.9990, 7.8421],
  Erfurt: [50.9787, 11.0328],
  Mainz: [49.9929, 8.2473],
  Rostock: [54.0924, 12.0991],
  Kassel: [51.3127, 9.4797],
  Osnabrück: [52.2799, 8.0472],
  Heidelberg: [49.3988, 8.6724],
  Regensburg: [49.0134, 12.1016],
  "Würzburg": [49.7913, 9.9534],
  Ulm: [48.4011, 9.9876],
  Wolfsburg: [52.4227, 10.7865],
  "Göttingen": [51.5413, 9.9158],
  Chemnitz: [50.8278, 12.9214],
  Magdeburg: [52.1205, 11.6276],
  Halle: [51.4825, 11.9706],
  Ingolstadt: [48.7665, 11.4258],
  // France cities
  Paris: [48.8566, 2.3522],
  Marseille: [43.2965, 5.3698],
  Lyon: [45.7640, 4.8357],
  Toulouse: [43.6047, 1.4442],
  Nice: [43.7102, 7.2620],
  Nantes: [47.2184, -1.5536],
  Strasbourg: [48.5734, 7.7521],
  Montpellier: [43.6110, 3.8767],
  Bordeaux: [44.8378, -0.5792],
  Lille: [50.6292, 3.0573],
  Rennes: [48.1173, -1.6778],
  Reims: [49.2583, 4.0317],
  "Le Havre": [49.4938, 0.1077],
  "Saint-Étienne": [45.4397, 4.3872],
  Toulon: [43.1242, 5.9280],
  Grenoble: [45.1885, 5.7245],
  Dijon: [47.3220, 5.0415],
  Angers: [47.4784, -0.5632],
  "Nîmes": [43.8367, 4.3601],
  "Clermont-Ferrand": [45.7772, 3.0870],
  Brest: [48.3905, -4.4860],
  Tours: [47.3941, 0.6848],
  Amiens: [49.8941, 2.2958],
  Limoges: [45.8336, 1.2611],
  Metz: [49.1193, 6.1757],
  Perpignan: [42.6976, 2.8954],
  "Besançon": [47.2378, 6.0241],
  "Orléans": [47.9029, 1.9039],
  Mulhouse: [47.7508, 7.3359],
  Rouen: [49.4432, 1.0993],
  Caen: [49.1829, -0.3707],
  Nancy: [48.6921, 6.1844],
  Avignon: [43.9493, 4.8055],
  Poitiers: [46.5802, 0.3404],
  // UK cities
  Birmingham: [52.4862, -1.8904],
  Manchester: [53.4808, -2.2426],
  Glasgow: [55.8642, -4.2518],
  Liverpool: [53.4084, -2.9916],
  Bristol: [51.4545, -2.5879],
  Sheffield: [53.3811, -1.4701],
  Leeds: [53.8008, -1.5491],
  Edinburgh: [55.9533, -3.1883],
  Leicester: [52.6369, -1.1398],
  Coventry: [52.4081, -1.5106],
  Bradford: [53.7960, -1.7594],
  Nottingham: [52.9540, -1.1550],
  Newcastle: [54.9783, -1.6178],
  Southampton: [50.9097, -1.4044],
  Portsmouth: [50.8198, -1.0880],
  Cardiff: [51.4816, -3.1791],
  Aberdeen: [57.1497, -2.0943],
  Brighton: [50.8225, -0.1372],
  Derby: [52.9225, -1.4746],
  Plymouth: [50.3755, -4.1427],
  Wolverhampton: [52.5860, -2.1288],
  Belfast: [54.5973, -5.9301],
  Cambridge: [52.2053, 0.1218],
  Oxford: [51.7520, -1.2577],
  Reading: [51.4543, -0.9781],
  Sunderland: [54.9049, -1.3830],
  Swansea: [51.6214, -3.9436],
  Bournemouth: [50.7192, -1.8808],
  Peterborough: [52.5695, -0.2405],
  Luton: [51.8787, -0.4200],
  Ipswich: [52.0567, 1.1482],
  "Milton Keynes": [52.0406, -0.7594],
  Norwich: [52.6309, 1.2974],
  York: [53.9590, -1.0815],
  Bath: [51.3781, -2.3597],
  Exeter: [50.7184, -3.5339],
  // Netherlands cities
  Amsterdam: [52.3676, 4.9041],
  Rotterdam: [51.9225, 4.4792],
  "The Hague": [52.0705, 4.3007],
  Eindhoven: [51.4416, 5.4697],
  Tilburg: [51.5555, 5.0913],
  Almere: [52.3508, 5.2647],
  Breda: [51.5719, 4.7683],
  Nijmegen: [51.8426, 5.8546],
  Enschede: [52.2215, 6.8937],
  Apeldoorn: [52.2112, 5.9699],
  Haarlem: [52.3874, 4.6462],
  Arnhem: [51.9851, 5.8987],
  Amersfoort: [52.1561, 5.3878],
  Leiden: [52.1601, 4.4970],
  Maastricht: [50.8514, 5.6910],
  Delft: [52.0116, 4.3571],
  Deventer: [52.2512, 6.1583],
  Venlo: [51.3704, 6.1724],
  Leeuwarden: [53.2012, 5.7999],
  // Sweden cities
  Gothenburg: [57.7089, 11.9746],
  "Malmö": [55.6050, 13.0038],
  Helsingborg: [56.0465, 12.6945],
  Linköping: [58.4108, 15.6214],
  Lund: [55.7047, 13.1910],
  "Umeå": [63.8258, 20.2630],
  "Gävle": [60.6749, 17.1413],
  "Borås": [57.7210, 12.9401],
  Eskilstuna: [59.3666, 16.5077],
  Halmstad: [56.6745, 12.8578],
  "Växjö": [56.8777, 14.8091],
  Karlstad: [59.3793, 13.5036],
  Sundsvall: [62.3908, 17.3069],
  "Östersund": [63.1792, 14.6357],
  "Luleå": [65.5848, 22.1547],
  // Belgium cities
  Antwerp: [51.2194, 4.4025],
  Ghent: [51.0543, 3.7174],
  Charleroi: [50.4108, 4.4446],
  "Liège": [50.6292, 5.5797],
  Bruges: [51.2093, 3.2247],
  Namur: [50.4669, 4.8674],
  Leuven: [50.8798, 4.7005],
  Mons: [50.4542, 3.9524],
  Aalst: [50.9381, 4.0356],
  Mechelen: [51.0259, 4.4775],
  Kortrijk: [50.8281, 3.2647],
  Hasselt: [50.9311, 5.3378],
  Ostend: [51.2293, 2.9142],
  Genk: [50.9652, 5.5047],
  // Italy cities
  Rome: [41.9028, 12.4964],
  Milan: [45.4654, 9.1859],
  Naples: [40.8518, 14.2681],
  Turin: [45.0703, 7.6869],
  Palermo: [38.1157, 13.3615],
  Genoa: [44.4056, 8.9463],
  Bologna: [44.4949, 11.3426],
  Florence: [43.7696, 11.2558],
  Bari: [41.1253, 16.8620],
  Catania: [37.5023, 15.0873],
  Venice: [45.4408, 12.3155],
  Verona: [45.4384, 10.9916],
  Messina: [38.1938, 15.5540],
  Padua: [45.4064, 11.8768],
  Trieste: [45.6495, 13.7768],
  Brescia: [45.5416, 10.2118],
  Taranto: [40.4668, 17.2470],
  Modena: [44.6471, 10.9252],
  "Reggio Emilia": [44.6989, 10.6297],
  Perugia: [43.1107, 12.3908],
  Livorno: [43.5486, 10.3106],
  Cagliari: [39.2238, 9.1217],
  Foggia: [41.4621, 15.5444],
  Rimini: [44.0678, 12.5695],
  Salerno: [40.6824, 14.7681],
  Parma: [44.8015, 10.3279],
  Bergamo: [45.6983, 9.6773],
  // Spain cities
  Seville: [37.3891, -5.9845],
  Zaragoza: [41.6488, -0.8891],
  "Málaga": [36.7213, -4.4214],
  "Las Palmas": [28.1235, -15.4366],
  Bilbao: [43.2630, -2.9350],
  Alicante: [38.3452, -0.4810],
  "Córdoba": [37.8882, -4.7794],
  Valladolid: [41.6523, -4.7245],
  Vigo: [42.2406, -8.7207],
  "Gijón": [43.5453, -5.6615],
  "La Coruña": [43.3623, -8.4115],
  Granada: [37.1773, -3.5986],
  Vitoria: [42.8467, -2.6726],
  Elche: [38.2669, -0.7006],
  Oviedo: [43.3614, -5.8593],
  Badalona: [41.4500, 2.2470],
  Cartagena: [37.6063, -0.9863],
  Terrassa: [41.5634, 2.0097],
  Jerez: [36.6864, -6.1372],
  Sabadell: [41.5432, 2.1091],
  "Santa Cruz de Tenerife": [28.4636, -16.2518],
  Pamplona: [42.8125, -1.6458],
  "Almería": [36.8340, -2.4637],
  Burgos: [42.3439, -3.6969],
  Santander: [43.4623, -3.8099],
  // Portugal cities
  Lisbon: [38.7169, -9.1395],
  Porto: [41.1579, -8.6291],
  Braga: [41.5503, -8.4200],
  Coimbra: [40.2033, -8.4103],
  Funchal: [32.6669, -16.9241],
  "Setúbal": [38.5244, -8.8882],
  Aveiro: [40.6405, -8.6538],
  "Guimarães": [41.4425, -8.2910],
  Almada: [38.6791, -9.1579],
  Viseu: [40.6566, -7.9122],
  Faro: [37.0193, -7.9304],
  Cascais: [38.6979, -9.4215],
  Leiria: [39.7436, -8.8071],
  "Évora": [38.5713, -7.9114],
  // Poland cities
  Warsaw: [52.2297, 21.0122],
  "Kraków": [50.0647, 19.9450],
  "Łódź": [51.7592, 19.4560],
  "Wrocław": [51.1079, 17.0385],
  "Poznań": [52.4064, 16.9252],
  "Gdańsk": [54.3520, 18.6466],
  Szczecin: [53.4285, 14.5528],
  Bydgoszcz: [53.1235, 18.0084],
  Lublin: [51.2465, 22.5684],
  Katowice: [50.2649, 19.0238],
  "Białystok": [53.1325, 23.1688],
  Gdynia: [54.5189, 18.5305],
  Toruń: [53.0138, 18.5984],
  Rzeszów: [50.0412, 21.9991],
  Olsztyn: [53.7784, 20.4801],
  Opole: [50.6751, 17.9213],
  // Czech Republic cities
  Prague: [50.0755, 14.4378],
  Brno: [49.1951, 16.6068],
  Ostrava: [49.8209, 18.2625],
  "Plzeň": [49.7384, 13.3736],
  Liberec: [50.7663, 15.0543],
  Olomouc: [49.5938, 17.2509],
  "České Budějovice": [48.9745, 14.4747],
  "Hradec Králové": [50.2092, 15.8328],
  Pardubice: [50.0343, 15.7812],
  "Zlín": [49.2244, 17.6603],
  // Hungary cities
  Budapest: [47.4979, 19.0402],
  Debrecen: [47.5316, 21.6273],
  Miskolc: [48.1036, 20.7784],
  Szeged: [46.2530, 20.1414],
  "Pécs": [46.0727, 18.2330],
  "Győr": [47.6875, 17.6504],
  "Nyíregyháza": [47.9557, 21.7167],
  "Kecskemét": [46.9064, 19.6913],
  "Székesfehérvár": [47.1860, 18.4221],
  Szombathely: [47.2307, 16.6218],
  Sopron: [47.6810, 16.5845],
  // Romania cities
  Bucharest: [44.4268, 26.1025],
  "Cluj-Napoca": [46.7712, 23.6236],
  "Timișoara": [45.7489, 21.2087],
  "Iași": [47.1585, 27.6014],
  "Constanța": [44.1598, 28.6348],
  Craiova: [44.3302, 23.7949],
  "Brașov": [45.6427, 25.5887],
  "Galați": [45.4353, 28.0079],
  "Ploiești": [44.9360, 26.0363],
  Oradea: [47.0458, 21.9189],
  // Bulgaria cities
  Sofia: [42.6977, 23.3219],
  Plovdiv: [42.1354, 24.7453],
  Varna: [43.2141, 27.9147],
  Burgas: [42.5048, 27.4626],
  Ruse: [43.8564, 25.9699],
  "Stara Zagora": [42.4258, 25.6345],
  Pleven: [43.4170, 24.6067],
  Sliven: [42.6833, 26.3167],
  // Greece cities
  Athens: [37.9838, 23.7275],
  Thessaloniki: [40.6401, 22.9444],
  Patras: [38.2466, 21.7346],
  Piraeus: [37.9475, 23.6459],
  Heraklion: [35.3387, 25.1442],
  Larissa: [39.6390, 22.4191],
  Volos: [39.3666, 22.9426],
  Ioannina: [39.6650, 20.8537],
  Chania: [35.5138, 24.0180],
  Kavala: [40.9400, 24.4019],
  Rhodes: [36.4341, 28.2176],
  Corfu: [39.6243, 19.9217],
  // Austria cities
  Graz: [47.0707, 15.4395],
  Linz: [48.3069, 14.2858],
  Klagenfurt: [46.6228, 14.3051],
  Villach: [46.6096, 13.8496],
  Wels: [48.1581, 14.0286],
  "Sankt Pölten": [48.2045, 15.6229],
  Dornbirn: [47.4122, 9.7417],
  "Wiener Neustadt": [47.8133, 16.2431],
  Steyr: [48.0333, 14.4167],
  Feldkirch: [47.2373, 9.5996],
  Bregenz: [47.5031, 9.7471],
  // Nordic extra cities
  Bergen: [60.3913, 5.3221],
  Trondheim: [63.4305, 10.3951],
  Stavanger: [58.9700, 5.7331],
  Tromsø: [69.6489, 18.9551],
  // Turkey extra cities
  Diyarbakır: [37.9144, 40.2306],
  Eskişehir: [39.7767, 30.5206],
  Urfa: [37.1591, 38.7969],
  Samsun: [41.2867, 36.3300],
  Denizli: [37.7765, 29.0864],
  Malatya: [38.3552, 38.3095],
  Trabzon: [41.0015, 39.7178],
  Erzurum: [39.9055, 41.2658],
  Van: [38.4891, 43.4089],
  Kocaeli: [40.8533, 29.8815],
  Manisa: [38.6191, 27.4289],
  "Balıkesir": [39.6484, 27.8826],
  // UAE cities
  "Al Ain": [24.2075, 55.7447],
  "Khor Fakkan": [25.3390, 56.3583],
  Kalba: [25.0706, 56.3537],
  // Saudi Arabia cities
  Riyadh: [24.7136, 46.6753],
  Jeddah: [21.4858, 39.1925],
  Mecca: [21.3891, 39.8579],
  Medina: [24.5247, 39.5692],
  Dammam: [26.4207, 50.0888],
  Khobar: [26.2172, 50.1971],
  Jubail: [27.0174, 49.6580],
  Tabuk: [28.3838, 36.5550],
  Abha: [18.2164, 42.5053],
  Buraidah: [26.3260, 43.9750],
  Taif: [21.2854, 40.4151],
  Yanbu: [24.0894, 38.0618],
  Najran: [17.4924, 44.1277],
  Jizan: [16.8892, 42.5511],
  Hail: [27.5114, 41.7208],
  // Israel cities
  "Tel Aviv": [32.0853, 34.7818],
  Jerusalem: [31.7683, 35.2137],
  Haifa: [32.7940, 34.9896],
  "Rishon LeZion": [31.9642, 34.8013],
  "Petah Tikva": [32.0840, 34.8878],
  Ashdod: [31.8040, 34.6550],
  Netanya: [32.3215, 34.8532],
  "Beer Sheva": [31.2520, 34.7915],
  "Bnei Brak": [32.0868, 34.8338],
  Holon: [32.0107, 34.7740],
  "Bat Yam": [32.0230, 34.7520],
  "Ramat Gan": [32.0684, 34.8248],
  Rehovot: [31.8928, 34.8113],
  Herzliya: [32.1663, 34.8440],
  Nazareth: [32.7021, 35.2979],
  Eilat: [29.5577, 34.9519],
  // Jordan cities
  Amman: [31.9454, 35.9284],
  Zarqa: [32.0728, 36.0880],
  Irbid: [32.5556, 35.8500],
  Russeifa: [32.0151, 36.0475],
  Aqaba: [29.5266, 35.0078],
  Madaba: [31.7167, 35.7833],
  Mafraq: [32.3427, 36.2135],
  // Lebanon cities
  Beirut: [33.8938, 35.5018],
  Tripoli: [34.4367, 35.8497],
  Sidon: [33.5633, 35.3683],
  Tyre: [33.2705, 35.2038],
  Jounieh: [33.9817, 35.6178],
  "Zahle": [33.8467, 35.9017],
  Baalbek: [34.0042, 36.2117],
  Nabatieh: [33.3790, 35.4840],
  // Syria cities
  Damascus: [33.5102, 36.2913],
  Aleppo: [36.2021, 37.1343],
  Homs: [34.7274, 36.7137],
  Latakia: [35.5317, 35.7916],
  Hama: [35.1317, 36.7550],
  // Iraq cities
  Baghdad: [33.3152, 44.3661],
  Basra: [30.5085, 47.7804],
  Mosul: [36.3350, 43.1189],
  Erbil: [36.1901, 44.0091],
  Najaf: [31.9904, 44.3358],
  Karbala: [32.6160, 44.0248],
  Kirkuk: [35.4681, 44.3922],
  Sulaymaniyah: [35.5574, 45.4348],
  // Kuwait cities
  "Kuwait City": [29.3759, 47.9774],
  Hawalli: [29.3336, 48.0272],
  Salmiya: [29.3350, 48.0790],
  Farwaniya: [29.2775, 47.9600],
  Ahmadi: [29.0767, 48.1361],
  Jahra: [29.3372, 47.6572],
  Fahaheel: [29.0840, 48.1330],
  // Qatar cities
  Doha: [25.2854, 51.5310],
  "Al Rayyan": [25.2919, 51.4244],
  "Al Wakrah": [25.1644, 51.5930],
  "Al Khor": [25.6810, 51.4980],
  Lusail: [25.4264, 51.4881],
  // Bahrain cities
  Manama: [26.2285, 50.5860],
  Muharraq: [26.2569, 50.6110],
  Riffa: [26.1300, 50.5550],
  "Hamad Town": [26.1083, 50.5098],
  // Oman cities
  Muscat: [23.5880, 58.3829],
  Salalah: [17.0151, 54.0924],
  Sohar: [24.3477, 56.7429],
  Nizwa: [22.9333, 57.5333],
  Sur: [22.5667, 59.5289],
  // Yemen cities
  Sanaa: [15.3694, 44.1910],
  Aden: [12.7797, 45.0095],
  Taiz: [13.5788, 44.0209],
  Hodeidah: [14.7980, 42.9511],
  Mukalla: [14.5301, 49.1214],
  // Palestine cities
  Gaza: [31.5017, 34.4668],
  Ramallah: [31.9038, 35.2034],
  Nablus: [32.2211, 35.2544],
  Hebron: [31.5326, 35.0998],
  Jenin: [32.4653, 35.2960],
  Bethlehem: [31.7054, 35.2024],
  // Afghanistan cities
  Kabul: [34.5253, 69.1783],
  Kandahar: [31.6131, 65.6990],
  Herat: [34.3529, 62.2040],
  "Mazar-i-Sharif": [36.7069, 67.1112],
  Jalalabad: [34.4415, 70.4360],
  Kunduz: [36.7278, 68.8677],
  Ghazni: [33.5537, 68.4228],
  // Pakistan cities
  Karachi: [24.8607, 67.0011],
  Lahore: [31.5204, 74.3587],
  Faisalabad: [31.4180, 73.0790],
  Rawalpindi: [33.6007, 73.0679],
  Gujranwala: [32.1877, 74.1945],
  Peshawar: [34.0151, 71.5249],
  Multan: [30.1984, 71.4687],
  Islamabad: [33.7294, 73.0931],
  Quetta: [30.1798, 66.9750],
  Sialkot: [32.4945, 74.5229],
  Bahawalpur: [29.3956, 71.6836],
  Sukkur: [27.7052, 68.8574],
  // Central Asia cities
  Almaty: [43.2220, 76.8512],
  "Nur-Sultan": [51.1811, 71.4460],
  Shymkent: [42.3000, 69.6000],
  Tashkent: [41.2995, 69.2401],
  Samarkand: [39.6542, 66.9597],
  Bukhara: [39.7747, 64.4286],
  Dushanbe: [38.5598, 68.7870],
  Bishkek: [42.8746, 74.5698],
  Ashgabat: [37.9601, 58.3261],
  Baku: [40.4093, 49.8671],
  Tbilisi: [41.6938, 44.8015],
  Yerevan: [40.1872, 44.5152],
  Gyumri: [40.7942, 43.8453],
  Batumi: [41.6168, 41.6367],
  Ganja: [40.6828, 46.3606],
  // US cities
  "New York City": [40.7128, -74.0060],
  "Los Angeles": [34.0522, -118.2437],
  Chicago: [41.8781, -87.6298],
  Houston: [29.7604, -95.3698],
  Phoenix: [33.4484, -112.0740],
  Philadelphia: [39.9526, -75.1652],
  "San Antonio": [29.4241, -98.4936],
  "San Diego": [32.7157, -117.1611],
  Dallas: [32.7767, -96.7970],
  "San Jose": [37.3382, -121.8863],
  Austin: [30.2672, -97.7431],
  Jacksonville: [30.3322, -81.6557],
  "Fort Worth": [32.7555, -97.3308],
  Columbus: [39.9612, -82.9988],
  Charlotte: [35.2271, -80.8431],
  Indianapolis: [39.7684, -86.1581],
  "San Francisco": [37.7749, -122.4194],
  Seattle: [47.6062, -122.3321],
  Denver: [39.7392, -104.9903],
  Nashville: [36.1627, -86.7816],
  "El Paso": [31.7619, -106.4850],
  "Washington DC": [38.9072, -77.0369],
  "Las Vegas": [36.1699, -115.1398],
  Louisville: [38.2527, -85.7585],
  Portland: [45.5051, -122.6750],
  "Oklahoma City": [35.4676, -97.5164],
  Milwaukee: [43.0389, -87.9065],
  Albuquerque: [35.0844, -106.6504],
  Tucson: [32.2226, -110.9747],
  Fresno: [36.7378, -119.7871],
  Sacramento: [38.5816, -121.4944],
  "Kansas City": [39.0997, -94.5786],
  Atlanta: [33.7490, -84.3880],
  Mesa: [33.4152, -111.8315],
  Omaha: [41.2565, -95.9345],
  "Colorado Springs": [38.8339, -104.8214],
  Raleigh: [35.7796, -78.6382],
  "Long Beach": [33.7701, -118.1937],
  "Virginia Beach": [36.8529, -75.9780],
  Minneapolis: [44.9778, -93.2650],
  Tampa: [27.9506, -82.4572],
  "New Orleans": [29.9511, -90.0715],
  Arlington: [32.7357, -97.1081],
  Wichita: [37.6872, -97.3301],
  Bakersfield: [35.3733, -119.0187],
  Aurora: [39.7294, -104.8319],
  Anaheim: [33.8366, -117.9143],
  "Santa Ana": [33.7455, -117.8677],
  "Corpus Christi": [27.8006, -97.3964],
  Riverside: [33.9806, -117.3755],
  Pittsburgh: [40.4406, -79.9959],
  Cincinnati: [39.1031, -84.5120],
  Henderson: [36.0395, -114.9817],
  Lincoln: [40.8136, -96.7026],
  Buffalo: [42.8864, -78.8784],
  "Chula Vista": [32.6401, -117.0842],
  "St. Petersburg": [27.7676, -82.6403],
  Norfolk: [36.8508, -76.2859],
  Chandler: [33.3062, -111.8413],
  Laredo: [27.5306, -99.4803],
  Madison: [43.0731, -89.4012],
  Durham: [35.9940, -78.8986],
  Lubbock: [33.5779, -101.8552],
  Garland: [32.9126, -96.6389],
  Glendale: [33.5387, -112.1860],
  Hialeah: [25.8576, -80.2781],
  Reno: [39.5296, -119.8138],
  "Baton Rouge": [30.4515, -91.1871],
  Irvine: [33.6846, -117.8265],
  Irving: [32.8140, -96.9489],
  Scottsdale: [33.4942, -111.9261],
  Fremont: [37.5485, -121.9886],
  Gilbert: [33.3528, -111.7890],
  "San Bernardino": [34.1083, -117.2898],
  "Birmingham AL": [33.5186, -86.8104],
  Boise: [43.6150, -116.2023],
  Rochester: [43.1566, -77.6088],
  Spokane: [47.6588, -117.4260],
  "Des Moines": [41.5868, -93.6250],
  Modesto: [37.6391, -120.9969],
  Tacoma: [47.2529, -122.4443],
  Fontana: [34.0922, -117.4350],
  Akron: [41.0814, -81.5190],
  Yonkers: [40.9312, -73.8988],
  "Huntington Beach": [33.6595, -117.9988],
  "Little Rock": [34.7465, -92.2896],
  Augusta: [33.4735, -82.0105],
  "Grand Rapids": [42.9634, -85.6681],
  Tallahassee: [30.4518, -84.2807],
  Knoxville: [35.9606, -83.9207],
  Worcester: [42.2626, -71.8023],
  Providence: [41.8240, -71.4128],
  "Fort Collins": [40.5853, -105.0844],
  Detroit: [42.3314, -83.0458],
  Miami: [25.7617, -80.1918],
  Baltimore: [39.2904, -76.6122],
  Boston: [42.3601, -71.0589],
  // Canada cities
  Toronto: [43.6532, -79.3832],
  Montreal: [45.5017, -73.5673],
  Vancouver: [49.2827, -123.1207],
  Calgary: [51.0447, -114.0719],
  Edmonton: [53.5461, -113.4938],
  Ottawa: [45.4215, -75.6972],
  Winnipeg: [49.8951, -97.1384],
  "Quebec City": [46.8139, -71.2080],
  Hamilton: [43.2557, -79.8711],
  Kitchener: [43.4516, -80.4925],
  Halifax: [44.6488, -63.5752],
  Victoria: [48.4284, -123.3656],
  Saskatoon: [52.1332, -106.6700],
  Regina: [50.4452, -104.6189],
  Brampton: [43.7315, -79.7624],
  Mississauga: [43.5890, -79.6441],
  Markham: [43.8561, -79.3370],
  Oakville: [43.4675, -79.6877],
  Laval: [45.5808, -73.7108],
  Gatineau: [45.4765, -75.7013],
  Sherbrooke: [45.4042, -71.8929],
  Abbotsford: [49.0504, -122.3045],
  Coquitlam: [49.2838, -122.7932],
  Guelph: [43.5448, -80.2482],
  Moncton: [46.0878, -64.7782],
  "St. John's": [47.5615, -52.7126],
  // Mexico cities
  "Mexico City": [19.4326, -99.1332],
  Guadalajara: [20.6597, -103.3496],
  Monterrey: [25.6866, -100.3161],
  Puebla: [19.0414, -98.2063],
  Tijuana: [32.5149, -117.0382],
  Toluca: [19.2826, -99.6557],
  "León": [21.1221, -101.6822],
  "Juárez": [31.7381, -106.4870],
  "Mérida": [20.9674, -89.6235],
  Hermosillo: [29.0729, -110.9559],
  Saltillo: [25.4382, -100.9737],
  Mexicali: [32.6245, -115.4523],
  Culiacán: [24.7994, -107.3879],
  Chihuahua: [28.6320, -106.0691],
  Acapulco: [16.8531, -99.8237],
  Veracruz: [19.1738, -96.1342],
  Morelia: [19.7060, -101.1950],
  "Querétaro": [20.5888, -100.3899],
  Cancún: [21.1619, -86.8515],
  "Oaxaca": [17.0600, -96.7183],
  "Torreón": [25.5427, -103.4068],
  // Australia cities
  Sydney: [-33.8688, 151.2093],
  Melbourne: [-37.8136, 144.9631],
  Brisbane: [-27.4698, 153.0251],
  Perth: [-31.9505, 115.8605],
  Adelaide: [-34.9285, 138.6007],
  "Gold Coast": [-28.0167, 153.4000],
  Canberra: [-35.2809, 149.1300],
  Townsville: [-19.2590, 146.8169],
  Cairns: [-16.9186, 145.7781],
  Darwin: [-12.4634, 130.8456],
  Toowoomba: [-27.5598, 151.9507],
  Ballarat: [-37.5622, 143.8503],
  Bendigo: [-36.7570, 144.2794],
  Bunbury: [-33.3271, 115.6414],
  "Hervey Bay": [-25.2988, 152.8313],
  "Wagga Wagga": [-35.1082, 147.3598],
  Mackay: [-21.1411, 149.1863],
  Rockhampton: [-23.3791, 150.5100],
  // New Zealand cities
  Auckland: [-36.8485, 174.7633],
  Wellington: [-41.2865, 174.7762],
  Christchurch: [-43.5321, 172.6362],
  "Hamilton NZ": [-37.7870, 175.2793],
  Tauranga: [-37.6878, 176.1651],
  Dunedin: [-45.8788, 170.5028],
  "Palmerston North": [-40.3523, 175.6082],
  Nelson: [-41.2706, 173.2840],
  Rotorua: [-38.1368, 176.2497],
  Napier: [-39.4928, 176.9120],
  Whangarei: [-35.7275, 174.3249],
  "New Plymouth": [-39.0556, 174.0752],
  Invercargill: [-46.4132, 168.3538],
  // Japan cities
  Tokyo: [35.6762, 139.6503],
  Yokohama: [35.4437, 139.6380],
  Osaka: [34.6937, 135.5023],
  Nagoya: [35.1815, 136.9066],
  Sapporo: [43.0618, 141.3545],
  Fukuoka: [33.5904, 130.4017],
  Kobe: [34.6901, 135.1956],
  Kawasaki: [35.5308, 139.7029],
  Kyoto: [35.0116, 135.7681],
  Saitama: [35.8616, 139.6455],
  Hiroshima: [34.3853, 132.4553],
  Sendai: [38.2682, 140.8694],
  Kitakyushu: [33.8834, 130.8752],
  Chiba: [35.6073, 140.1063],
  Sakai: [34.5733, 135.4830],
  Niigata: [37.9161, 139.0364],
  Hamamatsu: [34.7108, 137.7261],
  Shizuoka: [34.9756, 138.3828],
  Okayama: [34.6618, 133.9344],
  Kumamoto: [32.8031, 130.7079],
  Kagoshima: [31.5966, 130.5571],
  Utsunomiya: [36.5551, 139.8828],
  Kanazawa: [36.5944, 136.6256],
  // South Korea cities
  Seoul: [37.5665, 126.9780],
  Busan: [35.1796, 129.0756],
  Incheon: [37.4563, 126.7052],
  Daegu: [35.8714, 128.6014],
  Daejeon: [36.3504, 127.3845],
  Gwangju: [35.1595, 126.8526],
  Suwon: [37.2636, 127.0286],
  Ulsan: [35.5384, 129.3114],
  Changwon: [35.2284, 128.6811],
  Seongnam: [37.4449, 127.1388],
  Goyang: [37.6558, 126.8320],
  Bucheon: [37.4989, 126.7831],
  Yongin: [37.2411, 127.1776],
  // India cities
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.6139, 77.2090],
  Bangalore: [12.9716, 77.5946],
  Hyderabad: [17.3850, 78.4867],
  Ahmedabad: [23.0225, 72.5714],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Surat: [21.1702, 72.8311],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Kanpur: [26.4499, 80.3319],
  Nagpur: [21.1458, 79.0882],
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Visakhapatnam: [17.6868, 83.2185],
  Patna: [25.5941, 85.1376],
  Vadodara: [22.3072, 73.1812],
  Agra: [27.1767, 78.0081],
  Nashik: [19.9975, 73.7898],
  Meerut: [28.9845, 77.7064],
  Rajkot: [22.3039, 70.8022],
  Varanasi: [25.3176, 82.9739],
  Aurangabad: [19.8762, 75.3433],
  Coimbatore: [11.0168, 76.9558],
  Amritsar: [31.6340, 74.8723],
  Jodhpur: [26.2389, 73.0243],
  Chandigarh: [30.7333, 76.7794],
  Guwahati: [26.1445, 91.7362],
  Mysore: [12.2958, 76.6394],
  Madurai: [9.9252, 78.1198],
  Thiruvananthapuram: [8.5241, 76.9366],
  Allahabad: [25.4358, 81.8463],
  // China cities
  Shanghai: [31.2304, 121.4737],
  Beijing: [39.9042, 116.4074],
  Guangzhou: [23.1291, 113.2644],
  Shenzhen: [22.5431, 114.0579],
  Chengdu: [30.5728, 104.0668],
  Chongqing: [29.4316, 106.9123],
  Tianjin: [39.3434, 117.3616],
  Wuhan: [30.5928, 114.3055],
  "Xi'an": [34.3416, 108.9398],
  Hangzhou: [30.2741, 120.1551],
  Nanjing: [32.0603, 118.7969],
  Shenyang: [41.8057, 123.4315],
  Harbin: [45.8038, 126.5349],
  Qingdao: [36.0671, 120.3826],
  Dongguan: [23.0207, 113.7518],
  Jinan: [36.6512, 117.1201],
  Changsha: [28.2278, 112.9388],
  Dalian: [38.9140, 121.6147],
  Kunming: [25.0389, 102.7183],
  Hefei: [31.8639, 117.2808],
  Suzhou: [31.2989, 120.5853],
  Zhengzhou: [34.7466, 113.6253],
  Nanning: [22.8170, 108.3665],
  Fuzhou: [26.0745, 119.2965],
  Xiamen: [24.4798, 118.0894],
  Ningbo: [29.8683, 121.5440],
  Urumqi: [43.8256, 87.6168],
  // Indonesia cities
  Jakarta: [-6.2088, 106.8456],
  Surabaya: [-7.2504, 112.7688],
  Bandung: [-6.9175, 107.6191],
  Medan: [3.5952, 98.6722],
  Bekasi: [-6.2349, 106.9896],
  Semarang: [-6.9932, 110.4203],
  Makassar: [-5.1477, 119.4327],
  Palembang: [-2.9761, 104.7754],
  Batam: [1.1301, 104.0529],
  Denpasar: [-8.6705, 115.2126],
  Malang: [-7.9797, 112.6304],
  // Philippines cities
  Manila: [14.5995, 120.9842],
  "Quezon City": [14.6760, 121.0437],
  Davao: [7.1907, 125.4553],
  "Cebu City": [10.3157, 123.8854],
  Antipolo: [14.5869, 121.1761],
  Taguig: [14.5243, 121.0792],
  Makati: [14.5547, 121.0244],
  "Cagayan de Oro": [8.4542, 124.6319],
  // Vietnam cities
  Hanoi: [21.0285, 105.8542],
  "Ho Chi Minh City": [10.8231, 106.6297],
  "Da Nang": [16.0544, 108.2022],
  "Hai Phong": [20.8449, 106.6881],
  "Bien Hoa": [10.9574, 106.8426],
  Hue: [16.4637, 107.5909],
  "Nha Trang": [12.2388, 109.1967],
  "Can Tho": [10.0452, 105.7469],
  "Vung Tau": [10.3460, 107.0843],
  // Thailand cities
  Bangkok: [13.7563, 100.5018],
  "Chiang Mai": [18.7883, 98.9853],
  Pattaya: [12.9236, 100.8825],
  Phuket: [7.8804, 98.3923],
  "Khon Kaen": [16.4419, 102.8360],
  "Hat Yai": [7.0086, 100.4747],
  "Nakhon Ratchasima": [14.9799, 102.1008],
  "Udon Thani": [17.4138, 102.7872],
  Nonthaburi: [13.8621, 100.5144],
  Chonburi: [13.3611, 100.9847],
  // Malaysia cities
  "Kuala Lumpur": [3.1390, 101.6869],
  "George Town": [5.4141, 100.3296],
  "Johor Bahru": [1.4927, 103.7414],
  Ipoh: [4.5975, 101.0901],
  "Shah Alam": [3.0733, 101.5185],
  "Petaling Jaya": [3.1073, 101.6067],
  "Kota Kinabalu": [5.9788, 116.0753],
  Kuching: [1.5535, 110.3593],
  "Subang Jaya": [3.0480, 101.5810],
  Klang: [3.0449, 101.4457],
  Seremban: [2.7297, 101.9381],
  "Malacca City": [2.1896, 102.2501],
  Kuantan: [3.8077, 103.3260],
  // Bangladesh cities
  Dhaka: [23.8103, 90.4125],
  Chittagong: [22.3569, 91.7832],
  Sylhet: [24.8949, 91.8687],
  Rajshahi: [24.3745, 88.6042],
  Khulna: [22.8456, 89.5403],
  Comilla: [23.4607, 91.1809],
  Narayanganj: [23.6238, 90.4994],
  Gazipur: [23.9999, 90.4203],
  Rangpur: [25.7439, 89.2752],
  Mymensingh: [24.7471, 90.4203],
  // Egypt cities
  Cairo: [30.0444, 31.2357],
  Alexandria: [31.2001, 29.9187],
  Giza: [30.0131, 31.2089],
  "Port Said": [31.2653, 32.3019],
  Suez: [29.9668, 32.5498],
  Luxor: [25.6872, 32.6396],
  Mansoura: [31.0409, 31.3785],
  Tanta: [30.7865, 31.0004],
  Ismailia: [30.5965, 32.2715],
  Aswan: [24.0889, 32.8998],
  Hurghada: [27.2574, 33.8129],
  "Sharm El Sheikh": [27.9158, 34.3300],
  // Morocco cities
  Casablanca: [33.5731, -7.5898],
  Rabat: [34.0209, -6.8416],
  Fez: [34.0181, -5.0078],
  Marrakech: [31.6295, -7.9811],
  Agadir: [30.4278, -9.5981],
  Tangier: [35.7595, -5.8340],
  Meknes: [33.8935, -5.5473],
  Oujda: [34.6814, -1.9086],
  Kenitra: [34.2610, -6.5802],
  Tetouan: [35.5785, -5.3684],
  Safi: [32.2994, -9.2372],
  "El Jadida": [33.2316, -8.5007],
  Nador: [35.1681, -2.9335],
  // Algeria cities
  Algiers: [36.7372, 3.0865],
  Oran: [35.6969, -0.6331],
  Constantine: [36.3650, 6.6147],
  Annaba: [36.9000, 7.7667],
  Blida: [36.4702, 2.8277],
  Batna: [35.5554, 6.1741],
  "Sétif": [36.1898, 5.4133],
  "Béjaïa": [36.7509, 5.0564],
  Tlemcen: [34.8828, -1.3150],
  // Tunisia cities
  Tunis: [36.8190, 10.1658],
  Sfax: [34.7400, 10.7600],
  Sousse: [35.8256, 10.6369],
  Kairouan: [35.6772, 10.1006],
  Bizerte: [37.2746, 9.8737],
  "Gabès": [33.8881, 10.0975],
  Monastir: [35.7643, 10.8113],
  Nabeul: [36.4513, 10.7357],
  Hammamet: [36.3997, 10.6132],
  // South Africa cities
  Johannesburg: [-26.2041, 28.0473],
  "Cape Town": [-33.9249, 18.4241],
  Durban: [-29.8587, 31.0218],
  Pretoria: [-25.7479, 28.2293],
  "Port Elizabeth": [-33.9608, 25.6022],
  Bloemfontein: [-29.1210, 26.2140],
  "East London": [-33.0153, 27.9116],
  Polokwane: [-23.9045, 29.4688],
  Nelspruit: [-25.4736, 30.9699],
  Pietermaritzburg: [-29.6006, 30.3794],
  Rustenburg: [-25.6672, 27.2428],
  // Nigeria cities
  Lagos: [6.5244, 3.3792],
  Abuja: [9.0765, 7.3986],
  Kano: [12.0022, 8.5920],
  Ibadan: [7.3775, 3.9470],
  "Port Harcourt": [4.8396, 7.0328],
  "Benin City": [6.3350, 5.6037],
  Enugu: [6.4584, 7.5464],
  Kaduna: [10.5222, 7.4383],
  Warri: [5.5167, 5.7500],
  Sokoto: [13.0622, 5.2339],
  Owerri: [5.4836, 7.0333],
  Akure: [7.2526, 5.1939],
  // Kenya cities
  Nairobi: [-1.2921, 36.8219],
  Mombasa: [-4.0435, 39.6682],
  Kisumu: [-0.1022, 34.7617],
  Nakuru: [-0.3031, 36.0800],
  Eldoret: [0.5143, 35.2698],
  // Ethiopia cities
  "Addis Ababa": [9.1450, 38.7253],
  "Dire Dawa": [9.5930, 41.8661],
  Gondar: [12.6000, 37.4667],
  Adama: [8.5400, 39.2700],
  Hawassa: [7.0500, 38.4800],
  "Bahir Dar": [11.5936, 37.3917],
  // Ghana cities
  Accra: [5.6037, -0.1870],
  Kumasi: [6.6885, -1.6244],
  Tamale: [9.4006, -0.8424],
  Tema: [5.6698, -0.0166],
  // Tanzania cities
  "Dar es Salaam": [-6.7924, 39.2083],
  Arusha: [-3.3869, 36.6830],
  Mwanza: [-2.5164, 32.9175],
  "Zanzibar City": [-6.1650, 39.2026],
  Dodoma: [-6.1722, 35.7395],
  // Sudan cities
  Khartoum: [15.5007, 32.5599],
  Omdurman: [15.6445, 32.4779],
  "Port Sudan": [19.6158, 37.2164],
  // Cameroon cities
  Douala: [4.0511, 9.7679],
  "Yaoundé": [3.8480, 11.5021],
  Bamenda: [5.9631, 10.1591],
  Bafoussam: [5.4797, 10.4170],
  // DRC cities
  Kinshasa: [-4.4419, 15.2663],
  Lubumbashi: [-11.6609, 27.4795],
  "Mbuji-Mayi": [-6.1361, 23.5897],
  Kisangani: [0.5144, 25.1956],
  // Angola cities
  Luanda: [-8.8368, 13.2343],
  Huambo: [-12.7761, 15.7391],
  Lobito: [-12.3647, 13.5456],
  // Ivory Coast cities
  Abidjan: [5.3600, -4.0083],
  Yamoussoukro: [6.8276, -5.2893],
  "Bouaké": [7.6906, -5.0299],
  // Senegal cities
  Dakar: [14.6928, -17.4467],
  Touba: [14.8667, -15.8833],
  "Thiès": [14.7886, -16.9362],
  // Remaining African cities
  Bamako: [12.6392, -8.0029],
  Ouagadougou: [12.3641, -1.5317],
  Niamey: [13.5137, 2.1098],
  Mogadishu: [2.0469, 45.3182],
  "Djibouti City": [11.8251, 42.5903],
  Asmara: [15.3380, 38.9318],
  Antananarivo: [-18.9137, 47.5361],
  Libreville: [0.3901, 9.4544],
  Brazzaville: [-4.2661, 15.2831],
  Bangui: [4.3612, 18.5550],
  "N'Djamena": [12.1048, 15.0445],
  Cotonou: [6.3654, 2.4183],
  "Lomé": [6.1375, 1.2123],
  Monrovia: [6.2907, -10.7605],
  Freetown: [8.4657, -13.2317],
  Banjul: [13.4549, -16.5790],
  Nouakchott: [18.0858, -15.9785],
  Praia: [14.9305, -23.5133],
  Moroni: [-11.7022, 43.2551],
  "Port Louis": [-20.1609, 57.4994],
  Mbabane: [-26.3186, 31.1410],
  Maseru: [-29.3167, 27.4833],
  Lilongwe: [-13.9669, 33.7873],
  Gitega: [-3.4271, 29.9255],
  Windhoek: [-22.5597, 17.0832],
  Gaborone: [-24.6282, 25.9231],
  Lusaka: [-15.4167, 28.2833],
  Harare: [-17.8252, 31.0335],
  // Central Asian cities
  Namangan: [40.9983, 71.6726],
  Fergana: [40.3864, 71.7864],
  Khujand: [40.2833, 69.6333],
  Osh: [40.5283, 72.7985],
  Mary: [37.6000, 61.8333],
  "Türkmenabat": [39.0833, 63.5667],
  // Caucasus cities
  Kutaisi: [42.2679, 42.7078],
  Rustavi: [41.5500, 45.0167],
  Sumqayit: [40.5892, 49.6322],
  // South America cities
  "São Paulo": [-23.5505, -46.6333],
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Brasília": [-15.7942, -47.8822],
  Salvador: [-12.9714, -38.5014],
  Fortaleza: [-3.7319, -38.5267],
  "Belo Horizonte": [-19.9191, -43.9386],
  Manaus: [-3.1190, -60.0217],
  Curitiba: [-25.4290, -49.2671],
  Recife: [-8.0476, -34.8770],
  "Goiânia": [-16.6799, -49.2550],
  "Belém": [-1.4558, -48.5044],
  "Porto Alegre": [-30.0277, -51.2287],
  Campinas: [-22.9099, -47.0626],
  "São Luís": [-2.5297, -44.3028],
  Maceió: [-9.6658, -35.7353],
  Natal: [-5.7945, -35.2110],
  "João Pessoa": [-7.1153, -34.8641],
  "Buenos Aires": [-34.6037, -58.3816],
  "Córdoba AR": [-31.4201, -64.1888],
  Rosario: [-32.9587, -60.6931],
  Mendoza: [-32.8908, -68.8272],
  Tucumán: [-26.8241, -65.2226],
  "La Plata": [-34.9215, -57.9545],
  "Mar del Plata": [-38.0055, -57.5426],
  Salta: [-24.7859, -65.4117],
  Bogotá: [4.7110, -74.0721],
  "Medellín": [6.2518, -75.5636],
  Cali: [3.4516, -76.5320],
  Barranquilla: [10.9685, -74.7813],
  "Cartagena CO": [10.3910, -75.4794],
  Caracas: [10.4806, -66.9036],
  Maracaibo: [10.6544, -71.6130],
  Lima: [-12.0464, -77.0428],
  Arequipa: [-16.4090, -71.5375],
  Trujillo: [-8.1091, -79.0215],
  Cusco: [-13.5319, -71.9675],
  Santiago: [-33.4489, -70.6693],
  Valparaíso: [-33.0472, -71.6127],
  Concepción: [-36.8269, -73.0498],
  Quito: [-0.1807, -78.4678],
  Guayaquil: [-2.1962, -79.8862],
  Cuenca: [-2.9001, -79.0059],
  "Santa Cruz": [-17.7833, -63.1833],
  "La Paz": [-16.5000, -68.1500],
  Cochabamba: [-17.3895, -66.1568],
  Asunción: [-25.2637, -57.5759],
  Montevideo: [-34.9011, -56.1645],
  Georgetown: [6.8013, -58.1553],
  Paramaribo: [5.8664, -55.1668],
  // Caribbean cities
  Havana: [23.1136, -82.3666],
  "Port of Spain": [10.6549, -61.5019],
  Kingston: [17.9970, -76.7936],
  "San Juan": [18.4655, -66.1057],
  "Santo Domingo": [18.4861, -69.9312],
  "Port-au-Prince": [18.5944, -72.3074],
  // Central America cities
  "Guatemala City": [14.6349, -90.5069],
  "San José": [9.9281, -84.0907],
  "Panama City": [8.9943, -79.5188],
  Managua: [12.1364, -86.2514],
  Tegucigalpa: [14.0818, -87.2068],
  "San Salvador": [13.6929, -89.2182],
  "Belize City": [17.2510, -88.7590],
  // Finland cities
  Helsinki: [60.1699, 24.9384],
  Espoo: [60.2052, 24.6522],
  Tampere: [61.4978, 23.7610],
  Vantaa: [60.2942, 25.0389],
  Oulu: [65.0124, 25.4682],
  Turku: [60.4518, 22.2666],
  "Jyväskylä": [62.2426, 25.7473],
  Lahti: [60.9827, 25.6612],
  Kuopio: [62.8924, 27.6772],
  Pori: [61.4851, 21.7971],
  // Baltic cities
  Tallinn: [59.4370, 24.7536],
  Tartu: [58.3780, 26.7290],
  Riga: [56.9460, 24.1059],
  Vilnius: [54.6872, 25.2797],
  Kaunas: [54.8985, 23.9036],
  "Klaipėda": [55.7033, 21.1443],
  Minsk: [53.9045, 27.5615],
  // Ukraine cities
  Kyiv: [50.4501, 30.5234],
  Kharkiv: [49.9935, 36.2304],
  Odessa: [46.4825, 30.7233],
  Dnipro: [48.4647, 35.0462],
  Zaporizhzhia: [47.8388, 35.1396],
  Lviv: [49.8397, 24.0297],
  Vinnytsia: [49.2331, 28.4682],
  Chernivtsi: [48.2921, 25.9358],
  // Moldova cities
  "Chișinău": [47.0105, 28.8638],
  Tiraspol: [46.8453, 29.6433],
  // Balkan cities
  Belgrade: [44.8176, 20.4569],
  "Novi Sad": [45.2671, 19.8335],
  Zagreb: [45.8150, 15.9819],
  Split: [43.5081, 16.4402],
  Sarajevo: [43.8519, 18.3866],
  Skopje: [41.9965, 21.4314],
  Tirana: [41.3275, 19.8187],
  Ljubljana: [46.0569, 14.5058],
  Maribor: [46.5547, 15.6459],
  Pristina: [42.6629, 21.1655],
  Podgorica: [42.4304, 19.2594],
  Bratislava: [48.1486, 17.1077],
  // Ireland cities
  Dublin: [53.3498, -6.2603],
  Cork: [51.8985, -8.4756],
  Limerick: [52.6638, -8.6267],
  Galway: [53.2707, -9.0568],
  Waterford: [52.2593, -7.1101],
  // Luxembourg
  "Luxembourg City": [49.6116, 6.1319],
  // Iceland
  Reykjavik: [64.1355, -21.8954],
  Akureyri: [65.6885, -18.1262],
  // Malta
  Valletta: [35.8997, 14.5147],
  Sliema: [35.9122, 14.5019],
  // Cyprus
  Nicosia: [35.1856, 33.3823],
  Limassol: [34.6823, 33.0464],
  Larnaca: [34.9009, 33.6249],
  Paphos: [34.7719, 32.4241],
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
  userLocation?: [number, number] | null;
}

export default function MapView({ businesses, onSelect, selected, focusCountry, focusCanton, userLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const squareMarkersRef = useRef<import("leaflet").Marker[]>([]);
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const router = useRouter();
  const [squares, setSquares] = useState<CitySquare[]>([]);
  const [activeSquare, setActiveSquare] = useState<CitySquare | null>(null);

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

  // Fetch city squares once
  useEffect(() => {
    fetch(`${API}/city_squares.php`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSquares(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Render square markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      squareMarkersRef.current.forEach((m) => m.remove());
      squareMarkersRef.current = [];

      squares.forEach((sq) => {
        if (!sq.is_active) return;
        const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
          <path d="${PERSIAN_STAR_PATH}" fill="#C9A84C" stroke="white" stroke-width="0.6"/>
        </svg>`;

        const divIcon = L.divIcon({
          html: `<div style="
            width:70px; height:70px;
            background: #1B3A6B;
            border: 3px solid #C9A84C;
            border-radius: 50%;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            box-shadow: 0 4px 16px rgba(27,58,107,0.5);
            cursor:pointer;
            transition: transform 0.15s, box-shadow 0.15s;
            gap:2px;
          "
          onmouseover="this.style.transform='scale(1.12)';this.style.boxShadow='0 8px 24px rgba(27,58,107,0.7)'"
          onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 16px rgba(27,58,107,0.5)'"
          >${starSvg}<span style="color:#C9A84C;font-size:8px;font-weight:700;font-family:Arial,sans-serif;line-height:1;text-align:center;padding:0 4px;white-space:nowrap;max-width:64px;overflow:hidden;text-overflow:ellipsis;">${sq.city}</span></div>`,
          className: "",
          iconSize: [70, 70],
          iconAnchor: [35, 35],
        });

        const tooltipHtml = `
          <div style="font-family:Arial,sans-serif;min-width:160px;max-width:220px;">
            <div style="font-weight:700;font-size:13px;color:#1B3A6B;margin-bottom:2px;">${sq.name_en}</div>
            <div style="font-size:12px;color:#888;margin-bottom:4px;">${sq.name_fa}</div>
            <div style="font-size:11px;color:#C9A84C;font-weight:600;">${sq.links.length} link${sq.links.length !== 1 ? "s" : ""} · Click to explore →</div>
          </div>`;

        const marker = L.marker([sq.lat, sq.lng], { icon: divIcon, zIndexOffset: 1000 })
          .addTo(mapInstanceRef.current!)
          .bindTooltip(tooltipHtml, { direction: "top", offset: [0, -36], opacity: 1, className: "persian-hub-tooltip" })
          .on("click", () => setActiveSquare((prev) => prev?.id === sq.id ? null : sq));

        squareMarkersRef.current.push(marker);
      });
    });
  }, [squares]);

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

  // User location — animated pulsing marker above all others
  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (userMarkerRef.current) userMarkerRef.current.remove();

      if (!document.getElementById("user-location-style")) {
        const s = document.createElement("style");
        s.id = "user-location-style";
        s.textContent = `
          @keyframes user-pulse {
            0%   { transform: scale(1);   opacity: 1; }
            70%  { transform: scale(2.8); opacity: 0; }
            100% { transform: scale(1);   opacity: 0; }
          }
          @keyframes user-glow {
            0%, 100% { box-shadow: 0 0 6px 2px rgba(74,144,217,0.8); }
            50%       { box-shadow: 0 0 18px 6px rgba(74,144,217,1); }
          }
          .user-location-dot {
            width: 16px; height: 16px;
            border-radius: 50%;
            background: #4A90D9;
            border: 3px solid #1B3A6B;
            box-shadow: 0 0 6px 2px rgba(74,144,217,0.8);
            animation: user-glow 1.8s ease-in-out infinite;
            position: relative;
          }
          .user-location-dot::after {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            border-radius: 50%;
            background: rgba(74,144,217,0.5);
            animation: user-pulse 1.8s ease-out infinite;
          }
        `;
        document.head.appendChild(s);
      }

      const icon = L.divIcon({
        html: `<div class="user-location-dot"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      userMarkerRef.current = L.marker(userLocation, {
        icon,
        zIndexOffset: 9999,
        interactive: false,
      }).addTo(mapInstanceRef.current!);

      mapInstanceRef.current!.flyTo(userLocation, 13, { duration: 1.2 });
    });
  }, [userLocation]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      {/* City Square popup panel */}
      {activeSquare && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 1000,
          width: 320, maxHeight: "calc(100% - 24px)",
          background: "white", borderRadius: 16,
          border: "2px solid #C9A84C",
          boxShadow: "0 8px 32px rgba(27,58,107,0.2)",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ background: "#1B3A6B", padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <path d={PERSIAN_STAR_PATH} fill="#C9A84C"/>
                </svg>
                <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{activeSquare.name_en}</span>
              </div>
              <div style={{ color: "#C9A84C", fontSize: 13, fontFamily: "Vazirmatn, Arial, sans-serif", direction: "rtl" }}>{activeSquare.name_fa}</div>
            </div>
            <button onClick={() => setActiveSquare(null)} style={{ color: "#C9A84C", background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, flexShrink: 0, padding: "0 2px" }}>×</button>
          </div>

          <div style={{ overflowY: "auto", padding: "14px 16px", flex: 1 }}>
            {/* Descriptions */}
            {activeSquare.description_en && (
              <p style={{ fontSize: 13, color: "#555", marginBottom: 8, lineHeight: 1.5 }}>{activeSquare.description_en}</p>
            )}
            {activeSquare.description_fa && (
              <p style={{ fontSize: 13, color: "#555", marginBottom: 12, lineHeight: 1.6, direction: "rtl", textAlign: "right", fontFamily: "Vazirmatn, Arial, sans-serif" }}>{activeSquare.description_fa}</p>
            )}

            {/* Links grouped by category */}
            {activeSquare.links.length === 0
              ? <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", padding: "16px 0" }}>No links yet.</p>
              : (() => {
                  const grouped: Record<string, typeof activeSquare.links> = {};
                  activeSquare.links.forEach((l) => {
                    if (!grouped[l.category]) grouped[l.category] = [];
                    grouped[l.category].push(l);
                  });
                  return Object.entries(grouped).map(([cat, links]) => {
                    const meta = SQUARE_LINK_CATEGORIES.find((c) => c.slug === cat);
                    return (
                      <div key={cat} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#1B3A6B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, borderBottom: "1px solid #eef0f8", paddingBottom: 4 }}>
                          {meta?.label_en ?? cat}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {links.map((l) => (
                            <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                              style={{ display: "flex", flexDirection: "column", padding: "8px 10px", borderRadius: 10, border: "1px solid #e8eaf6", textDecoration: "none", background: "#f8f9ff", transition: "border-color 0.15s" }}
                              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e8eaf6")}
                            >
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#1B3A6B" }}>{l.title_en}</span>
                              {l.title_fa && <span style={{ fontSize: 12, color: "#888", direction: "rtl", textAlign: "right", fontFamily: "Vazirmatn, Arial, sans-serif", marginTop: 2 }}>{l.title_fa}</span>}
                              <span style={{ fontSize: 10, color: "#C9A84C", marginTop: 3, fontWeight: 600 }}>↗ Visit</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()
            }
          </div>
        </div>
      )}

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

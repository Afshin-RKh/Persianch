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
};

const COUNTRY_COORDS: Record<string, { center: [number, number]; zoom: number }> = {
  Switzerland:    { center: [46.8182, 8.2275],  zoom: 8  },
  Germany:        { center: [51.1657, 10.4515], zoom: 6  },
  Austria:        { center: [47.5162, 14.5501], zoom: 7  },
  France:         { center: [46.2276, 2.2137],  zoom: 6  },
  "United Kingdom":{ center: [55.3781, -3.4360], zoom: 5 },
  Netherlands:    { center: [52.1326, 5.2913],  zoom: 7  },
  Sweden:         { center: [60.1282, 18.6435], zoom: 5  },
  Norway:         { center: [60.4720, 8.4689],  zoom: 5  },
  Denmark:        { center: [56.2639, 9.5018],  zoom: 6  },
  Belgium:        { center: [50.5039, 4.4699],  zoom: 7  },
  Italy:          { center: [41.8719, 12.5674], zoom: 6  },
  Spain:          { center: [40.4637, -3.7492], zoom: 6  },
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

      // Beating heart on Iran
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

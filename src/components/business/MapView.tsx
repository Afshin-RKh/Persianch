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
        minZoom: 7,
        maxZoom: 19,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
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

        const divIcon = L.divIcon({
          html: `<div style="
            font-size: 20px;
            background: white;
            border: 2.5px solid #8B1A1A;
            border-radius: 50%;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s;
          " onmouseover="this.style.transform='scale(1.25)';this.style.boxShadow='0 6px 16px rgba(139,26,26,0.4)'"
             onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 3px 8px rgba(0,0,0,0.25)'"
          >${icon}</div>`,
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
    } else if (!focusCountry && !focusCanton) {
      mapInstanceRef.current.flyTo(DEFAULT_CENTER, 8, { duration: 1 });
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
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </>
  );
}

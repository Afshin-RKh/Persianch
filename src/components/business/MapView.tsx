"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Business, CATEGORIES } from "@/types";

const CITY_COORDS: Record<string, [number, number]> = {
  Zurich: [47.3769, 8.5417],
  Geneva: [46.2044, 6.1432],
  Basel: [47.5596, 7.5886],
  Bern: [46.9481, 7.4474],
  Lausanne: [46.5197, 6.6323],
  Lucerne: [47.0502, 8.3093],
  Winterthur: [47.5, 8.7241],
  "St. Gallen": [47.4245, 9.3767],
  Lugano: [46.0037, 8.9511],
  Biel: [47.1368, 7.2467],
};

const DEFAULT_CENTER: [number, number] = [46.8182, 8.2275];

interface Props {
  businesses: Business[];
  onSelect: (business: Business) => void;
  selected: Business | null;
}

export default function MapView({ businesses, onSelect, selected }: Props) {
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
        const lat = business.lat ?? CITY_COORDS[business.city]?.[0];
        const lng = business.lng ?? CITY_COORDS[business.city]?.[1];
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
            <div style="font-size:11px;color:#888;margin-top:2px;">📍 ${business.city}</div>
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

  useEffect(() => {
    if (!mapInstanceRef.current || !selected) return;
    const lat = selected.lat ?? CITY_COORDS[selected.city]?.[0];
    const lng = selected.lng ?? CITY_COORDS[selected.city]?.[1];
    if (lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [selected]);

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

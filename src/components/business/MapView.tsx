"use client";
import { useEffect, useRef } from "react";
import { Business, CATEGORIES } from "@/types";

// Swiss city center coordinates as fallback
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

const DEFAULT_CENTER: [number, number] = [46.8182, 8.2275]; // Switzerland center

interface Props {
  businesses: Business[];
  onSelect: (business: Business) => void;
  selected: Business | null;
}

export default function MapView({ businesses, onSelect, selected }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon path issue with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: 8,
        zoomControl: true,
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
      // Clear old markers
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
            font-size: 22px;
            background: white;
            border: 2px solid #8B1A1A;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.15s;
          ">${icon}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([lat, lng], { icon: divIcon })
          .addTo(mapInstanceRef.current!)
          .on("click", () => onSelect(business));

        markersRef.current.push(marker);
      });
    });
  }, [businesses, onSelect]);

  // Pan to selected business
  useEffect(() => {
    if (!mapInstanceRef.current || !selected) return;
    const lat = selected.lat ?? CITY_COORDS[selected.city]?.[0];
    const lng = selected.lng ?? CITY_COORDS[selected.city]?.[1];
    if (lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 0.8 });
    }
  }, [selected]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </>
  );
}

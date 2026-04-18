"use client";
import { useEffect, useRef } from "react";
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
};

interface Props {
  business: Business;
}

export default function BusinessMap({ business }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);

  const cityKey = business.canton ?? "";
  const lat = business.lat ?? CITY_COORDS[cityKey]?.[0];
  const lng = business.lng ?? CITY_COORDS[cityKey]?.[1];

  // Build Google Maps directions URL
  const directionsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : business.google_maps_url
    ? business.google_maps_url
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + " " + (business.address ?? ""))}`;

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const category = CATEGORIES.find((c) => c.slug === business.category);
      const icon = category?.icon ?? "🏪";

      const divIcon = L.divIcon({
        html: `<div style="
          font-size: 22px;
          background: white;
          border: 3px solid #8B1A1A;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(139,26,26,0.35);
        ">${icon}</div>`,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([lat, lng], { icon: divIcon })
        .addTo(map)
        .bindPopup(`<strong>${business.name}</strong>${business.address ? `<br/><span style="font-size:12px;color:#666">${business.address}</span>` : ""}`, {
          offset: [0, -24],
        })
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, business]);

  if (!lat || !lng) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: 260 }} className="w-full" />
      <div className="p-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 truncate">
          📍 {business.address ? `${business.address}` : business.canton}
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#8B1A1A" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Get Directions
        </a>
      </div>
    </div>
  );
}

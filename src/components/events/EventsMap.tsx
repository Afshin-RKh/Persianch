"use client";
import { useEffect, useRef, useState } from "react";
import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";

interface Props {
  events: EventRow[];
  userLocation?: [number, number] | null;
  onSelectEvent: (ev: EventRow) => void;
}

export default function EventsMap({ events, userLocation, onSelectEvent }: Props) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef     = useRef<import("leaflet").Marker[]>([]);
  const userMarkerRef  = useRef<import("leaflet").Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: [48, 15], zoom: 4, minZoom: 2, maxZoom: 19 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      if (!document.getElementById("heartbeat-style")) {
        const s = document.createElement("style");
        s.id = "heartbeat-style";
        s.textContent = `@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}}`;
        document.head.appendChild(s);
      }
      const heartIcon = L.divIcon({
        html: `<div style="font-size:96px;line-height:1;animation:heartbeat 1s ease-in-out infinite;transform-origin:center;filter:drop-shadow(0 0 8px rgba(180,0,0,0.4));">❤️</div>`,
        className: "", iconSize: [120, 120], iconAnchor: [60, 60],
      });
      L.marker([32.4279, 53.6880], { icon: heartIcon, interactive: false, zIndexOffset: -1000 }).addTo(map);

      fetch("https://ipapi.co/json/").then((r) => r.json())
        .then((d) => { if (d.latitude && d.longitude) map.flyTo([d.latitude, d.longitude], 10, { duration: 1.5 }); })
        .catch(() => {});

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => map.invalidateSize(), 150); };
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

  // Update event markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      events.forEach((ev) => {
        if (ev.lat == null || ev.lng == null) return;
        const meta = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
        const icon = L.divIcon({
          html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${meta.icon}</div>`,
          className: "", iconSize: [36, 36], iconAnchor: [18, 18],
        });
        const marker = L.marker([ev.lat, ev.lng], { icon })
          .addTo(mapInstanceRef.current!)
          .bindTooltip(
            `<strong>${ev.title}</strong><br/>${[ev.venue, ev.city, ev.country].filter(Boolean).join(", ")}`,
            { className: "persian-hub-tooltip", direction: "top" }
          )
          .on("click", () => { window.location.href = `/events/detail?id=${ev.id}`; });
        markersRef.current.push(marker);
      });
    });
  }, [events, onSelectEvent, mapReady]);

  // User location pulsing marker
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
            width:16px;height:16px;border-radius:50%;background:#4A90D9;
            border:3px solid #1B3A6B;box-shadow:0 0 6px 2px rgba(74,144,217,0.8);
            animation:user-glow 1.8s ease-in-out infinite;position:relative;
          }
          .user-location-dot::after {
            content:'';position:absolute;top:0;left:0;width:100%;height:100%;
            border-radius:50%;background:rgba(74,144,217,0.5);
            animation:user-pulse 1.8s ease-out infinite;
          }
        `;
        document.head.appendChild(s);
      }

      const icon = L.divIcon({
        html: `<div class="user-location-dot"></div>`,
        className: "", iconSize: [16, 16], iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker(userLocation, { icon, zIndexOffset: 9999, interactive: false })
        .addTo(mapInstanceRef.current!);
      mapInstanceRef.current!.flyTo(userLocation, 13, { duration: 1.2 });
    });
  }, [userLocation]);

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
        .persian-hub-tooltip::before { border-top-color: #e8d5b0 !important; }
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

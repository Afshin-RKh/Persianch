"use client";
import { useEffect, useRef } from "react";
import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";
import { CANTON_COORDS, COUNTRY_COORDS } from "@/lib/mapCoords";

interface Props {
  events: EventRow[];
  userLocation?: [number, number] | null;
  onSelectEvent: (ev: EventRow) => void;
  focusCountry?: string;
  focusRegion?: string;
}

export default function EventsMap({ events, userLocation, onSelectEvent, focusCountry, focusRegion }: Props) {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef    = useRef<import("leaflet").Marker[]>([]);
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null);

  // Init map — identical pattern to MapView
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: [48, 15], zoom: 3, minZoom: 2, maxZoom: 19, zoomControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

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

      import("@/lib/ipLocation").then(({ getIPLocation }) =>
        getIPLocation().then((loc) => { if (loc) map.flyTo(loc, 10, { duration: 1.5 }); })
      ).catch(() => {});

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

  // Update event markers — same pattern as MapView's business markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const groups = new Map<string, typeof events>();
      events.forEach((ev) => {
        if (ev.lat == null || ev.lng == null) return;
        const key = `${ev.lat.toFixed(4)},${ev.lng.toFixed(4)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(ev);
      });

      const SPREAD = 0.0006;
      groups.forEach((group) => {
        group.forEach((ev, i) => {
          let lat = ev.lat!;
          let lng = ev.lng!;
          if (group.length > 1) {
            const angle = (2 * Math.PI * i) / group.length;
            lat += Math.sin(angle) * SPREAD;
            lng += Math.cos(angle) * SPREAD;
          }

          const meta    = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
          const pending = ev.status === "pending";
          const icon = L.divIcon({
            html: pending
              ? `<div style="font-size:24px;line-height:1;background:#fefce8;border:2.5px solid #eab308;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(234,179,8,0.4));">${meta.icon}</div>`
              : `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${meta.icon}</div>`,
            className: "", iconSize: [36, 36], iconAnchor: [18, 18],
          });

          const dateStr = new Date(ev.next_occurrence ?? ev.start_date).toLocaleDateString("en-GB", {
            weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          });

          const pendingBadge = pending ? `<br/><span style="color:#B45309;font-size:11px;font-weight:600;">⏳ Pending approval</span>` : "";
          const marker = L.marker([lat, lng], { icon })
            .addTo(mapInstanceRef.current!)
            .bindTooltip(
              `<strong>${ev.title}</strong>${pendingBadge}<br/><span style="color:#6b7280;font-size:12px;">📅 ${dateStr}</span>`,
              { className: "persian-hub-tooltip", direction: "top" }
            )
            .on("click", () => onSelectEvent(ev));
          markersRef.current.push(marker);
        });
      });
    });
  }, [events, onSelectEvent]);

  // User location pulsing marker
  useEffect(() => {
    if (!userLocation || !mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      if (!document.getElementById("user-location-style")) {
        const s = document.createElement("style");
        s.id = "user-location-style";
        s.textContent = `
          @keyframes user-pulse { 0% { transform:scale(1);opacity:1; } 70% { transform:scale(2.8);opacity:0; } 100% { transform:scale(1);opacity:0; } }
          @keyframes user-glow { 0%,100% { box-shadow:0 0 6px 2px rgba(74,144,217,0.8); } 50% { box-shadow:0 0 18px 6px rgba(74,144,217,1); } }
          .user-location-dot { width:16px;height:16px;border-radius:50%;background:#4A90D9;border:3px solid #1B3A6B;box-shadow:0 0 6px 2px rgba(74,144,217,0.8);animation:user-glow 1.8s ease-in-out infinite;position:relative; }
          .user-location-dot::after { content:'';position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;background:rgba(74,144,217,0.5);animation:user-pulse 1.8s ease-out infinite; }
        `;
        document.head.appendChild(s);
      }
      const icon = L.divIcon({ html: `<div class="user-location-dot"></div>`, className: "", iconSize: [16, 16], iconAnchor: [8, 8] });
      userMarkerRef.current = L.marker(userLocation, { icon, zIndexOffset: 9999, interactive: false }).addTo(mapInstanceRef.current!);
      mapInstanceRef.current!.flyTo(userLocation, 13, { duration: 1.2 });
    });
  }, [userLocation]);

  // Fly to country/region — identical pattern to MapView
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (focusRegion && CANTON_COORDS[focusRegion]) {
      const [lat, lng] = CANTON_COORDS[focusRegion];
      mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1 });
    } else if (focusCountry && COUNTRY_COORDS[focusCountry]) {
      const { center, zoom } = COUNTRY_COORDS[focusCountry];
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [focusCountry, focusRegion]);

  const handleLocate = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        import("leaflet").then((L) => {
          if (userMarkerRef.current) userMarkerRef.current.remove();
          if (!document.getElementById("user-location-style")) {
            const s = document.createElement("style");
            s.id = "user-location-style";
            s.textContent = `
              @keyframes user-pulse { 0% { transform:scale(1);opacity:1; } 70% { transform:scale(2.8);opacity:0; } 100% { transform:scale(1);opacity:0; } }
              @keyframes user-glow { 0%,100% { box-shadow:0 0 6px 2px rgba(74,144,217,0.8); } 50% { box-shadow:0 0 18px 6px rgba(74,144,217,1); } }
              .user-location-dot { width:16px;height:16px;border-radius:50%;background:#4A90D9;border:3px solid #1B3A6B;box-shadow:0 0 6px 2px rgba(74,144,217,0.8);animation:user-glow 1.8s ease-in-out infinite;position:relative; }
              .user-location-dot::after { content:'';position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;background:rgba(74,144,217,0.5);animation:user-pulse 1.8s ease-out infinite; }
            `;
            document.head.appendChild(s);
          }
          const icon = L.divIcon({ html: `<div class="user-location-dot"></div>`, className: "", iconSize: [16, 16], iconAnchor: [8, 8] });
          userMarkerRef.current = L.marker(latlng, { icon, zIndexOffset: 9999, interactive: false }).addTo(mapInstanceRef.current!);
          mapInstanceRef.current!.flyTo(latlng, 13, { duration: 1.2 });
        });
      },
      () => {}
    );
  };

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
      <div className="relative w-full h-full">
        <div ref={mapRef} className="w-full h-full rounded-xl" />
        <div className="absolute bottom-6 right-3 z-[1000] flex flex-col gap-1">
          <button
            onClick={handleLocate}
            className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-[#1B3A6B] hover:bg-gray-50 border border-gray-200"
            title="Find my location"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          </button>
          <div className="h-2" />
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold text-lg border border-gray-200"
            title="Zoom in"
          >+</button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold text-lg border border-gray-200"
            title="Zoom out"
          >−</button>
        </div>
      </div>
    </>
  );
}

"use client";
import { useEffect, useRef } from "react";
import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";
import { CANTON_COORDS, COUNTRY_COORDS } from "@/lib/mapCoords";

interface MapBounds { lat_min: number; lat_max: number; lng_min: number; lng_max: number; }

interface Props {
  events: EventRow[];
  userLocation?: [number, number] | null;
  onSelectEvent: (ev: EventRow) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  focusCountry?: string;
  focusRegion?: string;
}

export default function EventsMap({ events, userLocation, onSelectEvent, onBoundsChange, focusCountry, focusRegion }: Props) {
  const mapRef            = useRef<HTMLDivElement>(null);
  const mapInstanceRef    = useRef<import("leaflet").Map | null>(null);
  const markersRef        = useRef<import("leaflet").Layer[]>([]);
  const userMarkerRef     = useRef<import("leaflet").Marker | null>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; }, [onBoundsChange]);

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

      const fireBounds = (m: import("leaflet").Map) => {
        const b = m.getBounds();
        onBoundsChangeRef.current?.({ lat_min: b.getSouth(), lat_max: b.getNorth(), lng_min: b.getWest(), lng_max: b.getEast() });
      };
      map.on("moveend", () => fireBounds(map));

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
        getIPLocation().then((loc) => {
          if (loc) map.flyTo(loc, 10, { duration: 1.5 });
          else fireBounds(map);
        })
      ).catch(() => fireBounds(map));

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
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      // Clear old markers
      markersRef.current.forEach((m) => mapInstanceRef.current!.removeLayer(m));
      markersRef.current = [];

      // Group events by rounded location
      const groups = new Map<string, EventRow[]>();
      events.forEach((ev) => {
        if (ev.lat == null || ev.lng == null) return;
        const key = `${ev.lat.toFixed(4)},${ev.lng.toFixed(4)}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(ev);
      });

      groups.forEach((group, _key) => {
        const lat = group[0].lat!;
        const lng = group[0].lng!;

        if (group.length === 1) {
          // Single event — simple emoji marker
          const ev = group[0];
          const meta = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
          const pending = ev.status === "pending";
          const icon = L.divIcon({
            html: pending
              ? `<div style="font-size:24px;line-height:1;background:#fefce8;border:2.5px solid #eab308;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(234,179,8,0.4));">${meta.icon}</div>`
              : `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${meta.icon}</div>`,
            className: "", iconSize: [36, 36], iconAnchor: [18, 18],
          });
          const dateStr = new Date(ev.next_occurrence ?? ev.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
          const marker = L.marker([lat, lng], { icon })
            .addTo(mapInstanceRef.current!)
            .bindTooltip(`<strong>${ev.title}</strong><br/><span style="color:#6b7280;font-size:12px;">📅 ${dateStr}</span>`, { className: "persian-hub-tooltip", direction: "top" })
            .on("click", () => { window.location.href = `/events/detail?id=${ev.id}`; });
          markersRef.current.push(marker);
        } else {
          // Multiple events — badge marker with popup list
          const icons = [...new Set(group.map((ev) => (EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other).icon))].slice(0, 2).join("");
          const badgeIcon = L.divIcon({
            html: `<div style="background:#1B3A6B;color:white;border-radius:14px;padding:2px 8px 2px 4px;display:flex;align-items:center;gap:3px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;white-space:nowrap;">
              <span style="font-size:15px;">${icons}</span>${group.length}
            </div>`,
            className: "", iconSize: [54, 28], iconAnchor: [27, 14],
          });

          const popupRows = group.map((ev) => {
            const meta = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
            const dateStr = new Date(ev.next_occurrence ?? ev.start_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
            return `<a href="/events/detail?id=${ev.id}" style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-bottom:1px solid #f3f4f6;text-decoration:none;color:inherit;transition:background 0.15s;" onmouseover="this.style.background='#fef9f0'" onmouseout="this.style.background='transparent'">
              <span style="font-size:20px;flex-shrink:0;line-height:1.2;">${meta.icon}</span>
              <div style="min-width:0;">
                <div style="font-size:12px;font-weight:700;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${ev.title}</div>
                <div style="font-size:11px;color:#6b7280;margin-top:2px;">📅 ${dateStr}</div>
              </div>
            </a>`;
          }).join("");

          const popup = L.popup({ maxWidth: 240, className: "events-group-popup" }).setContent(
            `<div style="font-family:system-ui,sans-serif;margin:-6px -12px;">
              <div style="padding:8px 10px 6px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #f3f4f6;">${group.length} events at this location</div>
              <div style="max-height:180px;overflow-y:auto;overscroll-behavior:contain;mask-image:linear-gradient(to bottom,transparent,black 20px,black calc(100% - 20px),transparent);-webkit-mask-image:linear-gradient(to bottom,transparent,black 20px,black calc(100% - 20px),transparent);">${popupRows}</div>
            </div>`
          );

          const marker = L.marker([lat, lng], { icon: badgeIcon })
            .addTo(mapInstanceRef.current!)
            .bindPopup(popup);
          markersRef.current.push(marker);
        }
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

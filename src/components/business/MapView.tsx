"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Business, CATEGORIES, CitySquare } from "@/types";
import { CANTON_COORDS, COUNTRY_COORDS } from "@/lib/mapCoords";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

// Persian 8-pointed star (Khatam) SVG path â€” centered at 12,12 outer r=9.5 inner r=4
const PERSIAN_STAR_PATH = "M12,2.5 L13.82,7.73 L19.28,5.65 L17.2,11.11 L22.43,12.93 L17.2,14.75 L19.28,20.21 L13.82,18.13 L12,23.37 L10.18,18.13 L4.72,20.21 L6.8,14.75 L1.57,12.93 L6.8,11.11 L4.72,5.65 L10.18,7.73 Z";

const DEFAULT_CENTER: [number, number] = [46.8182, 8.2275];

interface MapBounds {
  lat_min: number; lat_max: number; lng_min: number; lng_max: number;
}

interface Props {
  businesses: Business[];
  onSelect: (business: Business) => void;
  selected: Business | null;
  focusCountry?: string;
  focusCanton?: string;
  userLocation?: [number, number] | null;
  onBoundsChange?: (bounds: MapBounds) => void;
}

export default function MapView({ businesses, onSelect, selected, focusCountry, focusCanton, userLocation, onBoundsChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const squareMarkersRef = useRef<import("leaflet").Marker[]>([]);
  const onBoundsChangeRef = useRef(onBoundsChange);
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; }, [onBoundsChange]);
  const userMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const router = useRouter();
  const [squares, setSquares] = useState<CitySquare[]>([]);

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
        zoomControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Â© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Beating heart on Iran â€” inject keyframes globally then add marker
      if (!document.getElementById("heartbeat-style")) {
        const s = document.createElement("style");
        s.id = "heartbeat-style";
        s.textContent = `@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}}`;
        document.head.appendChild(s);
      }
      const heartIcon = L.divIcon({
        html: `<div style="font-size:96px;line-height:1;animation:heartbeat 1s ease-in-out infinite;transform-origin:center;filter:drop-shadow(0 0 8px rgba(180,0,0,0.4));">â¤ï¸</div>`,
        className: "",
        iconSize: [120, 120],
        iconAnchor: [60, 60],
      });
      L.marker([32.4279, 53.6880], { icon: heartIcon, interactive: false, zIndexOffset: -1000 }).addTo(map);

      const fireBounds = (m: import("leaflet").Map) => {
        const b = m.getBounds();
        onBoundsChangeRef.current?.({
          lat_min: b.getSouth(),
          lat_max: b.getNorth(),
          lng_min: b.getWest(),
          lng_max: b.getEast(),
        });
      };

      map.on("moveend", () => fireBounds(map));

      // Detect user location via IP â€” cached so only one request across all maps
      import("@/lib/ipLocation").then(({ getIPLocation }) =>
        getIPLocation().then((loc) => {
          if (loc) map.flyTo(loc, 10, { duration: 1.5 });
          else fireBounds(map);
        })
      ).catch(() => fireBounds(map));

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
        const icon = category?.icon ?? "ðŸª";
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
          >${icon}${!approved ? '<span style="position:absolute;top:-4px;right:-4px;font-size:10px;line-height:1;">âš ï¸</span>' : ''}</div>`,
          className: "",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        // Tooltip: shows on hover
        const tooltipHtml = `<div style="font-family:Arial,sans-serif;font-weight:700;font-size:13px;color:#1a0a0a;white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;">${business.name}</div>`;

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
            width:57px; height:57px;
            background: #1B3A6B;
            border: 2.5px solid #C9A84C;
            border-radius: 50%;
            display:flex; flex-direction:column;
            align-items:center; justify-content:center;
            box-shadow: 0 4px 14px rgba(27,58,107,0.45);
            cursor:pointer;
            transition: transform 0.15s, box-shadow 0.15s;
            gap:2px;
          "
          onmouseover="this.style.transform='scale(1.12)';this.style.boxShadow='0 6px 20px rgba(27,58,107,0.65)'"
          onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 14px rgba(27,58,107,0.45)'"
          >${starSvg}<span style="color:#C9A84C;font-size:7px;font-weight:700;font-family:Arial,sans-serif;line-height:1;text-align:center;padding:0 4px;white-space:nowrap;max-width:52px;overflow:hidden;text-overflow:ellipsis;">${sq.city}</span></div>`,
          className: "",
          iconSize: [57, 57],
          iconAnchor: [28, 28],
        });

        const tooltipHtml = `
          <div style="font-family:Arial,sans-serif;min-width:160px;max-width:220px;">
            <div style="font-weight:700;font-size:13px;color:#1B3A6B;margin-bottom:2px;">${sq.name_en}</div>
            <div style="font-size:12px;color:#888;margin-bottom:4px;">${sq.name_fa}</div>
            <div style="font-size:11px;color:#C9A84C;font-weight:600;">${sq.links.length} link${sq.links.length !== 1 ? "s" : ""} Â· Click to explore â†’</div>
          </div>`;

        const marker = L.marker([sq.lat, sq.lng], { icon: divIcon, zIndexOffset: 1000 })
          .addTo(mapInstanceRef.current!)
          .bindTooltip(tooltipHtml, { direction: "top", offset: [0, -36], opacity: 1, className: "persian-hub-tooltip" })
          .on("click", () => router.push(`/squares?id=${sq.id}`));

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

  // User location â€” animated pulsing marker above all others
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
          >âˆ’</button>
        </div>
      </div>
    </>
  );
}

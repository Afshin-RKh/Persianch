"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Business, CATEGORIES } from "@/types";
import { getBusinesses } from "@/lib/api";
import { businessSlug } from "@/lib/businessSlug";
import { useAuth } from "@/lib/auth";

const FALLBACK_CENTER: [number, number] = [48.8566, 2.3522]; // Paris as world fallback
const FALLBACK_ZOOM = 5;

export default function HomeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const router = useRouter();
  const { token } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all businesses with coordinates — admins get unapproved too
  useEffect(() => {
    if (token === undefined) return;
    getBusinesses({ token: token ?? undefined }).then((all) => {
      setBusinesses(all.filter((b) => b.lat && b.lng));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

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

      const map = L.map(mapRef.current!, {
        center: FALLBACK_CENTER,
        zoom: FALLBACK_ZOOM,
        minZoom: 2,
        maxZoom: 19,
        zoomControl: true,
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
        html: `<div style="font-size:96px;line-height:1;animation:heartbeat 1s ease-in-out infinite;transform-origin:center;filter:drop-shadow(0 0 8px rgba(180,0,0,0.4));">❤️</div>`,
        className: "",
        iconSize: [120, 120],
        iconAnchor: [60, 60],
      });
      L.marker([32.4279, 53.6880], { icon: heartIcon, interactive: false, zIndexOffset: -1000 }).addTo(map);

      // Detect user location via IP
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((data) => {
          if (data.latitude && data.longitude) {
            map.flyTo([data.latitude, data.longitude], 10, { duration: 1.5 });
          }
        })
        .catch(() => {});
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers when businesses load
  useEffect(() => {
    if (!mapInstanceRef.current || businesses.length === 0) return;

    import("leaflet").then((L) => {
      businesses.forEach((business) => {
        const lat = business.lat!;
        const lng = business.lng!;
        const category = CATEGORIES.find((c) => c.slug === business.category);
        const icon = category?.icon ?? "🏪";

        const approved = business.is_approved !== false;
        const divIcon = L.divIcon({
          html: `<div style="
            font-size: 18px;
            background: ${approved ? "white" : "#fefce8"};
            border: 2.5px solid ${approved ? "#8B1A1A" : "#eab308"};
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            cursor: pointer;
            position: relative;
          " onmouseover="this.style.transform='scale(1.25)'"
             onmouseout="this.style.transform='scale(1)'"
          >${icon}${!approved ? '<span style="position:absolute;top:-4px;right:-4px;font-size:10px;line-height:1;">⚠️</span>' : ''}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const tooltipHtml = `<div style="font-family:Arial,sans-serif;font-weight:700;font-size:13px;color:#1a0a0a;white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;">${business.name}</div>`;

        L.marker([lat, lng], { icon: divIcon })
          .addTo(mapInstanceRef.current!)
          .bindTooltip(tooltipHtml, {
            direction: "top",
            offset: [0, -20],
            opacity: 1,
            className: "persian-hub-tooltip",
          })
          .on("click", () => {
            router.push(`/businesses/detail?slug=${businessSlug(business)}`);
          });
      });
    });
  }, [businesses, router]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>{`
        .persian-hub-tooltip {
          background: white !important;
          border: 1.5px solid #e8d5b0 !important;
          border-radius: 10px !important;
          padding: 5px 10px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
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
      <div className="relative w-full" style={{ height: "480px" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50 rounded-2xl">
            <div className="text-gray-400 text-sm">Loading map…</div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full rounded-2xl" />
      </div>
    </>
  );
}

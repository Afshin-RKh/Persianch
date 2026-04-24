"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Business, CATEGORIES } from "@/types";
import { getBusinesses } from "@/lib/api";

const FALLBACK_CENTER: [number, number] = [48.8566, 2.3522];
const FALLBACK_ZOOM = 5;

export default function HomeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBusinesses({}).then((all) => {
      setBusinesses(all.filter((b) => b.lat && b.lng));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    Promise.all([
      import("leaflet"),
      import("leaflet.markercluster"),
    ]).then(([L]) => {
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

      const cluster = (L as any).markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (c: any) => {
          const count = c.getChildCount();
          return L.divIcon({
            html: `<div style="
              background: #8B1A1A;
              color: white;
              border-radius: 50%;
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              font-weight: 700;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">${count}</div>`,
            className: "",
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
        },
      });

      map.addLayer(cluster);
      mapInstanceRef.current = map;
      clusterGroupRef.current = cluster;

      fetch("https://ip-api.com/json/")
        .then((r) => r.json())
        .then((data) => {
          if (data.lat && data.lon) {
            map.flyTo([data.lat, data.lon], 10, { duration: 1.5 });
          }
        })
        .catch(() => {});
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        clusterGroupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!clusterGroupRef.current || businesses.length === 0) return;

    import("leaflet").then((L) => {
      const cluster = clusterGroupRef.current;
      cluster.clearLayers();

      businesses.forEach((business) => {
        const lat = business.lat!;
        const lng = business.lng!;
        const category = CATEGORIES.find((c) => c.slug === business.category);
        const icon = category?.icon ?? "🏪";

        const divIcon = L.divIcon({
          html: `<div style="
            font-size: 18px;
            background: white;
            border: 2.5px solid #8B1A1A;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            cursor: pointer;
          " onmouseover="this.style.transform='scale(1.25)'"
             onmouseout="this.style.transform='scale(1)'"
          >${icon}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const tooltipHtml = `
          <div style="font-family:Arial,sans-serif;min-width:140px;max-width:200px;">
            <div style="font-weight:700;font-size:13px;color:#1a0a0a;margin-bottom:2px;">${business.name}</div>
            <div style="font-size:11px;color:#8B1A1A;font-weight:600;">${icon} ${category?.label_en ?? ""}</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">📍 ${business.canton ?? ""}</div>
            <div style="font-size:11px;color:#C9A84C;margin-top:4px;font-weight:600;">Click to view →</div>
          </div>`;

        const marker = L.marker([lat, lng], { icon: divIcon })
          .bindTooltip(tooltipHtml, {
            direction: "top",
            offset: [0, -20],
            opacity: 1,
            className: "persian-hub-tooltip",
          })
          .on("click", () => {
            router.push(`/businesses/detail?id=${business.id}`);
          });

        cluster.addLayer(marker);
      });
    });
  }, [businesses, router]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
      <style>{`
        .persian-hub-tooltip {
          background: white !important;
          border: 1.5px solid #e8d5b0 !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .persian-hub-tooltip::before { border-top-color: #e8d5b0 !important; }
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

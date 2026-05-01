"use client";
import { useEffect, useState, useCallback, useRef, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/business/SearchBar";
import { getBusinesses } from "@/lib/api";
import { CATEGORIES, Category, Business } from "@/types";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const MapView = lazy(() => import("@/components/business/MapView"));

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const { token, isAdmin, loading: authLoading } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<Business | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [canton, setCanton] = useState(searchParams.get("canton") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const boundsRef = useRef<{ lat_min: number; lat_max: number; lng_min: number; lng_max: number } | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchForBounds = useCallback((bounds: typeof boundsRef.current) => {
    if (!bounds || authLoading) return;
    getBusinesses({
      token: token ?? undefined,
      bounds,
      ...(category ? { category: category as Category } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }).then(setBusinesses).catch(() => {});
  }, [authLoading, token, category, search]);

  const handleBoundsChange = useCallback((bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => {
    // Round to 2 decimal places (~1km) so small pans reuse the browser-cached response
    const rounded = {
      lat_min: Math.floor(bounds.lat_min * 100) / 100,
      lat_max: Math.ceil(bounds.lat_max  * 100) / 100,
      lng_min: Math.floor(bounds.lng_min * 100) / 100,
      lng_max: Math.ceil(bounds.lng_max  * 100) / 100,
    };
    boundsRef.current = rounded;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => fetchForBounds(rounded), 300);
  }, [fetchForBounds]);

  useEffect(() => {
    if (authLoading || !boundsRef.current) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => fetchForBounds(boundsRef.current), 300);
  }, [authLoading, token, category, search, fetchForBounds]);

  const handleSelect = useCallback((b: Business) => {
    setSelected(b);
    // Bounds query returns minimal fields; fetch full details for the card
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api"}/businesses.php?id=${b.id}`, { headers })
      .then((r) => r.json())
      .then((full) => { if (full) setSelected(full); })
      .catch(() => {});
  }, [token]);

  const activePill = "text-white font-medium text-xs px-3 py-1.5 rounded-full shadow-sm";
  const inactivePill = "font-medium text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm text-gray-700 hover:bg-gray-50"
    + " bg-white border border-gray-200";

  return (
    <div className="relative" style={{ height: "calc(100vh - 64px)" }}>
      <h1 className="sr-only">Iranian Businesses Worldwide — BiruniMap</h1>

      {/* Map — fills entire container */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <p>Loading map...</p>
        </div>
      }>
        <MapView
          businesses={businesses}
          onSelect={handleSelect}
          selected={selected}
          focusCountry={country}
          focusCanton={canton}
          userLocation={null}
          onBoundsChange={handleBoundsChange}
        />
      </Suspense>

      {/* Floating search + categories overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar
            all={businesses}
            search={search}
            country={country}
            canton={canton}
            onSearchChange={setSearch}
            onCountryChange={setCountry}
            onCantonChange={setCanton}
          />
        </div>
        <div className="pointer-events-auto">
          <div
            className="flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", maskImage: "linear-gradient(to left, transparent, black 48px)", WebkitMaskImage: "linear-gradient(to left, transparent, black 48px)" }}
          >
            <button
              onClick={() => setCategory("")}
              className={`flex-shrink-0 ${!category ? activePill : inactivePill}`}
              style={!category ? { backgroundColor: "#8B1A1A" } : {}}
            >
              All
            </button>
            {CATEGORIES.filter((cat) => !["kitchen", "school", "carpet", "airbnb", "tour"].includes(cat.slug)).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug === category ? "" : cat.slug)}
                className={`flex-shrink-0 ${category === cat.slug ? activePill : inactivePill}`}
                style={category === cat.slug ? { backgroundColor: "#8B1A1A" } : {}}
              >
                {cat.icon} {cat.label_en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected business card */}
      {selected && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[1000]">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >×</button>
          <p className="text-sm font-bold text-gray-900 pr-4">{selected.name}</p>
          {selected.name_fa && (
            <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{selected.name_fa}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{selected.address || selected.canton}</p>
          <Link
            href={`/businesses/detail?id=${selected.id}`}
            className="mt-3 block text-center text-white text-xs font-semibold py-2 rounded-xl"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            View Details →
          </Link>
        </div>
      )}
    </div>
  );
}

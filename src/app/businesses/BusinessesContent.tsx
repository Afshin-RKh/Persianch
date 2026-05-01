"use client";
import { useEffect, useState, useCallback, useRef, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import { businessSlug } from "@/lib/businessSlug";
import SearchBar from "@/components/business/SearchBar";
import { getBusinesses } from "@/lib/api";
import { CATEGORIES, Category, Business } from "@/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const MapView = lazy(() => import("@/components/business/MapView"));

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const { token, isAdmin, loading: authLoading } = useAuth();
  const { error: toastError } = useToast();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected]     = useState<Business | null>(null);
  const [fetching, setFetching]     = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [search, setSearch]   = useState(searchParams.get("search")   ?? "");
  const [country, setCountry] = useState(searchParams.get("country")  ?? "");
  const [canton, setCanton]   = useState(searchParams.get("canton")   ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const boundsRef     = useRef<{ lat_min: number; lat_max: number; lng_min: number; lng_max: number } | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchForBounds = useCallback((bounds: typeof boundsRef.current) => {
    if (!bounds || authLoading) return;
    setFetching(true);
    getBusinesses({
      token: token ?? undefined,
      bounds,
      ...(category ? { category: category as Category } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    })
      .then((data) => { setBusinesses(data); setHasFetched(true); })
      .catch(() => toastError("Failed to load businesses. Please try again."))
      .finally(() => setFetching(false));
  }, [authLoading, token, category, search, toastError]);

  const handleBoundsChange = useCallback((bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => {
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
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api"}/businesses.php?id=${b.id}`, { headers })
      .then((r) => r.json())
      .then((full) => { if (full) setSelected(full); })
      .catch(() => {});
  }, [token]);

  const activePill   = "text-white font-medium text-xs px-3 py-1.5 rounded-full shadow-sm flex-shrink-0";
  const inactivePill = "font-medium text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm text-gray-700 hover:bg-gray-50 bg-white border border-gray-200 flex-shrink-0";

  return (
    <div className="relative" style={{ height: "calc(100vh - 64px)" }}>
      <h1 className="sr-only">Iranian Businesses Worldwide — BiruniMap</h1>

      {/* Map */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading map…</p>
          </div>
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
        <div className="pointer-events-auto flex items-center gap-2">
          <div
            className="flex gap-2 overflow-x-auto flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", maskImage: "linear-gradient(to left, transparent, black 48px)", WebkitMaskImage: "linear-gradient(to left, transparent, black 48px)" }}
          >
            <button
              onClick={() => setCategory("")}
              aria-label="Show all categories"
              aria-pressed={!category}
              className={!category ? activePill : inactivePill}
              style={!category ? { backgroundColor: "#8B1A1A" } : {}}
            >
              All
            </button>
            {CATEGORIES.filter((cat) => !["kitchen", "school", "carpet", "airbnb", "tour"].includes(cat.slug)).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug === category ? "" : cat.slug)}
                aria-label={`Filter by ${cat.label_en}`}
                aria-pressed={category === cat.slug}
                className={category === cat.slug ? activePill : inactivePill}
                style={category === cat.slug ? { backgroundColor: "#8B1A1A" } : {}}
              >
                {cat.icon} {cat.label_en}
              </button>
            ))}
          </div>

          {/* Count / fetching indicator */}
          <div className="flex-shrink-0">
            {fetching ? (
              <div className="bg-white rounded-full shadow-sm border border-gray-200 p-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : hasFetched && businesses.length > 0 ? (
              <div className="bg-white rounded-full shadow-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600">
                {businesses.length} found
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {hasFetched && !fetching && businesses.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 text-center max-w-xs">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-sm font-semibold text-gray-700">No businesses in this area yet</p>
            <p className="text-xs text-gray-400 mt-1">
              {search || category ? "Try clearing your filters or zooming out." : "Pan or zoom out to explore more."}
            </p>
          </div>
        </div>
      )}

      {/* Selected business card */}
      {selected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-xs bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[1000] animate-slide-up">
          <button
            onClick={() => setSelected(null)}
            aria-label="Close business card"
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
          >
            ×
          </button>
          <p className="text-sm font-bold text-gray-900 pr-6 line-clamp-1">{selected.name}</p>
          {selected.name_fa && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1" dir="rtl">{selected.name_fa}</p>
          )}
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{selected.address || selected.canton}</p>
          <Link
            href={`/businesses/detail?slug=${businessSlug(selected)}`}
            className="mt-3 block text-center text-white text-xs font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            View Details →
          </Link>
        </div>
      )}
    </div>
  );
}

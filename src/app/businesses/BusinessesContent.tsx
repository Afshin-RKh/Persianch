"use client";
import { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import BusinessCard from "@/components/business/BusinessCard";
import SearchBar from "@/components/business/SearchBar";
import { getBusinesses } from "@/lib/api";
import { CATEGORIES, Category, Business } from "@/types";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const MapView = lazy(() => import("@/components/business/MapView"));

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const { token, isAdmin, loading: authLoading } = useAuth();

  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Business | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [canton, setCanton] = useState(searchParams.get("canton") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve so the token is ready
    setLoading(true);
    getBusinesses({ token: token ?? undefined })
      .then(setAllBusinesses)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [authLoading, token]);

  const businesses = useMemo(() => {
    return allBusinesses.filter((b) => {
      if (category && b.category !== category) return false;
      if (country && b.country !== country) return false;
      if (canton && b.canton !== canton) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const catMeta = CATEGORIES.find((c) => c.slug === b.category);
        return (
          b.name.toLowerCase().includes(q) ||
          (b.name_fa && b.name_fa.includes(search.trim())) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (catMeta && catMeta.label_en.toLowerCase().includes(q)) ||
          (catMeta && catMeta.label_fa.includes(search.trim()))
        );
      }
      return true;
    });
  }, [allBusinesses, search, country, canton, category]);

  const handleSelect = useCallback((b: Business) => setSelected(b), []);

  const handleFindLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setShowMap(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  }, []);

  const activePill = "text-white font-medium text-xs px-3 py-1.5 rounded-full";
  const inactivePill = "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 font-medium text-xs px-3 py-1.5 rounded-full transition-colors";

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <SearchBar
              all={allBusinesses}
              search={search}
              country={country}
              canton={canton}
              onSearchChange={setSearch}
              onCountryChange={setCountry}
              onCantonChange={setCanton}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mb-2">
            <button
              onClick={() => setCategory("")}
              className={!category ? activePill : inactivePill}
              style={!category ? { backgroundColor: "#8B1A1A" } : {}}
            >
              All
            </button>
            {CATEGORIES.filter((cat) => !["kitchen", "school", "carpet", "airbnb", "tour"].includes(cat.slug)).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug === category ? "" : cat.slug)}
                className={category === cat.slug ? activePill : inactivePill}
                style={category === cat.slug ? { backgroundColor: "#8B1A1A" } : {}}
              >
                {cat.icon} {cat.label_en}
              </button>
            ))}
          </div>

          {/* Find My Location button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleFindLocation}
              disabled={locating}
              className="text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors disabled:opacity-60"
              style={{ backgroundColor: userLocation ? "#1B3A6B" : "white", color: userLocation ? "white" : "#1B3A6B", borderColor: "#1B3A6B" }}
            >
              {locating ? "⏳ Locating..." : "📍 Find My Location"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1" style={{ minHeight: "600px" }}>
        {/* Business list */}
        <div className={`overflow-y-auto flex-shrink-0 ${showMap ? "hidden" : "w-full"} bg-[#FDF8F3]`}>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-4">⏳</div>
                <p>Loading businesses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-4">⚠️</p>
                <p>Could not load businesses. Please try again later.</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-medium">No businesses found.</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{businesses.length} businesses found</p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {businesses.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className={`cursor-pointer rounded-2xl transition-all ${selected?.id === b.id ? "outline outline-2 outline-offset-1 outline-[#1B3A6B]" : ""}`}
                    >
                      <BusinessCard business={b} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="flex-1 relative">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Loading map...</p>
              </div>
            }>
              <MapView
                businesses={businesses}
                onSelect={handleSelect}
                selected={selected}
                focusCountry={country}
                focusCanton={canton}
                userLocation={userLocation}
              />
            </Suspense>

            {selected && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[1000]">
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
        )}
      </div>
    </div>
  );
}

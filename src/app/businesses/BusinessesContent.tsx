"use client";
import { useEffect, useState, useCallback, Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import BusinessCard from "@/components/business/BusinessCard";
import SearchBar from "@/components/business/SearchBar";
import { getBusinesses } from "@/lib/api";
import { CATEGORIES, Category, Business } from "@/types";
import Link from "next/link";

const MapView = lazy(() => import("@/components/business/MapView"));

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const canton = searchParams.get("canton") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Business | null>(null);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getBusinesses({ category: category as Category, canton, search })
      .then(setBusinesses)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [category, canton, search]);

  const handleSelect = useCallback((b: Business) => setSelected(b), []);

  const activeCategory = CATEGORIES.find((c) => c.slug === category);

  const activePill = "text-white font-medium text-xs px-3 py-1.5 rounded-full";
  const inactivePill = "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 font-medium text-xs px-3 py-1.5 rounded-full transition-colors";

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Top bar: filters + toggle */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <SearchBar />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mb-2">
            <Link href="/businesses"
              className={!category ? activePill : inactivePill}
              style={!category ? { backgroundColor: "#8B1A1A" } : {}}>
              All
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/businesses?category=${cat.slug}${canton ? `&canton=${canton}` : ""}`}
                className={category === cat.slug ? activePill : inactivePill}
                style={category === cat.slug ? { backgroundColor: "#8B1A1A" } : {}}>
                {cat.icon} {cat.label_en}
              </Link>
            ))}
          </div>

          {/* Map toggle */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowMap((v) => !v)}
              className="text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors flex-shrink-0"
              style={showMap
                ? { backgroundColor: "#8B1A1A", color: "white", borderColor: "#8B1A1A" }
                : { backgroundColor: "white", color: "#8B1A1A", borderColor: "#8B1A1A" }
              }
            >
              {showMap ? "🗺️ Hide Map" : "🗺️ Show Map"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content: list + map */}
      <div className="flex flex-1" style={{ minHeight: "600px" }}>
        {/* Business list (scrollable) */}
        <div className={`overflow-y-auto flex-shrink-0 ${showMap ? "w-full md:w-[420px] lg:w-[480px]" : "w-full"} bg-[#FDF8F3]`}>
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
                <p className="text-sm mt-1">Try a different category or city.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{businesses.length} businesses found</p>
                <div className={`grid gap-4 ${showMap ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                  {businesses.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className={`cursor-pointer rounded-2xl transition-all ${selected?.id === b.id ? "outline outline-2 outline-offset-1 outline-[#8B1A1A]" : ""}`}
                    >
                      <BusinessCard business={b} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Map (sticky right panel) */}
        {showMap && (
          <div className="hidden md:block flex-1 relative">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Loading map...</p>
              </div>
            }>
              <MapView
                businesses={businesses}
                onSelect={handleSelect}
                selected={selected}
              />
            </Suspense>

            {/* Selected business popup */}
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

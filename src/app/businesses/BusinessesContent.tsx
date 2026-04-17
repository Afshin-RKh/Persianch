"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BusinessCard from "@/components/business/BusinessCard";
import SearchBar from "@/components/business/SearchBar";
import { getBusinesses } from "@/lib/api";
import { CATEGORIES, SWISS_CITIES, Category, Business } from "@/types";
import Link from "next/link";

export default function BusinessesContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getBusinesses({ category: category as Category, city, search })
      .then(setBusinesses)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [category, city, search]);

  const activeCategory = CATEGORIES.find((c) => c.slug === category);

  const activePill = "text-white font-medium text-xs px-3 py-1.5 rounded-full";
  const inactivePill = "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 font-medium text-xs px-3 py-1.5 rounded-full transition-colors";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {activeCategory ? `${activeCategory.icon} ${activeCategory.label_en}` : "All Businesses"}
        </h1>
        {activeCategory && (
          <p className="text-gray-500 mt-1" dir="rtl">{activeCategory.label_fa}</p>
        )}
        {search && (
          <p className="text-gray-500 mt-1">Results for: <strong>{search}</strong></p>
        )}
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Link href="/businesses"
          className={!category ? activePill : inactivePill}
          style={!category ? { backgroundColor: "#8B1A1A" } : {}}>
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/businesses?category=${cat.slug}${city ? `&city=${city}` : ""}`}
            className={category === cat.slug ? activePill : inactivePill}
            style={category === cat.slug ? { backgroundColor: "#8B1A1A" } : {}}>
            {cat.icon} {cat.label_en}
          </Link>
        ))}
      </div>

      {/* City filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link href={`/businesses${category ? `?category=${category}` : ""}`}
          className={!city ? activePill : inactivePill}
          style={!city ? { backgroundColor: "#8B1A1A" } : {}}>
          All Cities
        </Link>
        {SWISS_CITIES.map((c) => (
          <Link key={c} href={`/businesses?city=${c}${category ? `&category=${category}` : ""}`}
            className={city === c ? activePill : inactivePill}
            style={city === c ? { backgroundColor: "#8B1A1A" } : {}}>
            {c}
          </Link>
        ))}
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

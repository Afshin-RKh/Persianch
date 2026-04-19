"use client";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import SearchBar from "@/components/business/SearchBar";
import BusinessCard from "@/components/business/BusinessCard";
import { CATEGORIES } from "@/types";
import { getBusinesses } from "@/lib/api";
import type { Business } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  restaurant:   "from-orange-50 to-red-50 border-orange-200",
  cafe:         "from-amber-50 to-yellow-50 border-amber-200",
  hairdresser:  "from-pink-50 to-rose-50 border-pink-200",
  doctor:       "from-blue-50 to-cyan-50 border-blue-200",
  dentist:      "from-sky-50 to-blue-50 border-sky-200",
  lawyer:       "from-slate-50 to-gray-50 border-slate-200",
  accountant:   "from-green-50 to-emerald-50 border-green-200",
  grocery:      "from-lime-50 to-green-50 border-lime-200",
  beauty:       "from-purple-50 to-pink-50 border-purple-200",
  "real-estate":"from-indigo-50 to-blue-50 border-indigo-200",
  other:        "from-gray-50 to-slate-50 border-gray-200",
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Business[]>([]);

  useEffect(() => {
    getBusinesses({ featured: true }).then(setFeatured).catch(() => {});
  }, []);

  return (
    <main>
      {/* Hero */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 50%, #132D55 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center fade-up">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-6xl drop-shadow-lg">🦁</span>
            <div className="text-left">
              <div>
                <span className="font-bold text-4xl sm:text-6xl tracking-tight">Persian</span>
                <span className="font-bold text-4xl sm:text-6xl tracking-tight" style={{ color: "#C9A84C" }}>Hub</span>
              </div>
              <p className="text-sm sm:text-base font-medium opacity-80 tracking-widest uppercase">Europe</p>
            </div>
          </div>

          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
            Discover Persian, Afghan &amp; Tajik restaurants, doctors, lawyers, hairdressers &amp; more across Europe
          </p>

          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div className="h-12" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 mt-12 text-center">
            {[["100+", "Businesses"], ["10", "Cities"], ["11", "Categories"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold" style={{ color: "#C9A84C" }}>{n}</p>
                <p className="text-xs text-blue-200 uppercase tracking-wide mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 gold-underline inline-block">Browse by Category</h2>
            <p className="text-gray-400 text-sm mt-2">What are you looking for?</p>
          </div>
          <Link href="/businesses" className="text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/businesses?category=${cat.slug}`}
              className={`card-hover flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br ${CATEGORY_COLORS[cat.slug]} rounded-2xl border text-center`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700">{cat.label_en}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured businesses */}
      {featured.length > 0 && (
        <section className="py-16 px-4" style={{ backgroundColor: "#FDF8F3", borderTop: "1px solid #e8d5b0" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 gold-underline inline-block">Featured Businesses</h2>
                <p className="text-gray-400 text-sm mt-2">Trusted by the community</p>
              </div>
              <Link href="/businesses?featured=1" className="text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 3).map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 100%)" }}>
        <div className="max-w-2xl mx-auto text-center text-white">
          <span className="text-5xl block mb-6">🏪</span>
          <h2 className="text-3xl font-bold mb-3">Own a Persian, Afghan or Tajik Business in Europe?</h2>
          <p className="text-blue-200 mb-8 text-lg">List your business for free and reach your community across Europe.</p>
          <Link
            href="/get-listed"
            className="inline-block font-bold px-10 py-4 rounded-2xl transition-all hover:opacity-90 hover:scale-105 text-base shadow-lg"
            style={{ backgroundColor: "#8B1A1A", color: "white" }}
          >
            Get Listed — Free
          </Link>
        </div>
      </section>
    </main>
  );
}

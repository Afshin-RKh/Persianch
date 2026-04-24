"use client";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import SearchBar from "@/components/business/SearchBar";
import BusinessCard from "@/components/business/BusinessCard";
import HomeMap from "@/components/business/HomeMap";
import { getBusinesses } from "@/lib/api";
import type { Business } from "@/types";


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
              <p className="text-sm sm:text-base font-medium opacity-80 tracking-widest uppercase">Worldwide</p>
            </div>
          </div>

          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
            Discover Persian &amp; Iranian restaurants, doctors, lawyers, hairdressers &amp; more — worldwide
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

      {/* Map — auto-focused on user location */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 gold-underline inline-block">Businesses Near You</h2>
            <p className="text-gray-400 text-sm mt-2">Map auto-focuses on your location</p>
          </div>
          <Link href="/businesses" className="text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
            Browse all →
          </Link>
        </div>
        <Suspense fallback={<div className="w-full rounded-2xl bg-gray-100" style={{ height: 480 }} />}>
          <HomeMap />
        </Suspense>
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
          <h2 className="text-3xl font-bold mb-3">Own a Persian or Iranian Business?</h2>
          <p className="text-blue-200 mb-8 text-lg">List your business for free and reach the Persian community worldwide.</p>
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

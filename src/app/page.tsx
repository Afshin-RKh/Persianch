"use client";
import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "@/components/business/SearchBar";
import HomeMap from "@/components/business/HomeMap";

export default function HomePage() {
  return (
    <main>
      {/* Hero — compact, map-first */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 50%, #132D55 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl drop-shadow-lg">🗺️</span>
            <div className="text-left">
              <div>
                <span className="font-bold text-4xl sm:text-5xl tracking-tight">Biruni</span>
                <span className="font-bold text-4xl sm:text-5xl tracking-tight" style={{ color: "#C9A84C" }}>Map</span>
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-70 tracking-widest uppercase">Inspired by Al-Biruni · Est. 973 CE</p>
            </div>
          </div>

          <p className="text-base sm:text-lg text-blue-100 mb-2 max-w-2xl mx-auto leading-relaxed">
            The global map of the Iranian diaspora — 3,000+ businesses across every continent, inspired by the Persian polymath who mapped the world.
          </p>
          <p className="text-xs text-blue-300 opacity-70 mb-8 max-w-xl mx-auto italic">
            "Al-Biruni (973–1048) — Persian scholar, geographer and cartographer who charted civilizations across the known world."
          </p>

          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div className="h-12" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10 text-center flex-wrap">
            {[["3,000+", "Businesses"], ["50+", "Countries"], ["11", "Categories"], ["Coming Soon", "Events"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: "#C9A84C" }}>{n}</p>
                <p className="text-xs text-blue-200 uppercase tracking-wide mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map — the core of the product */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 gold-underline inline-block">Explore the Map</h2>
            <p className="text-gray-400 text-sm mt-1">Find Iranian-owned businesses near you — anywhere in the world</p>
          </div>
          <Link href="/businesses" className="text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
            List view →
          </Link>
        </div>
        <Suspense fallback={<div className="w-full rounded-2xl bg-gray-100" style={{ height: 520 }} />}>
          <HomeMap />
        </Suspense>
      </section>

      {/* Why Biruni */}
      <section className="py-16 px-4" style={{ backgroundColor: "#FDF8F3", borderTop: "1px solid #e8d5b0" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-4xl block mb-4">🧭</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Why BiruniMap?</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Abu Rayhan Al-Biruni was a 10th-century Persian genius who mapped civilizations, calculated the Earth&apos;s radius, and documented cultures across the world — centuries before it was possible. BiruniMap carries that same spirit: charting every corner of the globe where Iranians have built a home and a business.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: "🌍", title: "Global Coverage", desc: "From Switzerland to Australia — if there's an Iranian business, it's on the map." },
              { icon: "📍", title: "Map-First", desc: "Explore by location, not just by list. Find what's near you, wherever you are." },
              { icon: "🗓️", title: "Events — Coming Soon", desc: "Persian cultural events, community gatherings and festivals — all in one place." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                <span className="text-3xl block mb-3">{icon}</span>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 100%)" }}>
        <div className="max-w-2xl mx-auto text-center text-white">
          <span className="text-5xl block mb-6">🏪</span>
          <h2 className="text-3xl font-bold mb-3">Own an Iranian Business?</h2>
          <p className="text-blue-200 mb-8 text-lg">Add it to the map for free and get discovered by the global Iranian community.</p>
          <Link
            href="/get-listed"
            className="inline-block font-bold px-10 py-4 rounded-2xl transition-all hover:opacity-90 hover:scale-105 text-base shadow-lg"
            style={{ backgroundColor: "#8B1A1A", color: "white" }}
          >
            Add to the Map — Free
          </Link>
        </div>
      </section>
    </main>
  );
}

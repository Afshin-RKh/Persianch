"use client";
import Link from "next/link";
import { Suspense } from "react";
import HomeMap from "@/components/business/HomeMap";

export default function HomePage() {
  return (
    <main>
      {/* Hero — slim, map-first */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 50%, #132D55 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10 text-center">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-5xl drop-shadow-lg">🗺️</span>
            <div className="text-left">
              <div>
                <span className="font-bold text-4xl sm:text-5xl tracking-tight">Biruni</span>
                <span className="font-bold text-4xl sm:text-5xl tracking-tight" style={{ color: "#C9A84C" }}>Map</span>
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-70 tracking-widest uppercase">Inspired by Al-Biruni · Est. 973 CE</p>
            </div>
          </div>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            The global map of the Iranian diaspora — 3,000+ businesses across every continent, inspired by the Persian polymath who mapped the world.
          </p>
        </div>
      </section>

      {/* Map — visible immediately on load */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
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

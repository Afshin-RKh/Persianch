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
        <div className="flex items-center gap-9 mb-4">
          <Link href="/businesses" className="text-sm font-semibold px-5 py-2 rounded-xl text-white transition-all hover:opacity-90 hover:scale-105" style={{ backgroundColor: "#1B3A6B" }}>
            All Businesses →
          </Link>
          <Link href="/events" className="text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-90 hover:scale-105" style={{ backgroundColor: "#C9A84C", color: "#0D1B2E" }}>
            All Events →
          </Link>
        </div>
        <Suspense fallback={<div className="w-full rounded-2xl bg-gray-100" style={{ height: 520 }} />}>
          <HomeMap />
        </Suspense>
      </section>

    </main>
  );
}

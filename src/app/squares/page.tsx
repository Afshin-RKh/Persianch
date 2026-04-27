"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CitySquare, SQUARE_LINK_CATEGORIES } from "@/types";
import { ExternalLink, ArrowLeft, MapPin } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

const PERSIAN_STAR_PATH = "M12,2.5 L13.82,7.73 L19.28,5.65 L17.2,11.11 L22.43,12.93 L17.2,14.75 L19.28,20.21 L13.82,18.13 L12,23.37 L10.18,18.13 L4.72,20.21 L6.8,14.75 L1.57,12.93 L6.8,11.11 L4.72,5.65 L10.18,7.73 Z";

function SquaresContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [square, setSquare] = useState<CitySquare | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    fetch(`${API}/city_squares.php?id=${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { setNotFound(true); } else { setSquare(data); }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f6fa" }}>
        <p className="text-gray-400 text-sm">Loading…</p>
      </main>
    );
  }

  if (notFound || !square) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f6fa" }}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">Square not found.</p>
          <Link href="/businesses" className="text-sm font-semibold" style={{ color: "#1B3A6B" }}>← Back to map</Link>
        </div>
      </main>
    );
  }

  // Group links by category
  const grouped: Record<string, typeof square.links> = {};
  square.links.forEach((l) => {
    if (!grouped[l.category]) grouped[l.category] = [];
    grouped[l.category].push(l);
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f6fa" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-700">City Square</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero card */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6" style={{ background: "#1B3A6B" }}>
          <div className="px-8 py-10 flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full" style={{ background: "rgba(201,168,76,0.15)", border: "2px solid #C9A84C" }}>
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path d={PERSIAN_STAR_PATH} fill="#C9A84C" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{square.name_en}</h1>
            <p className="text-lg mb-3" style={{ color: "#C9A84C", fontFamily: "Vazirmatn, Arial, sans-serif" }} dir="rtl">{square.name_fa}</p>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              <MapPin size={13} />
              <span>{square.city}, {square.country}</span>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        {(square.description_en || square.description_fa) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 space-y-3">
            {square.description_en && (
              <p className="text-sm text-gray-700 leading-relaxed">{square.description_en}</p>
            )}
            {square.description_fa && (
              <p className="text-sm text-gray-700 leading-relaxed" dir="rtl" style={{ textAlign: "right", fontFamily: "Vazirmatn, Arial, sans-serif" }}>
                {square.description_fa}
              </p>
            )}
          </div>
        )}

        {/* Links */}
        {square.links.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">No links added yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, links]) => {
              const meta = SQUARE_LINK_CATEGORIES.find((c) => c.slug === cat);
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1B3A6B" }}>{meta?.label_en ?? cat}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EEF2FF", color: "#1B3A6B" }}>{meta?.label_fa}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {links.map((l) => (
                      <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="group bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start justify-between gap-3 hover:border-[#C9A84C] transition-colors no-underline">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: "#1B3A6B" }}>{l.title_en}</p>
                          {l.title_fa && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate" dir="rtl" style={{ textAlign: "right", fontFamily: "Vazirmatn, Arial, sans-serif" }}>{l.title_fa}</p>
                          )}
                        </div>
                        <ExternalLink size={14} className="flex-shrink-0 mt-0.5 text-gray-300 group-hover:text-[#C9A84C] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/businesses" className="text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
            ← Back to map
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SquaresPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <SquaresContent />
    </Suspense>
  );
}

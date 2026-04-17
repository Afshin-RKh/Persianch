"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBusinessById } from "@/lib/api";
import { Business, CATEGORIES } from "@/types";
import { MapPin, Phone, Globe, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function BusinessDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getBusinessById(id).then((b) => {
      setBusiness(b);
      setLoading(false);
    });
  }, [id]);

  const category = business ? CATEGORIES.find((c) => c.slug === business.category) : null;

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="text-4xl mb-4">⏳</div>
        <p>Loading...</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-medium">Business not found.</p>
        <Link href="/businesses" className="hover:underline mt-4 inline-block" style={{ color: "#8B1A1A" }}>
          ← Back to listings
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/businesses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B1A1A] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to listings
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-56 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fdf0e8 0%, #fce8d5 100%)" }}>
          {business.image_url ? (
            <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{category?.icon ?? "🏪"}</span>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            {business.logo_url && (
              <img src={business.logo_url} alt="logo" className="w-14 h-14 rounded-xl object-cover border" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                {business.is_verified && (
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#C9A84C" }}>
                    <CheckCircle size={14} /> Verified
                  </span>
                )}
                {business.is_featured && (
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              {business.name_fa && (
                <p className="text-gray-500 text-lg mt-0.5" dir="rtl">{business.name_fa}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#FDF0E8", color: "#8B1A1A" }}>
                  {category?.label_en}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 font-medium">{business.city}</span>
              </div>
            </div>
          </div>

          {business.description && (
            <p className="text-gray-600 mb-3 leading-relaxed">{business.description}</p>
          )}
          {business.description_fa && (
            <p className="text-gray-600 mb-6 leading-relaxed" dir="rtl">{business.description_fa}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            {business.address && (
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: "#8B1A1A" }} />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Address</p>
                  <p className="text-sm text-gray-700">{business.address}, {business.city}</p>
                  {business.google_maps_url && (
                    <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs hover:underline mt-0.5 block" style={{ color: "#8B1A1A" }}>
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>
            )}
            {business.phone && (
              <div className="flex items-start gap-2.5">
                <Phone size={18} className="mt-0.5 shrink-0" style={{ color: "#8B1A1A" }} />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Phone</p>
                  <a href={`tel:${business.phone}`} className="text-sm text-gray-700 hover:text-red-700">
                    {business.phone}
                  </a>
                </div>
              </div>
            )}
            {business.website && (
              <div className="flex items-start gap-2.5">
                <Globe size={18} className="mt-0.5 shrink-0" style={{ color: "#8B1A1A" }} />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Website</p>
                  <a href={business.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm hover:underline break-all" style={{ color: "#8B1A1A" }}>
                    {business.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            )}
            {business.email && (
              <div className="flex items-start gap-2.5">
                <Mail size={18} className="mt-0.5 shrink-0" style={{ color: "#8B1A1A" }} />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Email</p>
                  <a href={`mailto:${business.email}`} className="text-sm text-gray-700 hover:text-red-700">
                    {business.email}
                  </a>
                </div>
              </div>
            )}
            {business.instagram && (
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">📸</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Instagram</p>
                  <a href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm hover:underline" style={{ color: "#8B1A1A" }}>
                    @{business.instagram.replace("@", "")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={
      <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="text-4xl mb-4">⏳</div>
        <p>Loading...</p>
      </main>
    }>
      <BusinessDetailContent />
    </Suspense>
  );
}

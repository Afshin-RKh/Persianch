"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getBusinessById } from "@/lib/api";
import { Business, CATEGORIES } from "@/types";
import { MapPin, Phone, Globe, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const BusinessMap = dynamic(() => import("@/components/business/BusinessMap"), { ssr: false });

const CATEGORY_GRADIENTS: Record<string, string> = {
  restaurant:   "from-orange-200 to-red-200",
  cafe:         "from-amber-200 to-yellow-200",
  hairdresser:  "from-pink-200 to-rose-200",
  doctor:       "from-blue-200 to-cyan-200",
  dentist:      "from-sky-200 to-blue-200",
  lawyer:       "from-slate-200 to-gray-200",
  accountant:   "from-green-200 to-emerald-200",
  grocery:      "from-lime-200 to-green-200",
  beauty:       "from-purple-200 to-pink-200",
  "real-estate":"from-indigo-200 to-blue-200",
  other:        "from-gray-200 to-slate-200",
};

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#FDF0E8" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

function BusinessDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getBusinessById(id).then(setBusiness).finally(() => setLoading(false));
  }, [id]);

  const category = business ? CATEGORIES.find((c) => c.slug === business.category) : null;

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-72 w-full mb-6" />
        <div className="skeleton h-8 w-64 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4" />
      </main>
    );
  }

  if (!business) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-bold text-lg">Business not found.</p>
        <Link href="/businesses" className="hover:underline mt-4 inline-block text-sm" style={{ color: "#8B1A1A" }}>
          ← Back to listings
        </Link>
      </main>
    );
  }

  const gradient = CATEGORY_GRADIENTS[business.category] ?? "from-gray-200 to-slate-200";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-up">
      <Link
        href="/businesses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B1A1A] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={15} /> Back to listings
      </Link>

      {/* Hero banner */}
      <div className={`relative h-64 sm:h-80 bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden mb-6 flex items-center justify-center`}>
        {business.image_url ? (
          <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-9xl opacity-60">{category?.icon ?? "🏪"}</span>
        )}
        {/* Dark overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {business.is_featured && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full shadow"
              style={{ backgroundColor: "#C9A84C", color: "#3a0a0a" }}>
              ⭐ Featured
            </span>
          )}
          {business.is_verified && (
            <span className="bg-white text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1"
              style={{ color: "#8B1A1A" }}>
              <CheckCircle size={12} /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {business.logo_url && (
                <img src={business.logo_url} alt="logo" className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{business.name}</h1>
                {business.name_fa && (
                  <p className="text-gray-400 text-base mt-0.5" dir="rtl">{business.name_fa}</p>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#FDF0E8", color: "#8B1A1A" }}>
                    {category?.icon} {category?.label_en}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} style={{ color: "#8B1A1A" }} /> {business.canton}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {(business.description || business.description_fa) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">About</h2>
              {business.description && (
                <p className="text-gray-600 leading-relaxed">{business.description}</p>
              )}
              {business.description_fa && (
                <p className="text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-50" dir="rtl">
                  {business.description_fa}
                </p>
              )}
            </div>
          )}

          {/* Map */}
          <BusinessMap business={business} />
        </div>

        {/* Contact sidebar */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide px-1">Contact</h2>

          {business.phone && (
            <ContactRow icon={<Phone size={16} style={{ color: "#8B1A1A" }} />} label="Phone">
              <a href={`tel:${business.phone}`} className="text-sm font-medium text-gray-800 hover:text-[#8B1A1A] transition-colors">
                {business.phone}
              </a>
            </ContactRow>
          )}

          {business.address && (
            <ContactRow icon={<MapPin size={16} style={{ color: "#8B1A1A" }} />} label="Address">
              <p className="text-sm text-gray-700">{business.address}, {business.canton}</p>
              {business.google_maps_url && (
                <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold mt-1 block hover:underline" style={{ color: "#8B1A1A" }}>
                  Open in Google Maps →
                </a>
              )}
            </ContactRow>
          )}

          {business.website && (
            <ContactRow icon={<Globe size={16} style={{ color: "#8B1A1A" }} />} label="Website">
              <a href={business.website} target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium hover:underline break-all" style={{ color: "#8B1A1A" }}>
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            </ContactRow>
          )}

          {business.email && (
            <ContactRow icon={<Mail size={16} style={{ color: "#8B1A1A" }} />} label="Email">
              <a href={`mailto:${business.email}`} className="text-sm font-medium text-gray-800 hover:text-[#8B1A1A] transition-colors break-all">
                {business.email}
              </a>
            </ContactRow>
          )}

          {business.instagram && (
            <ContactRow icon={<span style={{ color: "#8B1A1A", fontSize: 16 }}>📸</span>} label="Instagram">
              <a href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium hover:underline" style={{ color: "#8B1A1A" }}>
                @{business.instagram.replace("@", "")}
              </a>
            </ContactRow>
          )}

        </div>
      </div>
    </main>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-72 w-full mb-6" />
        <div className="skeleton h-8 w-64 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4" />
      </main>
    }>
      <BusinessDetailContent />
    </Suspense>
  );
}

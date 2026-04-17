import Link from "next/link";
import { Business, CATEGORIES } from "@/types";
import { MapPin, CheckCircle } from "lucide-react";

const CATEGORY_GRADIENTS: Record<string, string> = {
  restaurant:   "from-orange-100 to-red-100",
  cafe:         "from-amber-100 to-yellow-100",
  hairdresser:  "from-pink-100 to-rose-100",
  doctor:       "from-blue-100 to-cyan-100",
  dentist:      "from-sky-100 to-blue-100",
  lawyer:       "from-slate-100 to-gray-100",
  accountant:   "from-green-100 to-emerald-100",
  grocery:      "from-lime-100 to-green-100",
  beauty:       "from-purple-100 to-pink-100",
  "real-estate":"from-indigo-100 to-blue-100",
  other:        "from-gray-100 to-slate-100",
};

interface Props {
  business: Business;
}

export default function BusinessCard({ business }: Props) {
  const category = CATEGORIES.find((c) => c.slug === business.category);
  const gradient = CATEGORY_GRADIENTS[business.category] ?? "from-gray-100 to-slate-100";

  return (
    <Link href={`/businesses/detail?id=${business.id}`} className="block group">
      <div className="card-hover bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">

        {/* Image / placeholder */}
        <div className={`h-44 bg-gradient-to-br ${gradient} flex items-center justify-center relative flex-shrink-0`}>
          {business.image_url ? (
            <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
              {category?.icon ?? "🏪"}
            </span>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {business.is_featured && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: "#C9A84C", color: "#3a0a0a" }}>
                ⭐ Featured
              </span>
            )}
            {business.is_verified && (
              <span className="bg-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1"
                style={{ color: "#8B1A1A" }}>
                <CheckCircle size={11} /> Verified
              </span>
            )}
          </div>

          {/* Category pill overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
              style={{ color: "#8B1A1A" }}>
              {category?.icon} {category?.label_en}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 group-hover:text-[#8B1A1A] transition-colors leading-snug">
            {business.name}
          </h3>
          {business.name_fa && (
            <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{business.name_fa}</p>
          )}

          {business.description && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
              {business.description}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} style={{ color: "#8B1A1A" }} />
              {business.city}
            </span>
            <span className="text-xs font-semibold transition-colors" style={{ color: "#8B1A1A" }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { Business, CATEGORIES } from "@/types";
import { MapPin, Phone, Globe, CheckCircle } from "lucide-react";

interface Props {
  business: Business;
}

export default function BusinessCard({ business }: Props) {
  const category = CATEGORIES.find((c) => c.slug === business.category);

  return (
    <Link href={`/businesses/detail?id=${business.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
        {/* Image / placeholder */}
        <div className="h-40 bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center relative">
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">{category?.icon ?? "🏪"}</span>
          )}
          {business.is_featured && (
            <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                {business.name}
              </h3>
              {business.name_fa && (
                <p className="text-sm text-gray-500" dir="rtl">{business.name_fa}</p>
              )}
            </div>
            {business.is_verified && (
              <CheckCircle size={16} className="text-red-500 shrink-0 mt-1" />
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
              {category?.label_en}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 font-medium">{business.city}</span>
          </div>

          {business.description && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{business.description}</p>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            {business.address && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {business.city}
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1">
                <Phone size={11} /> {business.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

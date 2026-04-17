import Link from "next/link";
import { CATEGORIES } from "@/types";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦁</span>
              <span className="font-bold text-xl text-white">PersianCH</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The largest directory of Persian businesses in Switzerland.
              Find restaurants, doctors, lawyers, and more.
            </p>
            <p className="text-sm text-gray-400 mt-2" dir="rtl">
              بزرگترین دایرکتوری کسب‌وکارهای ایرانی در سوئیس
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/businesses?category=${cat.slug}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {cat.icon} {cat.label_en} · {cat.label_fa}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Cities</h3>
            <ul className="space-y-2 text-sm">
              {["Zurich", "Geneva", "Basel", "Bern", "Lausanne"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/businesses?city=${city}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} PersianCH · Built with ❤️ for the Persian community in Switzerland
        </div>
      </div>
    </footer>
  );
}

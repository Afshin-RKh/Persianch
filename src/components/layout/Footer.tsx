import Link from "next/link";
import { CATEGORIES } from "@/types";

export default function Footer() {
  return (
    <footer className="text-gray-300 mt-20" style={{ backgroundColor: "#1a0505" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦁</span>
              <div>
                <span className="font-bold text-xl text-white">Persian</span>
                <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Hub</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The largest directory of Persian businesses in Switzerland.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4" style={{ color: "#C9A84C" }}>Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/businesses?category=${cat.slug}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat.icon} {cat.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: "#C9A84C" }}>Cities</h3>
            <ul className="space-y-2 text-sm">
              {["Zurich", "Geneva", "Basel", "Bern", "Lausanne"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/businesses?city=${city}`}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-xs text-gray-600" style={{ borderTop: "1px solid #3a1515" }}>
          © {new Date().getFullYear()} PersianHub · Built with ❤️ for the Persian community in Switzerland
        </div>
      </div>
    </footer>
  );
}

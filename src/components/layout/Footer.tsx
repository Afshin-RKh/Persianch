"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/businesses" || pathname === "/events") return null;

  return (
    <footer className="text-gray-300 mt-20" style={{ backgroundColor: "#0D1B2E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗺️</span>
              <div>
                <span className="font-bold text-xl text-white">Biruni</span>
                <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Map</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              The global map of the Iranian diaspora — 3,000+ businesses across 50+ countries, inspired by Al-Biruni, the Persian scholar who mapped the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: "#C9A84C" }}>Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                ["/businesses", "All Businesses"],
                ["/about", "About Us"],
                ["/contact", "Contact Us"],
                ["/blog", "Blog"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-amber-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-xs text-gray-600" style={{ borderTop: "1px solid #1a2e4a" }}>
          © {new Date().getFullYear()} BiruniMap · Mapping the Iranian diaspora worldwide
        </div>
      </div>
    </footer>
  );
}

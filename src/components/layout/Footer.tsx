import Link from "next/link";
import { CATEGORIES } from "@/types";

export default function Footer() {
  return (
    <footer className="text-gray-300 mt-20" style={{ backgroundColor: "#0D1B2E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦁</span>
              <div>
                <span className="font-bold text-xl text-white">Persian</span>
                <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Hub</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your guide to Persian &amp; Iranian businesses across Europe — restaurants, doctors, lawyers, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4" style={{ color: "#C9A84C" }}>Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.filter(c => c.slug !== "other").map((cat) => (
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
          © {new Date().getFullYear()} PersianHub · Connecting the Persian community across Europe
        </div>
      </div>
    </footer>
  );
}

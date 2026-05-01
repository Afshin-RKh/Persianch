"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/businesses") || pathname.startsWith("/events")) return null;

  return (
    <footer className="text-gray-300 mt-20" style={{ backgroundColor: "#0D1B2E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗺️</span>
              <div>
                <span className="font-bold text-xl text-white">Biruni</span>
                <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Map</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              Businesses, events and community for the Iranian diaspora — mapped across 50+ countries.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/birunimap" target="_blank" rel="noopener noreferrer"
                aria-label="BiruniMap on Instagram"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://t.me/birunimap" target="_blank" rel="noopener noreferrer"
                aria-label="BiruniMap on Telegram"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="mailto:info@birunimap.com"
                aria-label="Email BiruniMap"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "#C9A84C" }}>Explore</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ["/businesses", "Businesses"],
                ["/events", "Events"],
                ["/blog", "Blog"],
                ["/about", "About Us"],
                ["/contact", "Contact Us"],
                ["/get-listed", "Add Your Business"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-amber-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pride element */}
          <div>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "#C9A84C" }}>About BiruniMap</h3>
            <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
              <p>Built by Iranians, for Iranians — a community project connecting the diaspora across 50+ countries.</p>
              <p dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }} className="text-gray-500">
                ساخته‌شده توسط ایرانیان، برای ایرانیان 🤍💚❤️
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-lg">🦁</span>
                <span className="text-xs text-gray-500">Inspired by Al-Biruni · Persian scholar · Est. 973 CE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600"
          style={{ borderTop: "1px solid #1a2e4a" }}>
          <span>© {new Date().getFullYear()} BiruniMap · Mapping the Iranian diaspora worldwide</span>
          <span className="text-gray-700">Made with ❤️ by Iranians abroad</span>
        </div>
      </div>
    </footer>
  );
}

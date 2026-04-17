"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors pb-0.5 ${
          active
            ? "border-b-2 border-[#C9A84C]"
            : "text-gray-600 hover:text-[#8B1A1A]"
        }`}
        style={active ? { color: "#8B1A1A" } : {}}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🦁</span>
            <div>
              <span className="font-bold text-xl" style={{ color: "#8B1A1A" }}>Persian</span>
              <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Hub</span>
            </div>
            <span className="hidden lg:inline text-xs text-gray-300 font-medium ml-1">· Switzerland</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLink("/", "Home")}
            {navLink("/businesses", "Businesses")}
            {navLink("/blog", "Blog")}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="text-white text-sm px-5 py-2 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105 shadow-sm"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              + Add Business
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 space-y-1">
          {[
            ["/", "🏠 Home"],
            ["/businesses", "🏪 Businesses"],
            ["/blog", "📝 Blog"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/admin"
              className="flex items-center justify-center w-full py-3 rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: "#8B1A1A" }}
              onClick={() => setOpen(false)}
            >
              + Add Your Business
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

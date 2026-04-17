"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-amber-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦁</span>
            <div>
              <span className="font-bold text-xl" style={{ color: "#8B1A1A" }}>Persian</span>
              <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Hub</span>
            </div>
            <span className="hidden sm:inline text-sm text-gray-400 font-medium">
              · Persian Community in Switzerland
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-[#8B1A1A] transition-colors">Home</Link>
            <Link href="/businesses" className="hover:text-[#8B1A1A] transition-colors">Businesses</Link>
            <Link href="/blog" className="hover:text-[#8B1A1A] transition-colors">Blog</Link>
            <Link
              href="/admin"
              className="text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              + Add Business
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-amber-100 bg-white px-4 pb-4 space-y-2 text-sm font-medium text-gray-700">
          <Link href="/" className="block py-2" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/businesses" className="block py-2" onClick={() => setOpen(false)}>Businesses</Link>
          <Link href="/blog" className="block py-2" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/admin" className="block py-2 font-semibold" style={{ color: "#8B1A1A" }} onClick={() => setOpen(false)}>+ Add Business</Link>
        </div>
      )}
    </nav>
  );
}

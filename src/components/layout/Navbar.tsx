"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦁</span>
            <span className="font-bold text-xl text-red-700">PersianCH</span>
            <span className="hidden sm:inline text-sm text-gray-400 font-medium">
              Persian Businesses in Switzerland
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-red-700 transition-colors">Home</Link>
            <Link href="/businesses" className="hover:text-red-700 transition-colors">All Businesses</Link>
            <Link href="/businesses?category=restaurant" className="hover:text-red-700 transition-colors">Restaurants</Link>
            <Link href="/businesses?category=doctor" className="hover:text-red-700 transition-colors">Doctors</Link>
            <Link
              href="/admin"
              className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors"
            >
              Add Business
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-red-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 space-y-2 text-sm font-medium text-gray-700">
          <Link href="/" className="block py-2" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/businesses" className="block py-2" onClick={() => setOpen(false)}>All Businesses</Link>
          <Link href="/businesses?category=restaurant" className="block py-2" onClick={() => setOpen(false)}>Restaurants</Link>
          <Link href="/businesses?category=doctor" className="block py-2" onClick={() => setOpen(false)}>Doctors</Link>
          <Link href="/admin" className="block py-2 text-red-700 font-semibold" onClick={() => setOpen(false)}>+ Add Business</Link>
        </div>
      )}
    </nav>
  );
}

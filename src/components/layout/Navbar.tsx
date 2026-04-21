"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LogOut, Settings, PenLine } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const pathname  = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const menuRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors pb-0.5 ${
          active ? "border-b-2 border-[#C9A84C]" : "text-gray-600 hover:text-[#1B3A6B]"
        }`}
        style={active ? { color: "#1B3A6B" } : {}}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🦁</span>
            <div>
              <span className="font-bold text-xl" style={{ color: "#1B3A6B" }}>Persian</span>
              <span className="font-bold text-xl" style={{ color: "#C9A84C" }}>Hub</span>
            </div>
            <span className="hidden lg:inline text-xs text-gray-300 font-medium ml-1">· Europe</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLink("/", "Home")}
            {navLink("/businesses", "Businesses")}
            {navLink("/about", "About Us")}
            {navLink("/contact", "Contact Us")}
            {navLink("/blog", "Blog")}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/contact#get-listed" className="text-white text-sm px-5 py-2 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105 shadow-sm" style={{ backgroundColor: "#8B1A1A" }}>
              + Get Listed
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#1B3A6B] transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1B3A6B" }}>
                      {user.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={userMenu ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link href="/blog/write" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <PenLine size={15} /> Write a Post
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-50 my-1" />
                    <button onClick={() => { logout(); setUserMenu(false); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" className="text-sm font-semibold text-gray-600 hover:text-[#1B3A6B] transition-colors px-3 py-2">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => setOpen(!open)} aria-label="Menu">
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
            ["/about", "🦁 About Us"],
            ["/contact", "✉️ Contact Us"],
            ["/blog", "📝 Blog"],
          ].map(([href, label]) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          {user && (
            <>
              <Link href="/blog/write" onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ✍️ Write a Post
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  ⚙️ Admin Panel
                </Link>
              )}
            </>
          )}
          <div className="pt-2 space-y-2">
            <Link href="/contact#get-listed" className="flex items-center justify-center w-full py-3 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: "#8B1A1A" }} onClick={() => setOpen(false)}>
              + Get Listed
            </Link>
            {user ? (
              <button onClick={() => { logout(); setOpen(false); }}
                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">
                Sign Out ({user.name.split(" ")[0]})
              </button>
            ) : (
              <Link href="/auth/signin" onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

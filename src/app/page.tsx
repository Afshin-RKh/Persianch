import Link from "next/link";
import SearchBar from "@/components/business/SearchBar";
import { CATEGORIES } from "@/types";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="text-white py-24 px-4"
        style={{ background: "linear-gradient(135deg, #6B1212 0%, #8B1A1A 50%, #5a0e0e 100%)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl">🦁</span>
            <div>
              <span className="font-bold text-4xl sm:text-5xl">Persian</span>
              <span className="font-bold text-4xl sm:text-5xl" style={{ color: "#C9A84C" }}>Hub</span>
            </div>
          </div>
          <p className="text-xl font-medium mb-4" style={{ color: "#E8C96A" }}>
            Persian Community in Switzerland
          </p>
          <p className="text-lg mb-10 text-red-100">
            Find Persian restaurants, doctors, lawyers, hairdressers &amp; more
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-amber-100 py-4 px-4">
        <div className="max-w-7xl mx-auto flex justify-center gap-10 text-center text-sm">
          <div>
            <span className="font-bold text-2xl" style={{ color: "#8B1A1A" }}>100+</span>
            <p className="text-gray-500">Businesses</p>
          </div>
          <div>
            <span className="font-bold text-2xl" style={{ color: "#8B1A1A" }}>10</span>
            <p className="text-gray-500">Swiss Cities</p>
          </div>
          <div>
            <span className="font-bold text-2xl" style={{ color: "#8B1A1A" }}>11</span>
            <p className="text-gray-500">Categories</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 gold-underline inline-block">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/businesses?category=${cat.slug}`}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group text-center hover:border-amber-300"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-[#8B1A1A]">
                {cat.label_en}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center" style={{ backgroundColor: "#FDF8F3", borderTop: "1px solid #e8d5b0", borderBottom: "1px solid #e8d5b0" }}>
        <div className="max-w-2xl mx-auto">
          <span className="text-4xl mb-4 block">🏪</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Own a Persian Business in Switzerland?</h2>
          <p className="text-gray-500 mb-6">List your business for free and reach thousands of Iranians.</p>
          <Link
            href="/admin"
            className="inline-block text-white font-semibold px-8 py-3 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            Add Your Business — Free
          </Link>
        </div>
      </section>
    </main>
  );
}

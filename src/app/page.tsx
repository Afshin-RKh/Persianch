import Link from "next/link";
import SearchBar from "@/components/business/SearchBar";
import { CATEGORIES } from "@/types";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 via-red-800 to-rose-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-300 text-sm font-medium tracking-widest uppercase mb-3">
            Persian Community in Switzerland
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 leading-tight">
            Find Persian Businesses
          </h1>
          <p className="text-2xl font-semibold mb-2" dir="rtl">
            کسب‌وکارهای ایرانی در سوئیس
          </p>
          <p className="text-red-200 text-lg mb-10">
            Restaurants, Doctors, Lawyers, Hairdressers &amp; more — all in one place.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
        <p className="text-gray-500 mb-8">جستجو بر اساس دسته‌بندی</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/businesses?category=${cat.slug}`}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200 group text-center"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-red-700">
                {cat.label_en}
              </span>
              <span className="text-xs text-gray-400">{cat.label_fa}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA — Add business */}
      <section className="bg-red-50 border-y border-red-100 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Own a Persian Business?</h2>
        <p className="text-gray-500 mb-6">
          List your business for free and reach thousands of Iranians living in Switzerland.
        </p>
        <Link
          href="/admin"
          className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Add Your Business — Free
        </Link>
      </section>
    </main>
  );
}

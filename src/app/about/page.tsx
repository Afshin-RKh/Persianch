import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 fade-up">

      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-6xl block mb-5">🦁</span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About <span style={{ color: "#1B3A6B" }}>Persian</span><span style={{ color: "#C9A84C" }}>Hub</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          A community-driven directory connecting Persian-speaking businesses with their customers across Europe.
        </p>
      </div>

      {/* Who we are */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Who We Are</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          We are a group of passionate Persians living in Europe who believe in the strength of our community.
          PersianHub was built to make it easier for Iranians, Afghans, Tajiks and anyone who shares our language,
          food and culture to find businesses that feel like home — wherever they are in Europe.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Whether you're looking for a restaurant that makes real <em>ghormeh sabzi</em>, a doctor who speaks Farsi,
          or a lawyer who understands your background, this is the place to find them.
        </p>
      </section>

      {/* Our mission */}
      <section className="rounded-3xl p-8 mb-6" style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 100%)" }}>
        <h2 className="text-xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-blue-100 leading-relaxed mb-4">
          We support Persian-speaking founders from Iran, Afghanistan and Tajikistan who run businesses in Europe —
          businesses that bring shared language, food and culture as a genuine value to their customers.
        </p>
        <p className="text-blue-100 leading-relaxed">
          Our goal is simple: put these businesses on the map, give them visibility, and help our community
          find and support them.
        </p>
      </section>

      {/* Three pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: "🇮🇷", title: "Persian Community", text: "Built by Persians, for Persians and the wider Farsi-speaking diaspora across Europe." },
          { icon: "🤝", title: "Free to List", text: "Standard listings are completely free. No fees, no commissions, no catch." },
          { icon: "🌍", title: "Across Europe", text: "From Switzerland to Germany, the UK, France and beyond — we cover the whole continent." },
        ].map(({ icon, title, text }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <span className="text-4xl block mb-3">{icon}</span>
            <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {/* How it works / AI transparency */}
      <section className="bg-amber-50 border border-amber-100 rounded-3xl p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">A Note on Our Listings</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          PersianHub is a free service and we want to be transparent about how it works. Many of the businesses
          listed here were discovered and added with the help of AI — which means, despite our best efforts,
          some listings may be outdated, inaccurate, or no longer active.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          We review submissions regularly, but we rely on the community to help us keep things accurate.
          If you find a business that has closed, moved, or has incorrect details — please be kind and let us know.
          It takes two minutes and makes PersianHub better for everyone.
        </p>
        <Link
          href="/contact"
          className="inline-block font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#1B3A6B", color: "white" }}
        >
          Report an Issue →
        </Link>
      </section>

      {/* Add your business CTA */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Own a Persian, Afghan or Tajik Business in Europe?</h2>
        <p className="text-gray-500 leading-relaxed mb-2 max-w-lg mx-auto">
          Listings on PersianHub are completely free. Fill in the form and your business
          will be on the map within a few days.
        </p>
        <p className="text-gray-400 text-sm mb-7">
          No fees. No contracts. Just visibility — across Europe.
        </p>
        <Link
          href="/get-listed"
          className="inline-block font-bold px-10 py-4 rounded-2xl transition-all hover:opacity-90 hover:scale-105 text-base shadow-md"
          style={{ backgroundColor: "#8B1A1A", color: "white" }}
        >
          Get Listed — It's Free
        </Link>
      </section>

    </main>
  );
}

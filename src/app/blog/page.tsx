"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getBlogPosts, BlogPost, BlogFilters } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";

const TAGS = ["restaurant", "cafe", "survival guides", "legal", "transportation"];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "other", label: "Other" },
];

export default function BlogPage() {
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilters>({});
  const { user } = useAuth();
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    getBlogPosts(filters)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleTag      = (tag: string)     => setFilters((f) => ({ ...f, tag: f.tag === tag ? undefined : tag }));
  const setCountry     = (country: string) => setFilters((f) => ({ ...f, country: country || undefined, city: undefined }));
  const setCity        = (city: string)    => setFilters((f) => ({ ...f, city: city || undefined }));
  const setLanguage    = (lang: string)    => setFilters((f) => ({ ...f, language: lang || undefined }));
  const clearAll       = ()                => setFilters({});

  const regions = filters.country ? (REGIONS_BY_COUNTRY[filters.country] ?? []) : [];
  const activeFilters = !!(filters.tag || filters.country || filters.city || filters.language);
  const langLabel = (v: string) => LANGUAGES.find((l) => l.value === v)?.label ?? v;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600&display=swap" rel="stylesheet" />
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-base sm:text-lg font-medium text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
            Learn local tips, rules and survival guides — filter by location and topic.
          </p>
          <p className="text-base sm:text-lg mt-1 text-gray-600" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif", fontWeight: 600 }}>
            نکات محلی، قوانین و راهنمای زندگی — بر اساس موقعیت و موضوع فیلتر کنید.
          </p>
        </div>
        {user && (
          <Link href="/blog/write" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 flex-shrink-0 ml-6 mt-1" style={{ backgroundColor: "#8B1A1A" }}>
            ✍️ Write a Post
          </Link>
        )}
      </div>

      {/* Filter row: country + language */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <select
          value={filters.country || ""}
          onChange={(e) => setCountry(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white shadow-sm"
        >
          <option value="">All countries</option>
          {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {regions.length > 0 && (
          <select
            value={filters.city || ""}
            onChange={(e) => setCity(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white shadow-sm"
          >
            <option value="">All regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}

        <select
          value={filters.language || ""}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white shadow-sm"
        >
          <option value="">All languages</option>
          {LANGUAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>

        {activeFilters && (
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Topic pills — horizontal scroll with fade edges */}
      <div className="relative mb-8">
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto pb-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            maskImage: "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)",
          }}
        >
          <button
            onClick={() => toggleTag("")}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !filters.tag ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
            }`}
            style={!filters.tag ? { backgroundColor: "#1B3A6B" } : {}}
          >
            All Topics
          </button>
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                filters.tag === tag ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
              }`}
              style={filters.tag === tag ? { backgroundColor: "#1B3A6B" } : {}}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading articles...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">📝</div>
          <p className="font-medium text-gray-500">
            {activeFilters ? "No articles match your filters." : "No articles published yet."}
          </p>
          {activeFilters && (
            <button onClick={clearAll} className="mt-3 text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/post?slug=${post.slug}`}>
              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex">
                {post.cover_image && (
                  <div className="w-40 sm:w-52 flex-shrink-0">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("en-CH", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    {(post.city || post.country) && (
                      <span className="text-xs text-gray-400">· {[post.city, post.country].filter(Boolean).join(", ")}</span>
                    )}
                    {post.author_name && <span className="text-xs text-gray-400">· by {post.author_name}</span>}
                    {post.language && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#fef9f0", color: "#C9A84C", border: "1px solid #fde68a" }}>
                        {langLabel(post.language)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>

                  <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                    {post.content?.replace(/<[^>]+>/g, "").slice(0, 200)}
                  </p>

                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize" style={{ backgroundColor: "#EEF2FF", color: "#1B3A6B" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="mt-3 inline-block text-xs font-semibold" style={{ color: "#1B3A6B" }}>
                    Read more →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

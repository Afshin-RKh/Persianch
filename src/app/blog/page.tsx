"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts, BlogPost, BlogFilters } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { SkeletonPosts } from "@/components/ui/Skeletons";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import { Globe, Tag, PenLine } from "lucide-react";

const TAGS = ["survival guides", "legal", "transportation", "travel guides"];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "other", label: "Other" },
];

export default function BlogPage() {
  const [posts, setPosts]           = useState<BlogPost[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState<BlogFilters>({});
  const [hasFetched, setHasFetched] = useState(false);
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    getBlogPosts(filters)
      .then((data) => { setPosts(data); setHasFetched(true); })
      .catch(() => { toastError("Failed to load articles. Please refresh."); setPosts([]); })
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleTag   = (tag: string)  => setFilters((f) => ({ ...f, tag: f.tag === tag ? undefined : tag }));
  const setCountry  = (c: string)    => setFilters((f) => ({ ...f, country: c || undefined, city: undefined }));
  const setCity     = (c: string)    => setFilters((f) => ({ ...f, city: c || undefined }));
  const setLanguage = (l: string)    => setFilters((f) => ({ ...f, language: l || undefined }));
  const clearAll    = ()             => setFilters({});

  const regions = filters.country ? (REGIONS_BY_COUNTRY[filters.country] ?? []) : [];
  const activeFilters = !!(filters.tag || filters.country || filters.city || filters.language);
  const langLabel = (v: string) => LANGUAGES.find((l) => l.value === v)?.label ?? v;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Community Blog</h1>
          <p className="text-sm text-gray-500">
            Local tips, survival guides and stories from Iranians abroad.
          </p>
          <p className="text-sm mt-0.5 text-gray-500" dir="rtl" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
            نکات محلی، راهنمای زندگی و داستان‌های ایرانیان خارج از کشور.
          </p>
        </div>
        {user ? (
          <Link href="/blog/write"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 flex-shrink-0 self-start"
            style={{ backgroundColor: "#8B1A1A" }}>
            <PenLine size={15} /> Write a Post
          </Link>
        ) : (
          <Link href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-all flex-shrink-0 self-start">
            <PenLine size={15} /> Share your experience →
          </Link>
        )}
      </div>

      {/* Filters — Location */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={13} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filters.country || ""} onChange={(e) => setCountry(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white">
            <option value="">All countries</option>
            {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {regions.length > 0 && (
            <select value={filters.city || ""} onChange={(e) => setCity(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white">
              <option value="">All regions</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Filters — Language */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">🌐 Language</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setLanguage("")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !filters.language ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-[#C9A84C] hover:text-[#b8922a]"
            }`}
            style={!filters.language ? { backgroundColor: "#C9A84C" } : {}}>
            All
          </button>
          {LANGUAGES.map(({ value, label }) => (
            <button key={value} onClick={() => setLanguage(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.language === value ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-[#C9A84C] hover:text-[#b8922a]"
              }`}
              style={filters.language === value ? { backgroundColor: "#C9A84C" } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters — Topics */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={13} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Topic</span>
        </div>
        <div ref={pillsRef} className="flex flex-wrap gap-2">
          <button onClick={() => toggleTag("")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !filters.tag ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
            }`}
            style={!filters.tag ? { backgroundColor: "#1B3A6B" } : {}}>
            All Topics
          </button>
          {TAGS.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                filters.tag === tag ? "text-white border-transparent" : "text-gray-600 border-gray-200 bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
              }`}
              style={filters.tag === tag ? { backgroundColor: "#1B3A6B" } : {}}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {activeFilters && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">{hasFetched ? `${posts.length} article${posts.length !== 1 ? "s" : ""} found` : ""}</p>
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
            ✕ Clear filters
          </button>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <SkeletonPosts count={6} />
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
        <div className="grid gap-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/post?slug=${post.slug}`}>
              <article className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex h-40 ${post.language === "fa" ? "flex-row-reverse" : ""}`}>
                {/* Cover image or placeholder */}
                <div className="w-36 sm:w-48 flex-shrink-0 relative bg-gradient-to-br from-gray-100 to-gray-50">
                  {post.cover_image ? (
                    <Image src={post.cover_image} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 144px, 192px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-20">📝</span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0 overflow-hidden" dir={post.language === "fa" ? "rtl" : "ltr"}>
                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("en-CH", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    {(post.city || post.country) && (
                      <span className="text-xs text-gray-400">· {[post.city, post.country].filter(Boolean).join(", ")}</span>
                    )}
                    {post.language && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#fef9f0", color: "#b8922a", border: "1px solid #fde68a" }}>
                        {langLabel(post.language)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-1"
                    style={post.language === "fa" ? { fontFamily: "'Vazirmatn', sans-serif" } : {}}>
                    {post.title}
                  </h2>

                  <p className="text-xs text-gray-500 line-clamp-2 flex-1"
                    style={post.language === "fa" ? { fontFamily: "'Vazirmatn', sans-serif", lineHeight: "1.9" } : {}}>
                    {post.content?.replace(/<[^>]+>/g, "").slice(0, 180)}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {post.tags ? (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={{ backgroundColor: "#EEF2FF", color: "#1B3A6B" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : <span />}
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#1B3A6B" }}>
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

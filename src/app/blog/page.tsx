"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBlogPosts, BlogPost, BlogFilters } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const TAGS = ["restaurant", "cafe", "survival guides", "legal", "transportation"];

export default function BlogPage() {
  const [posts, setPosts]       = useState<BlogPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState<BlogFilters>({});
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getBlogPosts(filters)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const setTag     = (tag: string)     => setFilters((f) => ({ ...f, tag:     f.tag === tag ? undefined : tag }));
  const setCountry = (country: string) => setFilters((f) => ({ ...f, country: f.country === country ? undefined : country, city: undefined }));
  const setCity    = (city: string)    => setFilters((f) => ({ ...f, city:    f.city === city ? undefined : city }));
  const clearAll   = ()                => setFilters({});

  const activeFilters = !!(filters.tag || filters.country || filters.city);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 gold-underline inline-block">Blog</h1>
          <p className="text-gray-500 mt-3">News, tips and stories from the Persian community across Europe.</p>
        </div>
        {user && (
          <Link href="/blog/write" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 flex-shrink-0 mt-1" style={{ backgroundColor: "#8B1A1A" }}>
            ✍️ Write a Post
          </Link>
        )}
      </div>

      {/* Tag filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
              filters.tag === tag
                ? "text-white border-transparent"
                : "text-gray-600 border-gray-200 bg-white hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
            }`}
            style={filters.tag === tag ? { backgroundColor: "#1B3A6B" } : {}}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Location filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Country (e.g. Switzerland)"
          value={filters.country || ""}
          onChange={(e) => setCountry(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] w-48"
        />
        <input
          type="text"
          placeholder="City (e.g. Zurich)"
          value={filters.city || ""}
          onChange={(e) => setCity(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] w-40"
        />
        {activeFilters && (
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2">
            ✕ Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading articles...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">📝</div>
          <p className="font-medium text-gray-500">{activeFilters ? "No articles match your filters." : "No articles published yet."}</p>
          {activeFilters && (
            <button onClick={clearAll} className="mt-3 text-sm font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/post?slug=${post.slug}`}>
              <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex gap-0">
                {post.cover_image && (
                  <div className="w-48 flex-shrink-0">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(post.created_at).toLocaleDateString("en-CH", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                    {(post.city || post.country) && (
                      <span className="ml-2">· {[post.city, post.country].filter(Boolean).join(", ")}</span>
                    )}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.tags.split(",").map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ backgroundColor: "#EEF2FF", color: "#1B3A6B" }}>{t.trim()}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {post.content?.replace(/<[^>]+>/g, "").slice(0, 200)}...
                  </p>
                  <span className="mt-4 inline-block text-xs font-semibold" style={{ color: "#1B3A6B" }}>
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

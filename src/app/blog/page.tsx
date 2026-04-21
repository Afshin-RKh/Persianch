"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBlogPosts, BlogPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-10">
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

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading articles...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-4">📝</div>
          <p className="font-medium text-gray-500">No articles published yet.</p>
          <p className="text-sm mt-1">Check back soon!</p>
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
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1B3A6B]">
                    {post.title}
                  </h2>
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

"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBlogPost, BlogPost } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

function BlogPostContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    getBlogPost(slug)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="text-4xl mb-4">⏳</div>
        <p>Loading article...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-4xl mb-4">🔍</p>
        <p className="font-medium">Article not found.</p>
        <Link href="/blog" className="hover:underline mt-4 inline-block" style={{ color: "#8B1A1A" }}>
          ← Back to Blog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B1A1A] mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      {post.cover_image && (
        <div className="rounded-2xl overflow-hidden mb-8 h-64">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-xs text-gray-400 mb-3">
        {new Date(post.created_at).toLocaleDateString("en-CH", {
          year: "numeric", month: "long", day: "numeric",
        })}
      </p>

      <h1 className="text-3xl font-bold text-gray-900 mb-8 gold-underline inline-block">
        {post.title}
      </h1>

      <div
        className="prose prose-gray max-w-none text-gray-700 leading-relaxed mt-8"
        dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
      />
    </main>
  );
}

export default function BlogPostPage() {
  return (
    <Suspense fallback={
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="text-4xl mb-4">⏳</div>
        <p>Loading...</p>
      </main>
    }>
      <BlogPostContent />
    </Suspense>
  );
}

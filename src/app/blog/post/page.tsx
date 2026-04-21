"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBlogPost, BlogPost } from "@/lib/api";
import { useAuth, authHeaders } from "@/lib/auth";
import { ArrowLeft, Trash2, Edit2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://phub.ch/api";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  user_name: string;
  avatar?: string;
}

function Comments({ postId }: { postId: number }) {
  const { user, token, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetch(`${API}/comments.php?entity_type=blog&entity_id=${postId}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/comments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ entity_type: "blog", entity_id: postId, content: text }),
      });
      const c = await res.json();
      if (res.ok) { setComments((prev) => [...prev, c]); setText(""); }
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: number) => {
    await fetch(`${API}/comments.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

      {comments.length === 0 && (
        <p className="text-gray-400 text-sm mb-8">No comments yet. Be the first!</p>
      )}

      <div className="space-y-4 mb-8">
        {comments.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1B3A6B" }}>
                    {c.user_name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800">{c.user_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("en-CH", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              {(user?.id === c.user_id || isAdmin) && (
                <button onClick={() => deleteComment(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Sign in</Link> to leave a comment.
        </p>
      )}
    </section>
  );
}

function BlogPostContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const id   = searchParams.get("id");
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, token } = useAuth();

  useEffect(() => {
    if (id && isAdmin !== undefined) {
      if (!isAdmin) { setLoading(false); return; }
      fetch(`${API}/blog.php?id=${id}`, { headers: authHeaders(token) })
        .then((r) => r.json())
        .then(setPost)
        .finally(() => setLoading(false));
    } else if (slug) {
      getBlogPost(slug).then(setPost).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug, id, isAdmin, token]);

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
        <Link href="/blog" className="hover:underline mt-4 inline-block" style={{ color: "#1B3A6B" }}>
          ← Back to Blog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        {isAdmin && (
          <Link href={`/blog/edit?id=${post.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50" style={{ color: "#1B3A6B", borderColor: "#1B3A6B" }}>
            <Edit2 size={13} /> Edit Post
          </Link>
        )}
      </div>

      {(post as any).status && (post as any).status !== "approved" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-semibold px-4 py-2.5 rounded-xl mb-6 flex items-center gap-2">
          <span className="uppercase tracking-wide">{(post as any).status}</span>
          <span className="font-normal text-yellow-700">— This post is not yet published. Only admins can see it.</span>
        </div>
      )}

      {post.cover_image && (
        <div className="rounded-2xl overflow-hidden mb-8 h-64">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-xs text-gray-400 mb-3">
        {new Date(post.created_at).toLocaleDateString("en-CH", { year: "numeric", month: "long", day: "numeric" })}
        {(post.city || post.country) && (
          <span className="ml-2">· {[post.city, post.country].filter(Boolean).join(", ")}</span>
        )}
        {post.author_name && <span className="ml-2">· by {post.author_name}</span>}
      </p>

      {post.tags && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.split(",").map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={{ backgroundColor: "#EEF2FF", color: "#1B3A6B" }}>{t.trim()}</span>
          ))}
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-8 gold-underline inline-block">{post.title}</h1>

      <div
        className="prose prose-gray max-w-none text-gray-700 leading-relaxed mt-8"
        dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
      />

      <Comments postId={post.id} />
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

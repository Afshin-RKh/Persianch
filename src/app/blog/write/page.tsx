"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, authHeaders } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const TAGS = ["restaurant", "cafe", "survival guides", "legal", "transportation"];

export default function WriteBlogPage() {
  const { user, token, isAdmin } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "", content: "", cover_image: "", country: "", city: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You need to sign in to write a blog post.</p>
          <Link href="/auth/signin" className="text-white font-semibold px-6 py-3 rounded-xl text-sm" style={{ backgroundColor: "#8B1A1A" }}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contentText = form.content.replace(/<[^>]+>/g, "").trim();
    if (!form.title.trim() || !contentText) { setError("Title and content are required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/blog.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ ...form, tags: selectedTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setDone(true);
      if (isAdmin) router.push(`/blog/post?slug=${data.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Submitted!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your post has been submitted for review. An admin will approve it shortly.
          </p>
          <Link href="/blog" className="text-white font-semibold px-6 py-3 rounded-xl text-sm" style={{ backgroundColor: "#1B3A6B" }}>
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">
          ← Back to Blog
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Write a Post</h1>
        {!isAdmin && (
          <p className="text-sm text-gray-400 mt-1">Your post will be reviewed by an admin before publishing.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter post title"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cover Image URL (optional)</label>
          <input
            type="url"
            value={form.cover_image}
            onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                  selectedTags.includes(tag)
                    ? "text-white border-transparent"
                    : "text-gray-600 border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                }`}
                style={selectedTags.includes(tag) ? { backgroundColor: "#1B3A6B" } : {}}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value, city: "" })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white"
            >
              <option value="">— select country —</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region / City</label>
            {(REGIONS_BY_COUNTRY[form.country] ?? []).length > 0 ? (
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white"
              >
                <option value="">— select region —</option>
                {(REGIONS_BY_COUNTRY[form.country] ?? []).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City or region"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content *</label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="Write your post here…"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
          style={{ backgroundColor: "#8B1A1A" }}
        >
          {loading ? "Submitting..." : isAdmin ? "Publish Post" : "Submit for Review"}
        </button>
      </form>
    </main>
  );
}

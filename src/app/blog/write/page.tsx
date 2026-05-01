"use client";
import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, authHeaders } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
const RichTextEditor = lazy(() => import("@/components/RichTextEditor"));

const API  = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const TAGS = ["survival guides", "legal", "transportation", "travel guides"];
const LANGS = [
  { value: "en", label: "English" }, { value: "fa", label: "فارسی" },
  { value: "de", label: "Deutsch"  }, { value: "fr", label: "Français" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM = { title: "", content: "", cover_image: "", country: "", city: "", language: "" };

export default function WriteBlogPage() {
  const { user, token, isAdmin } = useAuth();
  const router = useRouter();

  const [form, setForm]             = useState(EMPTY_FORM);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imgError, setImgError]     = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);

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
    if (!form.title.trim() || !contentText) { setError("Title and content are required."); return; }
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
      if (isAdmin && data.slug) router.push(`/blog/post?slug=${data.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWriteAnother = () => {
    setForm(EMPTY_FORM);
    setSelectedTags([]);
    setDone(false);
    setError("");
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog" className="text-white font-semibold px-6 py-3 rounded-xl text-sm" style={{ backgroundColor: "#1B3A6B" }}>
              Back to Blog
            </Link>
            <button onClick={handleWriteAnother} className="text-[#1B3A6B] font-semibold px-6 py-3 rounded-xl text-sm border border-[#1B3A6B] hover:bg-blue-50 transition-colors">
              Write another post
            </button>
          </div>
        </div>
      </main>
    );
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">
          ← Back to Blog
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">Write a Post</h1>
        {!isAdmin && (
          <p className="text-sm text-gray-400 mt-1">Your post will be reviewed by an admin before publishing.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter post title"
            required
            aria-required="true"
            className={inp}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cover Image URL <span className="font-normal text-gray-400">(optional)</span></label>
          <input
            type="url"
            value={form.cover_image}
            onChange={(e) => { setForm({ ...form, cover_image: e.target.value }); setImgError(false); }}
            placeholder="https://example.com/image.jpg"
            className={inp}
          />
          {form.cover_image && !imgError && (
            <div className="mt-2 relative h-36 w-full rounded-xl overflow-hidden border border-gray-100">
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          )}
          {form.cover_image && imgError && (
            <p className="mt-1.5 text-xs text-red-500">⚠ This URL doesn't load a valid image. Please check the link.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] ${
                  selectedTags.includes(tag) ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                }`}
                style={selectedTags.includes(tag) ? { backgroundColor: "#1B3A6B" } : {}}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGS.map(({ value, label }) => (
              <button key={value} type="button"
                onClick={() => setForm((f) => ({ ...f, language: f.language === value ? "" : value }))}
                aria-pressed={form.language === value}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] ${
                  form.language === value ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                }`}
                style={form.language === value ? { backgroundColor: "#1B3A6B" } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, city: "" })} className={inp}>
              <option value="">— select country —</option>
              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Region / City
              {!form.country && <span className="text-gray-400 font-normal ml-1">(select country first)</span>}
            </label>
            {(REGIONS_BY_COUNTRY[form.country] ?? []).length > 0 ? (
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={!form.country} className={`${inp} disabled:opacity-40 disabled:cursor-not-allowed`}>
                <option value="">— select region —</option>
                {[...(REGIONS_BY_COUNTRY[form.country] ?? [])].sort((a, b) => a.localeCompare(b)).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder={form.country ? "City or region" : "Select country first"}
                disabled={!form.country}
                className={`${inp} disabled:opacity-40 disabled:cursor-not-allowed`} />
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content *</label>
          <Suspense fallback={<div className="h-48 skeleton rounded-xl" />}>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Write your post here…"
            />
          </Suspense>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#8B1A1A]"
          style={{ backgroundColor: "#8B1A1A" }}
        >
          {loading ? "Submitting…" : isAdmin ? "Publish Post" : "Submit for Review"}
        </button>
      </form>
    </main>
  );
}

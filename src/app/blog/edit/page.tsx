"use client";
import { useEffect, useState, Suspense, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
const RichTextEditor = lazy(() => import("@/components/RichTextEditor"));

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const TAGS = ["survival guides", "legal", "transportation", "travel guides"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "other", label: "Other" },
];

interface PostData {
  id: number; title: string; slug: string; content: string;
  cover_image?: string; status: string; tags?: string;
  country?: string; city?: string; language?: string;
}

function EditForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { user, token, isAdmin } = useAuth();

  const [post, setPost]       = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "", content: "", cover_image: "", country: "", city: "", status: "approved", language: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleDelete = async () => {
    if (!post || !window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/blog.php?id=${post.id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!id || !token) return;
    fetch(`${API}/blog.php?id=${id}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data: PostData) => {
        if (!data) return;
        setPost(data);
        setForm({
          title:       data.title       ?? "",
          content:     data.content     ?? "",
          cover_image: data.cover_image ?? "",
          country:     data.country     ?? "",
          city:        data.city        ?? "",
          status:      data.status      ?? "approved",
          language:    data.language    ?? "",
        });
        setSelectedTags(data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : []);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/blog.php`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ id: post.id, ...form, tags: selectedTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuccess(true);
      setTimeout(() => {
        if (form.status === "approved") router.push(`/blog/post?slug=${post.slug}`);
        else router.push("/admin");
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user || !isAdmin) return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Admin access required.</p></main>;
  if (loading) return <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400"><p>Loading post...</p></main>;
  if (!post) return <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500"><p>Post not found.</p><Link href="/admin" className="mt-4 inline-block hover:underline" style={{ color: "#1B3A6B" }}>← Back to Admin</Link></main>;

  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];
  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";
  const isFarsi = form.language === "fa";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">← Back to Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Edit Post</h1>
          <p className="text-sm text-gray-400 mt-1 truncate">{post.title}</p>
        </div>
        <button type="button" onClick={handleDelete} disabled={deleting}
          className="mt-8 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex-shrink-0">
          {deleting ? "Deleting…" : "🗑 Delete Post"}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6 font-medium">Saved! Redirecting…</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inp}>
            <option value="approved">approved</option>
            <option value="pending">pending</option>
            <option value="rejected">rejected</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(({ value, label }) => (
              <button key={value} type="button"
                onClick={() => setForm((f) => ({ ...f, language: f.language === value ? "" : value }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  form.language === value ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B]"
                }`}
                style={form.language === value ? { backgroundColor: "#1B3A6B" } : {}}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
          <input type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            dir={isFarsi ? "rtl" : "ltr"}
            className={inp}
            style={isFarsi ? { fontFamily: "'Vazirmatn', sans-serif" } : {}} />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cover Image URL</label>
          <input type="text" value={form.cover_image}
            onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
            placeholder="https://images.unsplash.com/..." className={inp} />
          {form.cover_image && (
            <img src={form.cover_image} alt="" className="mt-2 h-32 w-full object-cover rounded-xl"
              onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                  selectedTags.includes(tag) ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B]"
                }`}
                style={selectedTags.includes(tag) ? { backgroundColor: "#1B3A6B" } : {}}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, city: "" })} className={inp}>
              <option value="">— none —</option>
              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region / City</label>
            {regions.length > 0 ? (
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp}>
                <option value="">— none —</option>
                {[...regions].sort((a, b) => a.localeCompare(b)).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City or region" className={inp} />
            )}
          </div>
        </div>

        {/* Content — single field, direction-aware */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Content {isFarsi && <span className="text-gray-400 font-normal">(راست به چپ)</span>}
          </label>
          <Suspense fallback={<div className="h-48 bg-gray-100 rounded-xl animate-pulse" />}>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              dir={isFarsi ? "rtl" : "ltr"}
            />
          </Suspense>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50"
            style={{ backgroundColor: "#8B1A1A" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/admin" className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function EditBlogPostPage() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400"><p>Loading…</p></main>}>
      <EditForm />
    </Suspense>
  );
}

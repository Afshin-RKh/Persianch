"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import RichTextEditor from "@/components/RichTextEditor";

const API = process.env.NEXT_PUBLIC_API_URL || "https://phub.ch/api";
const TAGS = ["restaurant", "cafe", "survival guides", "legal", "transportation"];

interface PostData {
  id: number;
  title: string;
  title_fa?: string;
  slug: string;
  content: string;
  content_fa?: string;
  cover_image?: string;
  status: string;
  tags?: string;
  country?: string;
  city?: string;
}

function EditForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { user, token, isAdmin } = useAuth();

  const [post, setPost]     = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "", title_fa: "", content: "", content_fa: "",
    cover_image: "", country: "", city: "", status: "approved",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!id || !token) return;
    fetch(`${API}/blog.php?id=${id}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data: PostData) => {
        if (!data) return;
        setPost(data);
        setForm({
          title:       data.title       ?? "",
          title_fa:    data.title_fa    ?? "",
          content:     data.content     ?? "",
          content_fa:  data.content_fa  ?? "",
          cover_image: data.cover_image ?? "",
          country:     data.country     ?? "",
          city:        data.city        ?? "",
          status:      data.status      ?? "approved",
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
    setSaving(true);
    setError("");
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

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Admin access required.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Loading post...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        <p>Post not found.</p>
        <Link href="/admin" className="mt-4 inline-block hover:underline" style={{ color: "#1B3A6B" }}>← Back to Admin</Link>
      </main>
    );
  }

  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];
  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">← Back to Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Edit Post</h1>
        <p className="text-sm text-gray-400 mt-1 truncate">{post.title}</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6 font-medium">
          Saved! Redirecting…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={`${inp} bg-white`}>
            <option value="approved">approved</option>
            <option value="pending">pending</option>
            <option value="rejected">rejected</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title (English) *</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title (Persian / Farsi)</label>
          <input type="text" value={form.title_fa} onChange={(e) => setForm({ ...form, title_fa: e.target.value })} dir="rtl" className={inp} />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cover Image URL</label>
          <input type="text" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." className={inp} />
          {form.cover_image && (
            <img src={form.cover_image} alt="" className="mt-2 h-32 w-full object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />
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
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, city: "" })}
              className={`${inp} bg-white`}>
              <option value="">— none —</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Region / City</label>
            {regions.length > 0 ? (
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={`${inp} bg-white`}>
                <option value="">— none —</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City or region" className={inp} />
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content (English) *</label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content (Persian / Farsi)</label>
          <RichTextEditor
            value={form.content_fa}
            onChange={(html) => setForm({ ...form, content_fa: html })}
            minHeight={200}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50"
            style={{ backgroundColor: "#8B1A1A" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href="/admin" className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function EditBlogPostPage() {
  return (
    <Suspense fallback={
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Loading…</p>
      </main>
    }>
      <EditForm />
    </Suspense>
  );
}

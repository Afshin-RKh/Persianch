"use client";
import { useEffect, useState, Suspense, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/Skeletons";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
const RichTextEditor = lazy(() => import("@/components/RichTextEditor"));

const API  = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const TAGS = ["survival guides", "legal", "transportation", "travel guides"];
const LANGUAGES = [
  { value: "en", label: "English" }, { value: "fa", label: "فارسی" },
  { value: "de", label: "Deutsch"  }, { value: "fr", label: "Français" },
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
  const { success: toastSuccess, error: toastError } = useToast();

  const [post, setPost]           = useState<PostData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const [form, setForm] = useState({
    title: "", content: "", cover_image: "", country: "", city: "", status: "approved", language: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);
    setConfirmDel(false);
    try {
      const res = await fetch(`${API}/blog.php?id=${post.id}`, { method: "DELETE", headers: authHeaders(token) });
      if (!res.ok) throw new Error("Failed to delete");
      toastSuccess("Post deleted.");
      router.push("/admin");
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Delete failed.");
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
          title: data.title ?? "", content: data.content ?? "",
          cover_image: data.cover_image ?? "", country: data.country ?? "",
          city: data.city ?? "", status: data.status ?? "approved",
          language: data.language ?? "",
        });
        setSelectedTags(data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : []);
      })
      .catch(() => toastError("Failed to load post."))
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
      toastSuccess("Post saved!");
      setSuccess(true);
      setTimeout(() => {
        if (form.status === "approved") router.push(`/blog/post?slug=${post.slug}`);
        else router.push("/admin");
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!user || !isAdmin) return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Admin access required.</p></main>;
  if (loading) return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="skeleton h-4 w-64 rounded-xl" />
      <div className="skeleton h-[500px] w-full rounded-2xl" />
    </main>
  );
  if (!post) return (
    <main className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
      <p className="text-5xl mb-4">📄</p>
      <p className="font-semibold text-gray-700 mb-2">Post not found.</p>
      <Link href="/admin" className="mt-4 inline-block hover:underline text-sm" style={{ color: "#1B3A6B" }}>← Back to Admin</Link>
    </main>
  );

  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];
  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";
  const isFarsi = form.language === "fa";

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <ConfirmModal
        open={confirmDel}
        title={`Delete "${post.title}"?`}
        message="This will permanently remove the post. This action cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(false)}
      />

      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">← Back to Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Edit Post</h1>
          <p className="text-sm text-gray-400 mt-1 truncate max-w-xs">{post.title}</p>
        </div>
      </div>

      {success && (
        <div role="status" className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6 font-medium flex items-center gap-2">
          ✓ Saved! Redirecting in 2.5s…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inp}>
            <option value="approved">✓ Approved — visible to public</option>
            <option value="pending">⏳ Pending — awaiting review</option>
            <option value="rejected">✗ Rejected — hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(({ value, label }) => (
              <button key={value} type="button"
                onClick={() => setForm((f) => ({ ...f, language: f.language === value ? "" : value }))}
                aria-pressed={form.language === value}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] ${
                  form.language === value ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B]"
                }`}
                style={form.language === value ? { backgroundColor: "#1B3A6B" } : {}}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
          <input type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            dir={isFarsi ? "rtl" : "ltr"}
            className={inp}
            style={isFarsi ? { fontFamily: "'Vazirmatn', sans-serif" } : {}} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cover Image URL</label>
          <input type="text" value={form.cover_image}
            onChange={(e) => { setForm({ ...form, cover_image: e.target.value }); setImgError(false); }}
            placeholder="https://images.unsplash.com/…" className={inp} />
          {form.cover_image && !imgError && (
            <img src={form.cover_image} alt="" className="mt-2 h-32 w-full object-cover rounded-xl"
              onError={() => setImgError(true)} />
          )}
          {form.cover_image && imgError && (
            <p className="mt-1.5 text-xs text-red-500">⚠ This URL doesn't load a valid image.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                aria-pressed={selectedTags.includes(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] ${
                  selectedTags.includes(tag) ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B]"
                }`}
                style={selectedTags.includes(tag) ? { backgroundColor: "#1B3A6B" } : {}}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Content {isFarsi && <span className="text-gray-400 font-normal">(راست به چپ)</span>}
          </label>
          <Suspense fallback={<div className="h-48 skeleton rounded-xl" />}>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              dir={isFarsi ? "rtl" : "ltr"}
            />
          </Suspense>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500 text-sm">⚠</span>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#8B1A1A]"
              style={{ backgroundColor: "#8B1A1A" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <Link href="/admin" className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
          <button type="button" onClick={() => setConfirmDel(true)} disabled={deleting}
            className="text-red-600 text-sm font-semibold hover:text-red-700 transition-colors disabled:opacity-50 px-3 py-2 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300">
            🗑 Delete Post
          </button>
        </div>
      </form>
    </main>
  );
}

export default function EditBlogPostPage() {
  return (
    <Suspense fallback={
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-[500px] w-full rounded-2xl" />
      </main>
    }>
      <EditForm />
    </Suspense>
  );
}

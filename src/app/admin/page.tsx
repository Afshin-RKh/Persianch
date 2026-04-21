"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";

const BLOG_REGIONS = (country: string) => REGIONS_BY_COUNTRY[country] ?? [];
import { Trash2, CheckCircle, XCircle, Edit2, ChevronDown, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://afshin.ch/persianch/api";

type BizForm = {
  name: string; name_fa: string; category: string; canton: string; country: string;
  address: string; phone: string; website: string; email: string; instagram: string;
  description: string; description_fa: string; google_maps_url: string;
  image_url: string; logo_url: string; lat: string; lng: string;
  is_featured: boolean; is_verified: boolean; is_approved: boolean;
};

const EMPTY_BIZ: BizForm = {
  name: "", name_fa: "", category: "restaurant", canton: "Zurich", country: "Switzerland",
  address: "", phone: "", website: "", email: "", instagram: "",
  description: "", description_fa: "", google_maps_url: "",
  image_url: "", logo_url: "", lat: "", lng: "",
  is_featured: false, is_verified: false, is_approved: true,
};

type Tab = "posts" | "businesses" | "users";

function BizForm({ title, form, setForm, onSubmit, loading, success, onClose, isEdit }: {
  title: string; form: BizForm; setForm: (f: BizForm) => void;
  onSubmit: (e: React.FormEvent) => void; loading: boolean; success: boolean;
  onClose: () => void; isEdit: boolean;
}) {
  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];
  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

  return (
    <div className="bg-white rounded-2xl border border-[#1B3A6B]/20 p-6 mb-2 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
      </div>
      {success && <p className="text-green-600 text-sm mb-3 font-medium">{isEdit ? "Saved!" : "Business added!"}</p>}

      <form onSubmit={onSubmit} className="space-y-5">

        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name (English) *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name (Persian)</label>
            <input type="text" value={form.name_fa} onChange={(e) => setForm({ ...form, name_fa: e.target.value })} className={inp} dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.label_en}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, canton: "" })} className={inp}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Region / Canton / State</label>
            {regions.length > 0 ? (
              <select value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} className={inp}>
                <option value="">— select —</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input type="text" value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} placeholder="Region or city" className={inp} />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([["phone", "Phone"], ["email", "Email"], ["website", "Website URL"], ["instagram", "Instagram handle"], ["google_maps_url", "Google Maps URL"]] as const).map(([k, label]) => (
            <div key={k}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
              <input type="text" value={(form as unknown as Record<string, string>)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inp} />
            </div>
          ))}
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description (English)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Persian)</label>
            <textarea value={form.description_fa} onChange={(e) => setForm({ ...form, description_fa: e.target.value })} rows={3} dir="rtl" className={`${inp} resize-none`} />
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cover Image URL</label>
            <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className={inp} />
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-20 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = "none")} />}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Logo URL</label>
            <input type="text" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className={inp} />
            {form.logo_url && <img src={form.logo_url} alt="" className="mt-2 h-20 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = "none")} />}
          </div>
        </div>

        {/* Coordinates */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Coordinates <span className="text-gray-400 font-normal">(used for map pin)</span></p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="e.g. 47.3769" className={inp} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="e.g. 8.5417" className={inp} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Find coordinates: right-click any location on Google Maps → &quot;What&apos;s here?&quot;</p>
        </div>

        {/* Flags */}
        <div className="flex gap-5">
          {(["is_featured", "is_verified", "is_approved"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="rounded accent-red-600" />
              {k.replace("is_", "")}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading || !form.name}
          className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: "#8B1A1A" }}>
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Business"}
        </button>
      </form>
    </div>
  );
}

const POST_TAGS = ["restaurant", "cafe", "survival guides", "legal", "transportation"];

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  author_name: string;
  created_at: string;
  tags?: string;
  country?: string;
  city?: string;
}

interface BusinessRow {
  id: number;
  name: string; name_fa?: string; category: string; canton: string; country: string;
  address?: string; phone?: string; website?: string; email?: string; instagram?: string;
  description?: string; description_fa?: string; google_maps_url?: string;
  is_approved: boolean; is_featured: boolean; is_verified: boolean;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  blog_count: number;
  comment_count: number;
}

export default function AdminPage() {
  const { user, token, isAdmin, isSuperAdmin, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");

  const [posts, setPosts]           = useState<BlogPost[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Edit blog post inline
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState<{ tags: string[]; country: string; city: string; status: string }>({ tags: [], country: "", city: "", status: "approved" });
  const [postSaving, setPostSaving] = useState(false);

  // Add / Edit business form
  const [showAddBiz, setShowAddBiz] = useState(false);
  const [editBiz, setEditBiz]       = useState<BusinessRow | null>(null);
  const [bizForm, setBizForm]       = useState<BizForm>(EMPTY_BIZ);
  const [bizLoading, setBizLoading] = useState(false);
  const [bizSuccess, setBizSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/auth/signin");
  }, [loading, isAdmin, router]);

  const loadData = useCallback(async () => {
    if (!token || !isAdmin) return;
    setDataLoading(true);
    try {
      if (tab === "posts") {
        const r = await fetch(`${API}/blog.php?pending=1`, { headers: authHeaders(token) });
        const all = await fetch(`${API}/blog.php`, { headers: authHeaders(token) });
        const pending = await r.json();
        const approved = await all.json();
        const combined: BlogPost[] = [...(Array.isArray(pending) ? pending : []), ...(Array.isArray(approved) ? approved : [])];
        const seen = new Set<number>();
        setPosts(combined.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }));
      }
      if (tab === "businesses") {
        const r = await fetch(`${API}/businesses.php`, { headers: authHeaders(token) });
        setBusinesses(await r.json());
      }
      if (tab === "users" && isSuperAdmin) {
        const r = await fetch(`${API}/users.php`, { headers: authHeaders(token) });
        setUsers(await r.json());
      }
    } finally {
      setDataLoading(false);
    }
  }, [tab, token, isAdmin, isSuperAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const updatePostStatus = async (id: number, status: string) => {
    await fetch(`${API}/blog.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id, status }),
    });
    loadData();
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`${API}/blog.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };

  const openEditPost = (p: BlogPost) => {
    setEditPost(p);
    setPostForm({
      tags: p.tags ? p.tags.split(",").map((t) => t.trim()) : [],
      country: p.country ?? "",
      city: p.city ?? "",
      status: p.status,
    });
  };

  const savePostMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPost) return;
    setPostSaving(true);
    await fetch(`${API}/blog.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: editPost.id, tags: postForm.tags, country: postForm.country, city: postForm.city, status: postForm.status }),
    });
    setPostSaving(false);
    setEditPost(null);
    loadData();
  };

  const deleteBusiness = async (id: number) => {
    if (!confirm("Delete this business?")) return;
    await fetch(`${API}/businesses.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const changeUserRole = async (id: number, role: string) => {
    await fetch(`${API}/users.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id, role }),
    });
    loadData();
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`${API}/users.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };

  const openEdit = (b: BusinessRow) => {
    setEditBiz(b);
    setBizForm({
      name: b.name ?? "", name_fa: b.name_fa ?? "", category: b.category ?? "restaurant",
      canton: b.canton ?? "", country: b.country ?? "Switzerland", address: b.address ?? "",
      phone: b.phone ?? "", website: b.website ?? "", email: b.email ?? "",
      instagram: b.instagram ?? "", description: b.description ?? "",
      description_fa: b.description_fa ?? "", google_maps_url: b.google_maps_url ?? "",
      image_url: (b as any).image_url ?? "", logo_url: (b as any).logo_url ?? "",
      lat: (b as any).lat?.toString() ?? "", lng: (b as any).lng?.toString() ?? "",
      is_featured: !!b.is_featured, is_verified: !!b.is_verified, is_approved: !!b.is_approved,
    });
    setShowAddBiz(false);
  };

  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizLoading(true);
    try {
      const isEdit = !!editBiz;
      const res = await fetch(`${API}/businesses.php`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(isEdit ? { id: editBiz.id, ...bizForm } : bizForm),
      });
      const data = await res.json();
      if (data.success) {
        setBizSuccess(true);
        setBizForm(EMPTY_BIZ);
        setTimeout(() => { setBizSuccess(false); setEditBiz(null); setShowAddBiz(false); loadData(); }, 1200);
      }
    } finally {
      setBizLoading(false);
    }
  };

  if (loading || !user) return null;
  if (!isAdmin) return null;

  const TABS: { key: Tab; label: string }[] = [
    { key: "posts", label: "Blog Posts" },
    { key: "businesses", label: "Businesses" },
    ...(isSuperAdmin ? [{ key: "users" as Tab, label: "Users" }] : []),
  ];

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { user: "bg-gray-100 text-gray-600", admin: "bg-blue-100 text-blue-700", superadmin: "bg-purple-100 text-purple-700" };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[role] ?? colors.user}`}>{role}</span>;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] ?? ""}`}>{status}</span>;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Signed in as <span className="font-semibold">{user.name}</span> · {user.role}</p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors">← Back to site</Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-100 pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-colors ${
              tab === t.key ? "text-white" : "text-gray-500 hover:text-gray-800 bg-transparent"
            }`}
            style={tab === t.key ? { backgroundColor: "#1B3A6B" } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {dataLoading && <p className="text-gray-400 text-sm">Loading...</p>}

      {/* BLOG POSTS TAB */}
      {tab === "posts" && !dataLoading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">All Posts ({posts.length})</h2>
            <Link href="/blog/write" className="text-white text-sm font-semibold px-4 py-2 rounded-xl" style={{ backgroundColor: "#8B1A1A" }}>
              + New Post
            </Link>
          </div>
          <div className="space-y-3">
            {posts.length === 0 && <p className="text-gray-400 text-sm">No posts yet.</p>}
            {posts.map((p) => (
              <div key={p.id}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(p.status)}
                      <span className="text-xs text-gray-400">by {p.author_name ?? "unknown"} · {new Date(p.created_at).toLocaleDateString()}</span>
                      {(p.city || p.country) && <span className="text-xs text-gray-400">· {[p.city, p.country].filter(Boolean).join(", ")}</span>}
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                    {p.tags && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags.split(",").map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: "#EEF2FF", color: "#1B3A6B" }}>{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.status === "pending" && (
                      <>
                        <button onClick={() => updatePostStatus(p.id, "approved")} title="Approve" className="text-green-500 hover:text-green-700 transition-colors">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => updatePostStatus(p.id, "rejected")} title="Reject" className="text-red-400 hover:text-red-600 transition-colors">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    {p.status === "rejected" && (
                      <button onClick={() => updatePostStatus(p.id, "approved")} title="Approve anyway" className="text-green-500 hover:text-green-700 transition-colors">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => editPost?.id === p.id ? setEditPost(null) : openEditPost(p)} title="Edit tags/location" className="text-gray-400 hover:text-[#1B3A6B] transition-colors">
                      <Edit2 size={16} />
                    </button>
                    {p.status === "approved" && (
                      <Link href={`/blog/post?slug=${p.slug}`} target="_blank" className="text-xs text-[#1B3A6B] hover:underline font-medium">View</Link>
                    )}
                    <button onClick={() => deletePost(p.id)} title="Delete" className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editPost?.id === p.id && (
                  <form onSubmit={savePostMeta} className="bg-gray-50 rounded-2xl border border-[#1B3A6B]/10 p-5 mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Edit tags &amp; location</p>
                      <button type="button" onClick={() => setEditPost(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {POST_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setPostForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }))}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${
                              postForm.tags.includes(tag) ? "text-white border-transparent" : "text-gray-600 border-gray-200 hover:border-[#1B3A6B]"
                            }`}
                            style={postForm.tags.includes(tag) ? { backgroundColor: "#1B3A6B" } : {}}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                        <select value={postForm.country} onChange={(e) => setPostForm((f) => ({ ...f, country: e.target.value, city: "" }))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white">
                          <option value="">— none —</option>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Region / City</label>
                        {BLOG_REGIONS(postForm.country).length > 0 ? (
                          <select value={postForm.city} onChange={(e) => setPostForm((f) => ({ ...f, city: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white">
                            <option value="">— none —</option>
                            {BLOG_REGIONS(postForm.country).map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={postForm.city} onChange={(e) => setPostForm((f) => ({ ...f, city: e.target.value }))}
                            placeholder="City or region" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                      <select value={postForm.status} onChange={(e) => setPostForm((f) => ({ ...f, status: e.target.value }))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                        <option value="approved">approved</option>
                        <option value="pending">pending</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </div>
                    <button type="submit" disabled={postSaving} className="text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: "#8B1A1A" }}>
                      {postSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUSINESSES TAB */}
      {tab === "businesses" && !dataLoading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">All Businesses ({businesses.length})</h2>
            <button
              onClick={() => { setShowAddBiz((v) => !v); setEditBiz(null); setBizForm(EMPTY_BIZ); }}
              className="text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              + Add Business <ChevronDown size={14} className={showAddBiz ? "rotate-180" : ""} />
            </button>
          </div>

          {/* Add business form */}
          {showAddBiz && !editBiz && (
            <BizForm
              title="New Business"
              form={bizForm}
              setForm={setBizForm}
              onSubmit={submitBusiness}
              loading={bizLoading}
              success={bizSuccess}
              onClose={() => setShowAddBiz(false)}
              isEdit={false}
            />
          )}

          <div className="space-y-2">
            {businesses.length === 0 && <p className="text-gray-400 text-sm">No businesses.</p>}
            {businesses.map((b) => (
              <div key={b.id}>
                <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.category} · {b.canton}, {b.country}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link href={`/businesses/detail?id=${b.id}`} className="text-xs text-[#1B3A6B] hover:underline font-medium">View</Link>
                    <button onClick={() => { openEdit(b); setShowAddBiz(false); }} className="text-gray-400 hover:text-[#1B3A6B] transition-colors" title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteBusiness(b.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {editBiz?.id === b.id && (
                  <div className="mt-2 mb-2">
                    <BizForm
                      title={`Editing: ${b.name}`}
                      form={bizForm}
                      setForm={setBizForm}
                      onSubmit={submitBusiness}
                      loading={bizLoading}
                      success={bizSuccess}
                      onClose={() => setEditBiz(null)}
                      isEdit={true}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB (superadmin only) */}
      {tab === "users" && isSuperAdmin && !dataLoading && (
        <div>
          <h2 className="font-bold text-gray-800 mb-4">All Users ({users.length})</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    {roleBadge(u.role)}
                  </div>
                  <p className="text-xs text-gray-400">{u.email} · {u.blog_count} posts · {u.comment_count} comments · joined {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.id !== user.id && (
                    <>
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                      <button onClick={() => deleteUser(u.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                  {u.id === user.id && <span className="text-xs text-gray-400 italic">you</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

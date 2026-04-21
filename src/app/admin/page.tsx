"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { CATEGORIES } from "@/types";
import { Trash2, CheckCircle, XCircle, Edit2, ChevronDown } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://afshin.ch/persianch/api";

type Tab = "posts" | "businesses" | "users";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  author_name: string;
  created_at: string;
}

interface BusinessRow {
  id: number;
  name: string;
  category: string;
  canton: string;
  country: string;
  is_approved: boolean;
  is_featured: boolean;
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

  // Add business form
  const [showAddBiz, setShowAddBiz] = useState(false);
  const [bizForm, setBizForm] = useState({
    name: "", name_fa: "", category: "restaurant", canton: "Zurich", country: "Switzerland",
    address: "", phone: "", website: "", email: "", instagram: "",
    description: "", description_fa: "", google_maps_url: "",
    is_featured: false, is_verified: false, is_approved: true,
  });
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

  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizLoading(true);
    try {
      const res = await fetch(`${API}/businesses.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(bizForm),
      });
      const data = await res.json();
      if (data.success) {
        setBizSuccess(true);
        setBizForm({ name: "", name_fa: "", category: "restaurant", canton: "Zurich", country: "Switzerland", address: "", phone: "", website: "", email: "", instagram: "", description: "", description_fa: "", google_maps_url: "", is_featured: false, is_verified: false, is_approved: true });
        setTimeout(() => { setBizSuccess(false); setShowAddBiz(false); loadData(); }, 1500);
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
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(p.status)}
                    <span className="text-xs text-gray-400">by {p.author_name ?? "unknown"} · {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{p.title}</p>
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
                  {p.status === "approved" && (
                    <Link href={`/blog/post?slug=${p.slug}`} className="text-gray-400 hover:text-[#1B3A6B] transition-colors" title="View">
                      <Edit2 size={16} />
                    </Link>
                  )}
                  {p.status === "rejected" && (
                    <button onClick={() => updatePostStatus(p.id, "approved")} title="Approve anyway" className="text-green-500 hover:text-green-700 transition-colors">
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button onClick={() => deletePost(p.id)} title="Delete" className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
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
              onClick={() => setShowAddBiz((v) => !v)}
              className="text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              + Add Business <ChevronDown size={14} className={showAddBiz ? "rotate-180" : ""} />
            </button>
          </div>

          {/* Add business form */}
          {showAddBiz && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">New Business</h3>
              {bizSuccess && <p className="text-green-600 text-sm mb-3 font-medium">Business added!</p>}
              <form onSubmit={submitBusiness} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["name", "name_fa", "address", "phone", "email", "website", "instagram", "google_maps_url"] as const).map((k) => (
                    <div key={k}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{k.replace(/_/g, " ")}</label>
                      <input type="text" value={(bizForm as unknown as Record<string, string>)[k]} onChange={(e) => setBizForm({ ...bizForm, [k]: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                    <select value={bizForm.category} onChange={(e) => setBizForm({ ...bizForm, category: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                      {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.label_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                    <input type="text" value={bizForm.country} onChange={(e) => setBizForm({ ...bizForm, country: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description (English)</label>
                  <textarea value={bizForm.description} onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })} rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none" />
                </div>
                <div className="flex gap-4">
                  {(["is_featured", "is_verified", "is_approved"] as const).map((k) => (
                    <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={bizForm[k]} onChange={(e) => setBizForm({ ...bizForm, [k]: e.target.checked })} className="rounded accent-red-600" />
                      {k.replace("is_", "")}
                    </label>
                  ))}
                </div>
                <button type="submit" disabled={bizLoading || !bizForm.name}
                  className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: "#8B1A1A" }}>
                  {bizLoading ? "Saving..." : "Add Business"}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {businesses.length === 0 && <p className="text-gray-400 text-sm">No businesses.</p>}
            {businesses.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.category} · {b.canton}, {b.country}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link href={`/businesses/detail?id=${b.id}`} className="text-xs text-[#1B3A6B] hover:underline font-medium">View</Link>
                  <button onClick={() => deleteBusiness(b.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
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

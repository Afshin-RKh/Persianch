"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import LocationSelector, { type Location } from "@/components/LocationSelector";
import {
  Trash2, CheckCircle, XCircle, Edit2, ChevronDown, X, Eye,
  Users, Building2, FileText, Shield,
  ChevronRight, Save,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";

type Tab = "posts" | "businesses" | "users";

// ── Types ────────────────────────────────────────────────────────────────────
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

interface BlogPost {
  id: number; title: string; slug: string; status: string;
  author_name: string; created_at: string; tags?: string; country?: string; city?: string;
}
interface BusinessRow {
  id: number; name: string; name_fa?: string; category: string; canton: string; country: string;
  address?: string; phone?: string; website?: string; email?: string; instagram?: string;
  description?: string; description_fa?: string; google_maps_url?: string;
  is_approved: boolean; is_featured: boolean; is_verified: boolean;
  owner_user_id?: number; owner_name?: string; owner_email?: string;
}
interface UserRow {
  id: number; name: string; email: string; role: string; avatar?: string;
  created_at: string; blog_count: number; comment_count: number;
  owned_businesses_count?: number; owned_businesses_names?: string;
}
interface UserProfile {
  id: number; name: string; email: string; role: string; avatar?: string; created_at: string;
  interest_locations: Location[];
  blog_posts: { id: number; title: string; slug: string; status: string; created_at: string }[];
  comments: { id: number; content: string; entity_type: string; created_at: string }[];
  admin_locations?: Location[];
  activity_log?: { action: string; entity_type: string; entity_id: number; entity_name: string; created_at: string }[];
  owned_businesses?: { id: number; name: string; category: string; country: string; canton: string; is_approved: boolean }[];
}

// ── Badges ───────────────────────────────────────────────────────────────────
const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    user: "bg-gray-100 text-gray-600",
    business_owner: "bg-amber-100 text-amber-700",
    admin: "bg-blue-100 text-blue-700",
    superadmin: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = { user: "User", business_owner: "Business Owner", admin: "Admin", superadmin: "Super Admin" };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[role] ?? map.user}`}>{labels[role] ?? role}</span>;
};
const statusBadge = (status: string) => {
  const map: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-500"}`}>{status}</span>;
};
const actionBadge = (action: string) => {
  const map: Record<string, string> = { create: "bg-green-100 text-green-700", update: "bg-blue-100 text-blue-700", delete: "bg-red-100 text-red-600", approve: "bg-emerald-100 text-emerald-700", reject: "bg-orange-100 text-orange-700" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[action] ?? "bg-gray-100 text-gray-600"}`}>{action}</span>;
};

// ── Business Form ─────────────────────────────────────────────────────────────


function BizFormPanel({ title, form, setForm, onSubmit, loading, success, onClose, isEdit, ownerUsers, assignOwner, setAssignOwner }: {
  title: string; form: BizForm; setForm: (f: BizForm) => void;
  onSubmit: (e: React.FormEvent) => void; loading: boolean; success: boolean; onClose: () => void; isEdit: boolean;
  ownerUsers: UserRow[]; assignOwner: string; setAssignOwner: (v: string) => void;
}) {
  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];
  return (
    <div className="bg-white rounded-2xl border border-[#1B3A6B]/15 shadow-sm mb-2 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
      </div>
      {success && <div className="px-6 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-medium">{isEdit ? "✓ Changes saved" : "✓ Business added"}</div>}
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* Location */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Location</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, canton: "" })} className={inp}>
                {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Region / City</label>
              {regions.length > 0
                ? <select value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} className={inp}>
                    <option value="">— select —</option>
                    {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                : <input type="text" value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} placeholder="City or region" className={inp} />
              }
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.label_en}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Names */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Business Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (English) *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (Persian)</label>
              <input type="text" value={form.name_fa} onChange={(e) => setForm({ ...form, name_fa: e.target.value })} className={inp} dir="rtl" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["phone", "email", "website", "instagram", "google_maps_url"] as const).map((k) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{k.replace("_", " ")}</label>
                <input type="text" value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inp} />
              </div>
            ))}
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Description</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">English</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inp} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Persian</label>
              <textarea value={form.description_fa} onChange={(e) => setForm({ ...form, description_fa: e.target.value })} rows={3} dir="rtl" className={`${inp} resize-none`} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Images</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["image_url", "logo_url"] as const).map((k) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{k === "image_url" ? "Cover Image URL" : "Logo URL"}</label>
                <input type="text" value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder="https://..." className={inp} />
                {(form as any)[k] && <img src={(form as any)[k]} alt="" className="mt-2 h-16 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = "none")} />}
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Coordinates</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude</label>
              <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="47.3769" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="8.5417" className={inp} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Right-click on Google Maps → &ldquo;What&apos;s here?&rdquo;</p>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-4">
          {(["is_featured", "is_verified", "is_approved"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="rounded accent-[#8B1A1A] w-4 h-4" />
              <span className="capitalize">{k.replace("is_", "")}</span>
            </label>
          ))}
        </div>

        {/* Business Owner */}
        {isEdit && ownerUsers.length >= 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Business Owner</p>
            <select value={assignOwner} onChange={(e) => setAssignOwner(e.target.value)} className={inp}>
              <option value="">— No owner assigned —</option>
              {ownerUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email}) · {u.role}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Assigning promotes the user to &ldquo;Business Owner&rdquo; role automatically.</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading || !form.name}
            className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#8B1A1A" }}>
            <Save size={14} />{loading ? "Saving…" : isEdit ? "Save Changes" : "Add Business"}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ── User Profile Inspector (superadmin) ──────────────────────────────────────
function UserProfilePanel({ profile, onClose, token, onSaveAdminLocs }: {
  profile: UserProfile; onClose: () => void; token: string | null;
  onSaveAdminLocs: (uid: number, locs: Location[]) => void;
}) {
  const [adminLocs, setAdminLocs] = useState<Location[]>(profile.admin_locations ?? []);
  const [locTab, setLocTab] = useState<"info" | "locs" | "activity">("info");

  const isAdmin = profile.role === "admin" || profile.role === "superadmin";
  const tabs = [
    { key: "info" as const, label: "Info" },
    ...(isAdmin ? [{ key: "locs" as const, label: "Locations" }, { key: "activity" as const, label: "Activity" }] : []),
  ];

  return (
    <div className="mt-1 mb-2 bg-[#f8f9ff] border border-[#1B3A6B]/15 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1B3A6B]/10 bg-[#1B3A6B]/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1B3A6B" }}>
            {profile.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{profile.name}</p>
            <p className="text-xs text-gray-500">{profile.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white transition-colors"><X size={15} /></button>
      </div>

      {/* Sub-tabs */}
      {tabs.length > 1 && (
        <div className="flex border-b border-gray-100 bg-white">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setLocTab(t.key)}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${locTab === t.key ? "text-[#1B3A6B] border-b-2 border-[#1B3A6B]" : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        {locTab === "info" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Blog Posts", profile.blog_posts.length],
                ["Comments", profile.comments.length],
                ["Joined", new Date(profile.created_at).toLocaleDateString()],
              ].map(([label, val]) => (
                <div key={label as string} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-base font-bold text-gray-900">{val}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
            {/* Interest locations */}
            {profile.interest_locations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Interest Locations</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interest_locations.map((l, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{l.city}, {l.country}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Owned businesses */}
            {profile.owned_businesses && profile.owned_businesses.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-700 mb-2">Assigned Businesses ({profile.owned_businesses.length})</p>
                <div className="space-y-1.5">
                  {profile.owned_businesses.map((b) => (
                    <div key={b.id}>
                      <p className="text-sm font-bold text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-500">{b.canton}, {b.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Recent posts */}
            {profile.blog_posts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Recent Posts</p>
                <div className="space-y-1.5">
                  {profile.blog_posts.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${p.status === "approved" ? "bg-green-100 text-green-700" : p.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>{p.status}</span>
                      <span className="text-sm text-gray-700 truncate">{p.title}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {locTab === "locs" && isAdmin && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Cities this admin is allowed to manage businesses in.</p>
            <LocationSelector selected={adminLocs} onChange={setAdminLocs} label="Add location" />
            <button onClick={() => onSaveAdminLocs(profile.id, adminLocs)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl"
              style={{ backgroundColor: "#1B3A6B" }}>
              <Save size={12} /> Save Locations
            </button>
          </div>
        )}

        {locTab === "activity" && isAdmin && (
          <div>
            {!profile.activity_log?.length
              ? <p className="text-sm text-gray-400">No actions recorded.</p>
              : <div className="space-y-2">
                  {profile.activity_log.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                      {actionBadge(e.action)}
                      <span className="text-xs text-gray-400 capitalize">{e.entity_type}</span>
                      <span className="text-sm text-gray-800 font-medium flex-1 truncate">{e.entity_name ?? `#${e.entity_id}`}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(e.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, token, isAdmin, isSuperAdmin, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");

  const [posts, setPosts]           = useState<BlogPost[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Blog
  const [postSearch, setPostSearch]   = useState("");
  const [postTag, setPostTag]         = useState("");
  const [postCountry, setPostCountry] = useState("");

  // Business
  const [bizSearch, setBizSearch]     = useState("");
  const [bizCountry, setBizCountry]   = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [bizApproved, setBizApproved] = useState<"all" | "approved" | "pending">("all");
  const [showAddBiz, setShowAddBiz]   = useState(false);
  const [editBiz, setEditBiz]         = useState<BusinessRow | null>(null);
  const [bizForm, setBizForm]         = useState<BizForm>(EMPTY_BIZ);
  const [bizLoading, setBizLoading]   = useState(false);
  const [bizSuccess, setBizSuccess]   = useState(false);
  const [assignOwner, setAssignOwner] = useState("");
  const [ownerUsers, setOwnerUsers]   = useState<UserRow[]>([]);

  // Users
  const [inspectUser, setInspectUser]       = useState<number | null>(null);
  const [inspectProfile, setInspectProfile] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch]         = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userCountry, setUserCountry]       = useState("");
  const [assignBizUser, setAssignBizUser]   = useState<number | null>(null);
  const [assignBizId, setAssignBizId]       = useState("");
  const [assignBizSaving, setAssignBizSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace("/auth/signin");
  }, [loading, isAdmin, router]);

  const loadData = useCallback(async () => {
    if (!token || !isAdmin) return;
    setDataLoading(true);
    try {
      if (tab === "posts") {
        const [r1, r2] = await Promise.all([
          fetch(`${API}/blog.php?pending=1`, { headers: authHeaders(token) }),
          fetch(`${API}/blog.php`, { headers: authHeaders(token) }),
        ]);
        const [pending, approved] = await Promise.all([r1.json(), r2.json()]);
        const combined: BlogPost[] = [...(Array.isArray(pending) ? pending : []), ...(Array.isArray(approved) ? approved : [])];
        const seen = new Set<number>();
        setPosts(combined.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }));
      }
      if (tab === "businesses") {
        const r = await fetch(`${API}/businesses.php`, { headers: authHeaders(token) });
        setBusinesses(await r.json());
        // Pre-fetch users for owner assignment
        const ur = await fetch(`${API}/users.php`, { headers: authHeaders(token) });
        const all = await ur.json();
        setOwnerUsers(Array.isArray(all) ? all.filter((u: UserRow) => u.role === "user" || u.role === "business_owner") : []);
      }
      if (tab === "users") {
        const [ur, br] = await Promise.all([
          fetch(`${API}/users.php`, { headers: authHeaders(token) }),
          fetch(`${API}/businesses.php`, { headers: authHeaders(token) }),
        ]);
        setUsers(await ur.json());
        setBusinesses(await br.json());
      }
    } finally {
      setDataLoading(false);
    }
  }, [tab, token, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Blog actions ───────────────────────────────────────────────────────────
  const updatePostStatus = async (id: number, status: string) => {
    await fetch(`${API}/blog.php`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ id, status }) });
    loadData();
  };
  const deletePost = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`${API}/blog.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };

  // ── Business actions ───────────────────────────────────────────────────────
  const deleteBusiness = async (id: number) => {
    if (!confirm("Delete this business?")) return;
    await fetch(`${API}/businesses.php`, { method: "DELETE", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ id }) });
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
    setAssignOwner(b.owner_user_id ? String(b.owner_user_id) : "");
    setShowAddBiz(false);
  };
  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizLoading(true);
    try {
      const isEdit = !!editBiz;
      const body = isEdit
        ? { id: editBiz!.id, ...bizForm, owner_user_id: assignOwner ? parseInt(assignOwner) : null }
        : bizForm;
      const res  = await fetch(`${API}/businesses.php`, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setBizSuccess(true);
        setTimeout(() => { setBizSuccess(false); setEditBiz(null); setShowAddBiz(false); loadData(); }, 1200);
      }
    } finally { setBizLoading(false); }
  };

  // ── User actions ───────────────────────────────────────────────────────────
  const changeUserRole = async (id: number, role: string) => {
    await fetch(`${API}/users.php`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ id, role }) });
    loadData();
  };
  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user? Cannot be undone.")) return;
    await fetch(`${API}/users.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };
  const openInspect = async (uid: number) => {
    if (inspectUser === uid) { setInspectUser(null); setInspectProfile(null); return; }
    setInspectUser(uid);
    setInspectProfile(null);
    const r = await fetch(`${API}/users.php?user_id=${uid}`, { headers: authHeaders(token) });
    setInspectProfile(await r.json());
  };
  const saveAdminLocs = async (uid: number, locs: Location[]) => {
    await fetch(`${API}/locations.php`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ user_id: uid, locations: locs }) });
    setInspectUser(null); setInspectProfile(null);
  };
  const assignBusinessToUser = async (userId: number) => {
    if (!assignBizId) return;
    setAssignBizSaving(true);
    await fetch(`${API}/businesses.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: parseInt(assignBizId), owner_user_id: userId }),
    });
    setAssignBizSaving(false);
    setAssignBizId("");
    loadData();
  };
  const unassignBusinessFromUser = async (bizId: number) => {
    setAssignBizSaving(true);
    await fetch(`${API}/businesses.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: bizId, owner_user_id: null }),
    });
    setAssignBizSaving(false);
    loadData();
  };

  if (loading || !user) return null;
  if (!isAdmin) return null;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "posts",      label: "Blog Posts",  icon: <FileText size={15} /> },
    { key: "businesses", label: "Businesses",  icon: <Building2 size={15} /> },
    { key: "users",      label: "Users",       icon: <Users size={15} /> },
  ];

  const POST_TAGS = ["restaurant", "cafe", "survival guides", "legal", "transportation"];
  const postCountries = [...new Set(posts.map((p) => p.country).filter(Boolean))] as string[];

  const filteredPosts = posts.filter((p) => {
    if (postCountry && p.country !== postCountry) return false;
    if (postTag && !(p.tags ?? "").split(",").map((t) => t.trim()).includes(postTag)) return false;
    if (postSearch.trim()) {
      const q = postSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.author_name ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const bizCountries = [...new Set(businesses.map((b) => b.country).filter(Boolean))] as string[];

  const filteredBiz = businesses.filter((b) => {
    if (bizCategory && b.category !== bizCategory) return false;
    if (bizCountry && b.country !== bizCountry) return false;
    if (bizApproved === "approved" && !b.is_approved) return false;
    if (bizApproved === "pending" && b.is_approved) return false;
    if (bizSearch.trim()) {
      const q = bizSearch.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.canton?.toLowerCase().includes(q) || b.country?.toLowerCase().includes(q);
    }
    return true;
  });

  const userCountries = [...new Set(
    businesses.filter((b) => b.owner_user_id).map((b) => b.country).filter(Boolean)
  )] as string[];

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (userCountry) {
      const userBizCountries = businesses.filter((b) => b.owner_user_id === u.id).map((b) => b.country);
      if (!userBizCountries.includes(userCountry)) return false;
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f5f6fa" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1B3A6B" }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
              <span className="text-gray-400 text-xs ml-2">{user.name} · {user.role}</span>
            </div>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-[#1B3A6B] transition-colors font-medium flex items-center gap-1">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Posts", value: posts.length || "—", color: "#8B1A1A", icon: <FileText size={18} /> },
            { label: "Businesses", value: businesses.length || "—", color: "#1B3A6B", icon: <Building2 size={18} /> },
            { label: "Users", value: users.length || "—", color: "#C9A84C", icon: <Users size={18} /> },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-2xl border border-gray-100 p-1 shadow-sm w-fit">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                tab === t.key ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
              style={tab === t.key ? { backgroundColor: "#1B3A6B" } : {}}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm">Loading…</p>
          </div>
        )}

        {/* ── BLOG POSTS TAB ─────────────────────────────────────────────────── */}
        {tab === "posts" && !dataLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Blog Posts <span className="text-gray-400 font-normal text-sm">({filteredPosts.length}/{posts.length})</span></h2>
              <Link href="/blog/write" className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-opacity hover:opacity-90" style={{ backgroundColor: "#8B1A1A" }}>
                + New Post
              </Link>
            </div>
            <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap gap-2">
              <input type="text" placeholder="Search title or author…" value={postSearch} onChange={(e) => setPostSearch(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] flex-1 min-w-40" />
              <select value={postTag} onChange={(e) => setPostTag(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                <option value="">All tags</option>
                {POST_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={postCountry} onChange={(e) => setPostCountry(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                <option value="">All countries</option>
                {postCountries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {filteredPosts.length === 0
              ? <p className="text-gray-400 text-sm p-6">No posts match your filters.</p>
              : <div className="divide-y divide-gray-50">
                {filteredPosts.map((p) => (
                  <div key={p.id}>
                    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {statusBadge(p.status)}
                          <span className="text-xs text-gray-400">by {p.author_name ?? "unknown"} · {new Date(p.created_at).toLocaleDateString()}</span>
                          {(p.city || p.country) && <span className="text-xs text-gray-400">· {[p.city, p.country].filter(Boolean).join(", ")}</span>}
                        </div>
                        <p className="font-semibold text-gray-900 truncate text-sm">{p.title}</p>
                        {p.tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.tags.split(",").map((t) => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EEF2FF", color: "#1B3A6B" }}>{t.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {p.status === "pending" && <>
                          <button onClick={() => updatePostStatus(p.id, "approved")} title="Approve" className="text-green-500 hover:text-green-700 transition-colors"><CheckCircle size={17} /></button>
                          <button onClick={() => updatePostStatus(p.id, "rejected")} title="Reject" className="text-red-400 hover:text-red-600 transition-colors"><XCircle size={17} /></button>
                        </>}
                        {p.status === "rejected" && <button onClick={() => updatePostStatus(p.id, "approved")} title="Approve" className="text-green-500 hover:text-green-700 transition-colors"><CheckCircle size={17} /></button>}
                        <Link href={`/blog/post?slug=${p.slug}`} title="View post" className="text-gray-300 hover:text-[#C9A84C] transition-colors"><Eye size={15} /></Link>
                        <Link href={`/blog/edit?id=${p.id}`} title="Edit post" className="text-gray-300 hover:text-[#1B3A6B] transition-colors"><Edit2 size={15} /></Link>
                        <button onClick={() => deletePost(p.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* ── BUSINESSES TAB ─────────────────────────────────────────────────── */}
        {tab === "businesses" && !dataLoading && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Businesses <span className="text-gray-400 font-normal text-sm">({filteredBiz.length}/{businesses.length})</span></h2>
                <button onClick={() => { setShowAddBiz((v) => !v); setEditBiz(null); setBizForm(EMPTY_BIZ); setAssignOwner(""); }}
                  className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl" style={{ backgroundColor: "#8B1A1A" }}>
                  + Add <ChevronDown size={13} className={showAddBiz ? "rotate-180" : ""} />
                </button>
              </div>
              <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap gap-2">
                <input type="text" placeholder="Search…" value={bizSearch} onChange={(e) => setBizSearch(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] flex-1 min-w-40" />
                <select value={bizCategory} onChange={(e) => setBizCategory(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="">All categories</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.label_en}</option>)}
                </select>
                <select value={bizCountry} onChange={(e) => setBizCountry(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="">All countries</option>
                  {bizCountries.sort().map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={bizApproved} onChange={(e) => setBizApproved(e.target.value as any)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="all">All statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {showAddBiz && !editBiz && (
              <BizFormPanel title="New Business" form={bizForm} setForm={setBizForm} onSubmit={submitBusiness}
                loading={bizLoading} success={bizSuccess} onClose={() => setShowAddBiz(false)} isEdit={false}
                ownerUsers={ownerUsers} assignOwner={assignOwner} setAssignOwner={setAssignOwner} />
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filteredBiz.length === 0
                ? <p className="text-gray-400 text-sm p-6">No businesses match your filters.</p>
                : <div className="divide-y divide-gray-50">
                  {filteredBiz.map((b) => (
                    <div key={b.id}>
                      <div className={`px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors ${!b.is_approved ? "opacity-60" : ""}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-gray-50 border border-gray-100">
                          {CATEGORIES.find((c) => c.slug === b.category)?.icon ?? "🏪"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm truncate">{b.name}</p>
                            {!b.is_approved && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">pending</span>}
                            {b.is_featured && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C9A84C]/15 text-[#C9A84C] flex-shrink-0">featured</span>}
                          </div>
                          <p className="text-xs text-gray-400">{b.canton}, {b.country}</p>
                          {b.owner_name && <p className="text-xs text-amber-600 font-medium mt-0.5">👤 {b.owner_name}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/businesses/detail?id=${b.id}`} className="text-xs text-[#1B3A6B] hover:underline font-medium">View</Link>
                          <button onClick={() => { openEdit(b); setShowAddBiz(false); }}
                            className={`transition-colors p-1 rounded-lg hover:bg-gray-100 ${editBiz?.id === b.id ? "text-[#1B3A6B]" : "text-gray-400 hover:text-[#1B3A6B]"}`} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteBusiness(b.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {editBiz?.id === b.id && (
                        <div className="px-3 pb-3">
                          <BizFormPanel title={`Editing: ${b.name}`} form={bizForm} setForm={setBizForm} onSubmit={submitBusiness}
                            loading={bizLoading} success={bizSuccess} onClose={() => setEditBiz(null)} isEdit={true}
                            ownerUsers={ownerUsers} assignOwner={assignOwner} setAssignOwner={setAssignOwner} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {/* ── USERS TAB ──────────────────────────────────────────────────────── */}
        {tab === "users" && !dataLoading && (
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">
                  {isSuperAdmin ? "All Users" : "Users in Your Region"}
                  <span className="text-gray-400 font-normal text-sm ml-2">({filteredUsers.length})</span>
                </h2>
              </div>
              <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap gap-2">
                <input type="text" placeholder="Search by name or email…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] flex-1 min-w-40" />
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="">All roles</option>
                  <option value="user">User</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                </select>
                <select value={userCountry} onChange={(e) => setUserCountry(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="">All countries</option>
                  {userCountries.sort().map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filteredUsers.length === 0
                ? <p className="text-gray-400 text-sm p-6">No users found.</p>
                : <div className="divide-y divide-gray-50">
                  {filteredUsers.map((u) => (
                    <div key={u.id}>
                      <div
                        className={`px-5 py-3.5 flex items-center gap-3 transition-colors ${isSuperAdmin && u.id !== user.id ? "cursor-pointer hover:bg-[#1B3A6B]/5" : "hover:bg-gray-50/50"} ${inspectUser === u.id ? "bg-[#1B3A6B]/5" : ""}`}
                        onClick={() => { if (isSuperAdmin && u.id !== user.id) openInspect(u.id); }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1B3A6B" }}>
                          {u.avatar ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" /> : u.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                            {roleBadge(u.role)}
                            {isSuperAdmin && u.id !== user.id && (
                              <ChevronRight size={13} className={`text-gray-300 transition-transform ${inspectUser === u.id ? "rotate-90 text-[#1B3A6B]" : ""}`} />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{u.email} · {u.blog_count} posts · joined {new Date(u.created_at).toLocaleDateString()}</p>
                          {(u.owned_businesses_count ?? 0) > 0 && <p className="text-xs text-amber-600 font-medium mt-0.5">👤 {u.owned_businesses_count} business{u.owned_businesses_count === 1 ? "" : "es"}: {u.owned_businesses_names}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {u.id !== user.id ? (
                            <>
                              {/* Assign business — all admins */}
                              {(u.role === "user" || u.role === "business_owner") && (
                                <button
                                  onClick={() => { setAssignBizUser(assignBizUser === u.id ? null : u.id); setAssignBizId(""); }}
                                  className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 ${assignBizUser === u.id ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"}`}
                                  title="Assign business">
                                  <Building2 size={14} />
                                </button>
                              )}
                              {isSuperAdmin && (
                                <select value={u.role} onChange={(e) => changeUserRole(u.id, e.target.value)}
                                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]">
                                  <option value="user">user</option>
                                  <option value="business_owner">business owner</option>
                                  <option value="admin">admin</option>
                                </select>
                              )}
                              {isSuperAdmin && (
                                <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic px-2">you</span>
                          )}
                        </div>
                      </div>

                      {/* Assign business panel */}
                      {assignBizUser === u.id && (() => {
                        const userBizIds = new Set(businesses.filter(b => b.owner_user_id === u.id).map(b => b.id));
                        const userBizList = businesses.filter(b => b.owner_user_id === u.id);
                        const available = businesses.filter(b => !userBizIds.has(b.id));
                        return (
                          <div className="mx-5 mb-3 p-4 bg-amber-50 border border-amber-200 rounded-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5"><Building2 size={13} /> Businesses for {u.name}</p>
                              <button onClick={() => setAssignBizUser(null)} className="text-amber-400 hover:text-amber-600"><X size={14} /></button>
                            </div>
                            {userBizList.length > 0 && (
                              <div className="mb-3 space-y-1.5">
                                {userBizList.map(b => (
                                  <div key={b.id} className="flex items-center justify-between bg-white border border-amber-200 rounded-xl px-3 py-2">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                                      <p className="text-xs text-gray-400">{b.canton}, {b.country}</p>
                                    </div>
                                    <button disabled={assignBizSaving} onClick={() => unassignBusinessFromUser(b.id)}
                                      className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 disabled:opacity-40">
                                      <X size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {available.length > 0 && (
                              <div className="flex gap-2">
                                <select value={assignBizId} onChange={(e) => setAssignBizId(e.target.value)}
                                  className="flex-1 border border-amber-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                                  <option value="">— Add a business —</option>
                                  {available.map(b => (
                                    <option key={b.id} value={b.id}>
                                      {b.name} — {b.canton}, {b.country}{b.owner_name ? ` (owned by ${b.owner_name})` : ""}
                                    </option>
                                  ))}
                                </select>
                                <button disabled={assignBizSaving || !assignBizId} onClick={() => assignBusinessToUser(u.id)}
                                  className="text-xs font-semibold px-4 py-2 text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                                  style={{ backgroundColor: "#8B1A1A" }}>
                                  <Save size={12} /> {assignBizSaving ? "…" : "Add"}
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-amber-600 mt-2">Adding a business auto-promotes the user to Business Owner.</p>
                          </div>
                        );
                      })()}

                      {/* Profile inspector (superadmin) */}
                      {inspectUser === u.id && (
                        inspectProfile
                          ? <div className="px-3 pb-3">
                              <UserProfilePanel profile={inspectProfile} onClose={() => { setInspectUser(null); setInspectProfile(null); }} token={token} onSaveAdminLocs={saveAdminLocs} />
                            </div>
                          : <div className="px-5 pb-4 text-xs text-gray-400">Loading…</div>
                      )}
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

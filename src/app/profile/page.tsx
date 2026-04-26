"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import LocationSelector, { type Location } from "@/components/LocationSelector";
import { CATEGORIES } from "@/types";
import { Save, LogOut } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://afshin.ch/persianch/api";

type Tab = "profile" | "locations" | "activity" | "business" | "admin";

interface ProfileData {
  id: number; name: string; email: string; role: string; avatar?: string; created_at: string;
  interest_locations: Location[];
  blog_posts: { id: number; title: string; slug: string; status: string; created_at: string }[];
  comments: { id: number; content: string; entity_type: string; entity_id: number; created_at: string }[];
  admin_locations?: Location[];
  activity_log?: { action: string; entity_type: string; entity_id: number; entity_name: string; created_at: string }[];
  owned_business?: {
    id: number; name: string; name_fa?: string; category: string; country: string; canton: string;
    address?: string; phone?: string; website?: string; email?: string; instagram?: string;
    description?: string; description_fa?: string; google_maps_url?: string;
    image_url?: string; logo_url?: string; is_approved: boolean;
  } | null;
}

const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

export default function ProfilePage() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);

  // Business form (for business_owner)
  const [bizForm, setBizForm] = useState<Record<string, string>>({});
  const [bizSaving, setBizSaving] = useState(false);
  const [bizSaved, setBizSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/signin");
  }, [loading, user, router]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    const r = await fetch(`${API}/profile.php`, { headers: authHeaders(token) });
    if (!r.ok) return;
    const data: ProfileData = await r.json();
    setProfile(data);
    setName(data.name);
    setLocations(data.interest_locations ?? []);
    if (data.owned_business) {
      const b = data.owned_business;
      setBizForm({
        name: b.name ?? "", name_fa: b.name_fa ?? "",
        description: b.description ?? "", description_fa: b.description_fa ?? "",
        phone: b.phone ?? "", website: b.website ?? "", email: b.email ?? "",
        instagram: b.instagram ?? "", address: b.address ?? "",
        google_maps_url: b.google_maps_url ?? "",
        image_url: b.image_url ?? "", logo_url: b.logo_url ?? "",
      });
    }
  }, [token]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Default tab based on role
  useEffect(() => {
    if (!profile) return;
    if (profile.role === "business_owner") setTab("business");
  }, [profile?.role]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    await fetch(`${API}/profile.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ name: name || undefined, password: password || undefined, locations }),
    });
    setSaved(true);
    setPassword("");
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
    loadProfile();
  };

  const saveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile?.owned_business) return;
    setBizSaving(true);
    await fetch(`${API}/businesses.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: profile.owned_business.id, ...bizForm }),
    });
    setBizSaved(true);
    setTimeout(() => setBizSaved(false), 2000);
    setBizSaving(false);
    loadProfile();
  };

  const roleBadge = (role: string) => {
    const map: Record<string, [string, string]> = {
      user: ["bg-gray-100 text-gray-600", "User"],
      business_owner: ["bg-amber-100 text-amber-700", "Business Owner"],
      admin: ["bg-blue-100 text-blue-700", "Admin"],
      superadmin: ["bg-purple-100 text-purple-700", "Super Admin"],
    };
    const [cls, label] = map[role] ?? map.user;
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
  };

  const actionBadge = (action: string) => {
    const map: Record<string, string> = {
      create: "bg-green-100 text-green-700",
      update: "bg-blue-100 text-blue-700",
      delete: "bg-red-100 text-red-600",
      approve: "bg-emerald-100 text-emerald-700",
      reject: "bg-orange-100 text-orange-700",
    };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[action] ?? "bg-gray-100 text-gray-600"}`}>{action}</span>;
  };

  if (loading || !user || !profile) return null;

  const isAdmin  = profile.role === "admin" || profile.role === "superadmin";
  const isBizOwner = profile.role === "business_owner";

  const TABS: { key: Tab; label: string }[] = [
    { key: "profile",   label: "Profile" },
    { key: "locations", label: "My Locations" },
    { key: "activity",  label: "Activity" },
    ...(isBizOwner ? [{ key: "business" as Tab, label: "My Business" }] : []),
    ...(isAdmin    ? [{ key: "admin"    as Tab, label: "Admin Info" }] : []),
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: "#1B3A6B" }}>
          {profile.avatar
            ? <img src={profile.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            : profile.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
            {roleBadge(profile.role)}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isAdmin && <Link href="/admin" className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white" style={{ backgroundColor: "#1B3A6B" }}>Admin Panel</Link>}
          <button onClick={() => { logout(); router.replace("/"); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl text-red-600 border border-red-200 flex items-center gap-1 hover:bg-red-50 transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              tab === t.key ? "text-white" : "text-gray-500 hover:text-gray-800"
            }`}
            style={tab === t.key ? { backgroundColor: "#1B3A6B" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 mb-1">Edit Profile</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input type="email" value={profile.email} disabled className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={inp} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
              style={{ backgroundColor: "#8B1A1A" }}>
              <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
          </div>
        </form>
      )}

      {/* LOCATIONS TAB */}
      {tab === "locations" && (
        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 mb-1">Interest Locations</h2>
          <p className="text-sm text-gray-500">Cities you&apos;re interested in — used for future notifications and personalisation.</p>
          <LocationSelector selected={locations} onChange={setLocations} label="Add location" />
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
              style={{ backgroundColor: "#8B1A1A" }}>
              <Save size={14} /> {saving ? "Saving…" : "Save Locations"}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
          </div>
        </form>
      )}

      {/* ACTIVITY TAB */}
      {tab === "activity" && (
        <div className="space-y-4">
          {/* Blog posts */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-3">Blog Posts ({profile.blog_posts.length})</h2>
            {profile.blog_posts.length === 0
              ? <p className="text-sm text-gray-400">No posts yet.</p>
              : <div className="space-y-2">
                {profile.blog_posts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.status === "approved" ? "bg-green-100 text-green-700"
                      : p.status === "pending" ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"}`}>{p.status}</span>
                    <Link href={`/blog/post?slug=${p.slug}`} className="text-sm text-gray-800 hover:text-[#1B3A6B] hover:underline truncate">{p.title}</Link>
                    <span className="text-xs text-gray-400 flex-shrink-0">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            }
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-3">Recent Comments ({profile.comments.length})</h2>
            {profile.comments.length === 0
              ? <p className="text-sm text-gray-400">No comments yet.</p>
              : <div className="space-y-2">
                {profile.comments.map((c) => (
                  <div key={c.id} className="text-sm text-gray-700 border-l-2 border-gray-100 pl-3 py-1">
                    <p className="line-clamp-2">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.entity_type} · {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}

      {/* MY BUSINESS TAB (business_owner) */}
      {tab === "business" && isBizOwner && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {!profile.owned_business
            ? <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No business assigned to you yet.</p>
                <p className="text-xs text-gray-400 mt-1">Contact your regional admin to get a business assigned.</p>
              </div>
            : <>
                <div className="flex items-center gap-3 mb-5">
                  <div>
                    <h2 className="font-bold text-gray-800">{profile.owned_business.name}</h2>
                    <p className="text-xs text-gray-400">
                      {CATEGORIES.find((c) => c.slug === profile.owned_business!.category)?.icon}{" "}
                      {profile.owned_business.canton}, {profile.owned_business.country}
                      {" · "}
                      <span className={profile.owned_business.is_approved ? "text-green-600" : "text-yellow-600"}>
                        {profile.owned_business.is_approved ? "Approved" : "Pending approval"}
                      </span>
                    </p>
                  </div>
                </div>

                <form onSubmit={saveBusiness} className="space-y-4">
                  {[
                    ["Business Name (English)", "name", "text"],
                    ["Business Name (Persian)", "name_fa", "text"],
                    ["Phone", "phone", "tel"],
                    ["Website", "website", "url"],
                    ["Email", "email", "email"],
                    ["Instagram", "instagram", "text"],
                    ["Address", "address", "text"],
                    ["Google Maps URL", "google_maps_url", "url"],
                    ["Logo URL", "logo_url", "url"],
                    ["Image URL", "image_url", "url"],
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                      <input type={type} value={bizForm[key] ?? ""} onChange={(e) => setBizForm({ ...bizForm, [key]: e.target.value })}
                        className={inp} dir={key === "name_fa" ? "rtl" : "ltr"} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description (English)</label>
                    <textarea value={bizForm.description ?? ""} onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })}
                      rows={3} className={`${inp} resize-none`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Persian)</label>
                    <textarea value={bizForm.description_fa ?? ""} onChange={(e) => setBizForm({ ...bizForm, description_fa: e.target.value })}
                      rows={3} className={`${inp} resize-none`} dir="rtl" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={bizSaving}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                      style={{ backgroundColor: "#8B1A1A" }}>
                      <Save size={14} /> {bizSaving ? "Saving…" : "Save Business Info"}
                    </button>
                    {bizSaved && <span className="text-green-600 text-sm font-medium">Saved!</span>}
                  </div>
                </form>
              </>
          }
        </div>
      )}

      {/* ADMIN INFO TAB */}
      {tab === "admin" && isAdmin && (
        <div className="space-y-4">
          {/* Assigned management locations */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-3">Your Management Locations</h2>
            {profile.role === "superadmin"
              ? <p className="text-sm text-gray-500">Superadmin — you can manage all locations.</p>
              : profile.admin_locations?.length === 0
                ? <p className="text-sm text-gray-400">No locations assigned yet. Contact a superadmin.</p>
                : <div className="flex flex-wrap gap-2">
                    {profile.admin_locations?.map((loc, i) => (
                      <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B]">
                        📍 {loc.city}, {loc.country}
                      </span>
                    ))}
                  </div>
            }
          </div>

          {/* Activity log */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-3">Activity Log</h2>
            {!profile.activity_log?.length
              ? <p className="text-sm text-gray-400">No actions recorded yet.</p>
              : <div className="space-y-2">
                  {profile.activity_log.map((entry, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
                      {actionBadge(entry.action)}
                      <span className="text-gray-500 text-xs capitalize">{entry.entity_type}</span>
                      <span className="text-gray-800 font-medium flex-1 truncate">{entry.entity_name ?? `#${entry.entity_id}`}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(entry.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}
    </main>
  );
}

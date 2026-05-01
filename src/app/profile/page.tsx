"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import LocationSelector, { type Location } from "@/components/LocationSelector";
import { CATEGORIES } from "@/types";
import {
  Save, LogOut, User, MapPin, Activity, Briefcase, Shield,
  FileText, MessageSquare, Building2, Calendar, Mail, ChevronRight
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

type Tab = "profile" | "locations" | "activity" | "business" | "admin";

interface ProfileData {
  id: number; name: string; email: string; role: string; avatar?: string; created_at: string;
  interest_locations: Location[];
  blog_posts: { id: number; title: string; slug: string; status: string; created_at: string }[];
  comments: { id: number; content: string; entity_type: string; entity_id: number; created_at: string }[];
  admin_locations?: Location[];
  activity_log?: { action: string; entity_type: string; entity_id: number; entity_name: string; created_at: string }[];
  owned_businesses?: {
    id: number; name: string; name_fa?: string; category: string; country: string; canton: string;
    address?: string; phone?: string; website?: string; email?: string; instagram?: string;
    description?: string; description_fa?: string; google_maps_url?: string;
    image_url?: string; logo_url?: string; is_approved: boolean;
  }[];
}

const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B] transition-colors bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

const ROLE_META: Record<string, { label: string; cls: string; icon: string }> = {
  user:           { label: "Member",         cls: "bg-gray-100 text-gray-600",       icon: "👤" },
  business_owner: { label: "Business Owner", cls: "bg-amber-50 text-amber-700 border border-amber-200", icon: "🏪" },
  admin:          { label: "Admin",          cls: "bg-blue-50 text-blue-700 border border-blue-200",   icon: "🛡️" },
  superadmin:     { label: "Super Admin",    cls: "bg-purple-50 text-purple-700 border border-purple-200", icon: "⚡" },
};

const ACTION_META: Record<string, string> = {
  create:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  update:  "bg-blue-50 text-blue-700 border border-blue-200",
  delete:  "bg-red-50 text-red-600 border border-red-200",
  approve: "bg-green-50 text-green-700 border border-green-200",
  reject:  "bg-orange-50 text-orange-700 border border-orange-200",
};

const POST_STATUS: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

export default function ProfilePage() {
  const { user, token, logout, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);

  const [bizForm, setBizForm] = useState<Record<string, string>>({});
  const [bizSaving, setBizSaving] = useState(false);
  const [bizSaved, setBizSaved] = useState(false);
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);

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
    if (data.owned_businesses && data.owned_businesses.length > 0) {
      const b = data.owned_businesses[0];
      setSelectedBizId(b.id);
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
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
    loadProfile();
  };

  const saveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBizId) return;
    setBizSaving(true);
    await fetch(`${API}/businesses.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: selectedBizId, ...bizForm }),
    });
    setBizSaved(true);
    setTimeout(() => setBizSaved(false), 2500);
    setBizSaving(false);
    loadProfile();
  };

  if (loading || !user || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isAdmin    = profile.role === "admin" || profile.role === "superadmin";
  const isBizOwner = profile.role === "business_owner";
  const roleMeta   = ROLE_META[profile.role] ?? ROLE_META.user;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",   label: "Profile",      icon: <User size={14} /> },
    { key: "locations", label: "Locations",    icon: <MapPin size={14} /> },
    { key: "activity",  label: "Activity",     icon: <Activity size={14} /> },
    ...(isBizOwner ? [{ key: "business" as Tab, label: "My Business", icon: <Briefcase size={14} /> }] : []),
    ...(isAdmin    ? [{ key: "admin"    as Tab, label: "Admin Info",  icon: <Shield size={14} /> }] : []),
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #1B3A6B 100%)" }} className="pt-10 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 border-2 border-white/20 overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              {profile.avatar
                ? <Image src={profile.avatar} alt={profile.name} width={72} height={72} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold">{profile.name[0]?.toUpperCase()}</span>}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleMeta.cls}`}>
                  {roleMeta.icon} {roleMeta.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Mail size={12} className="text-white/40" />
                <p className="text-sm text-white/60">{profile.email}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar size={12} className="text-white/40" />
                <p className="text-xs text-white/50">Member since {new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {isAdmin && (
                <Link href="/admin"
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors">
                  <Shield size={12} /> Admin Panel
                </Link>
              )}
              <button onClick={() => { logout(); router.replace("/"); }}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-400/20 flex items-center gap-1.5 transition-colors">
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Posts",    value: profile.blog_posts.length,   icon: <FileText size={16} /> },
              { label: "Comments", value: profile.comments.length,     icon: <MessageSquare size={16} /> },
              { label: "Locations",value: profile.interest_locations.length, icon: <MapPin size={16} /> },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="flex justify-center mb-1 text-white/50">{s.icon}</div>
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 mb-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                tab === t.key
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
              style={tab === t.key ? { backgroundColor: "#1B3A6B" } : {}}>
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-gray-800 text-base mb-5">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" value={profile.email} disabled className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <label className={labelCls}>Change Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password" className={inp} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: "#8B1A1A" }}>
                  <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
                </button>
                {saved && <span className="text-emerald-600 text-sm font-semibold">✓ Saved!</span>}
              </div>
            </div>
          </form>
        )}

        {/* LOCATIONS TAB */}
        {tab === "locations" && (
          <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-gray-800 text-base mb-1">Interest Locations</h2>
            <p className="text-sm text-gray-400 mb-5">Cities you&apos;re interested in — for future notifications and personalisation.</p>
            <LocationSelector selected={locations} onChange={setLocations} label="Add location" />
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#8B1A1A" }}>
                <Save size={14} /> {saving ? "Saving…" : "Save Locations"}
              </button>
              {saved && <span className="text-emerald-600 text-sm font-semibold">✓ Saved!</span>}
            </div>
          </form>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-[#1B3A6B]" />
                <h2 className="font-bold text-gray-800">Blog Posts</h2>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{profile.blog_posts.length}</span>
              </div>
              {profile.blog_posts.length === 0
                ? <div className="text-center py-8">
                    <FileText size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No posts yet.</p>
                    <Link href="/blog/write" className="text-sm text-[#1B3A6B] font-semibold hover:underline mt-1 inline-block">Write your first post →</Link>
                  </div>
                : <div className="space-y-2">
                    {profile.blog_posts.map((p) => (
                      <Link key={p.id} href={`/blog/post?slug=${p.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${POST_STATUS[p.status] ?? POST_STATUS.pending}`}>
                          {p.status}
                        </span>
                        <span className="text-sm text-gray-800 group-hover:text-[#1B3A6B] flex-1 truncate">{p.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{new Date(p.created_at).toLocaleDateString()}</span>
                        <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
              }
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-[#1B3A6B]" />
                <h2 className="font-bold text-gray-800">Comments</h2>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{profile.comments.length}</span>
              </div>
              {profile.comments.length === 0
                ? <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No comments yet.</p>
                  </div>
                : <div className="space-y-2">
                    {profile.comments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-700 line-clamp-2">{c.content}</p>
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                          <span className="capitalize px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 text-[10px]">{c.entity_type}</span>
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}

        {/* MY BUSINESS TAB */}
        {tab === "business" && isBizOwner && (() => {
          const bizList = profile.owned_businesses ?? [];
          const activeBiz = bizList.find(b => b.id === selectedBizId) ?? null;
          const switchBiz = (b: typeof bizList[0]) => {
            setSelectedBizId(b.id);
            setBizForm({
              name: b.name ?? "", name_fa: b.name_fa ?? "",
              description: b.description ?? "", description_fa: b.description_fa ?? "",
              phone: b.phone ?? "", website: b.website ?? "", email: b.email ?? "",
              instagram: b.instagram ?? "", address: b.address ?? "",
              google_maps_url: b.google_maps_url ?? "",
              image_url: b.image_url ?? "", logo_url: b.logo_url ?? "",
            });
          };
          return (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
            {bizList.length === 0
              ? <div className="text-center py-12">
                  <Building2 size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-600 font-semibold">No business assigned yet</p>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Contact your regional admin to get a business assigned to your account.</p>
                </div>
              : <>
                  {/* Business selector (multiple) */}
                  {bizList.length > 1 && (
                    <div className="flex gap-2 flex-wrap mb-5 pb-4 border-b border-gray-100">
                      {bizList.map(b => (
                        <button key={b.id} type="button" onClick={() => switchBiz(b)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${selectedBizId === b.id ? "border-[#1B3A6B] bg-[#1B3A6B] text-white" : "border-gray-200 text-gray-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"}`}>
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeBiz && <>
                  {/* Business header */}
                  <div className="flex items-start gap-3 mb-6 pb-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#1B3A6B" }}>
                      <Building2 size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-900">{activeBiz.name}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {CATEGORIES.find((c) => c.slug === activeBiz.category)?.label_en} ·{" "}
                        {activeBiz.canton}, {activeBiz.country}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 border ${
                      activeBiz.is_approved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {activeBiz.is_approved ? "✓ Approved" : "⏳ Pending"}
                    </span>
                  </div>

                  <form onSubmit={saveBusiness} className="space-y-5">
                    <Section title="Basic Info">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[["Business Name (English)", "name", "text"], ["Business Name (Persian)", "name_fa", "text"]].map(([label, key, type]) => (
                          <div key={key}>
                            <label className={labelCls}>{label}</label>
                            <input type={type} value={bizForm[key] ?? ""} onChange={(e) => setBizForm({ ...bizForm, [key]: e.target.value })}
                              className={inp} dir={key === "name_fa" ? "rtl" : "ltr"} />
                          </div>
                        ))}
                      </div>
                    </Section>

                    <Section title="Contact">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[["Phone", "phone", "tel"], ["Email", "email", "email"], ["Website", "website", "url"], ["Instagram", "instagram", "text"]].map(([label, key, type]) => (
                          <div key={key}>
                            <label className={labelCls}>{label}</label>
                            <input type={type} value={bizForm[key] ?? ""} onChange={(e) => setBizForm({ ...bizForm, [key]: e.target.value })} className={inp} />
                          </div>
                        ))}
                      </div>
                    </Section>

                    <Section title="Location">
                      <div>
                        <label className={labelCls}>Address</label>
                        <input type="text" value={bizForm.address ?? ""} onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })} className={inp} />
                      </div>
                      <div className="mt-3">
                        <label className={labelCls}>Google Maps URL</label>
                        <input type="url" value={bizForm.google_maps_url ?? ""} onChange={(e) => setBizForm({ ...bizForm, google_maps_url: e.target.value })} className={inp} />
                      </div>
                    </Section>

                    <Section title="Description">
                      <div className="space-y-3">
                        <div>
                          <label className={labelCls}>English</label>
                          <textarea value={bizForm.description ?? ""} onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })}
                            rows={4} className={`${inp} resize-none`} />
                        </div>
                        <div>
                          <label className={labelCls}>Persian / فارسی</label>
                          <textarea value={bizForm.description_fa ?? ""} onChange={(e) => setBizForm({ ...bizForm, description_fa: e.target.value })}
                            rows={4} className={`${inp} resize-none`} dir="rtl" />
                        </div>
                      </div>
                    </Section>

                    <Section title="Images">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[["Logo URL", "logo_url"], ["Cover Image URL", "image_url"]].map(([label, key]) => (
                          <div key={key}>
                            <label className={labelCls}>{label}</label>
                            <input type="url" value={bizForm[key] ?? ""} onChange={(e) => setBizForm({ ...bizForm, [key]: e.target.value })} className={inp} />
                          </div>
                        ))}
                      </div>
                    </Section>

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      <button type="submit" disabled={bizSaving}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-opacity"
                        style={{ backgroundColor: "#8B1A1A" }}>
                        <Save size={14} /> {bizSaving ? "Saving…" : "Save Business Info"}
                      </button>
                      {bizSaved && <span className="text-emerald-600 text-sm font-semibold">✓ Saved!</span>}
                    </div>
                  </form>
                  </>}
                </>
            }
          </div>
          );
        })()}

        {/* ADMIN INFO TAB */}
        {tab === "admin" && isAdmin && (
          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-[#1B3A6B]" />
                <h2 className="font-bold text-gray-800">Management Locations</h2>
              </div>
              {profile.role === "superadmin"
                ? <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="text-sm font-semibold text-purple-800">Superadmin — unrestricted access</p>
                      <p className="text-xs text-purple-500 mt-0.5">You can manage businesses in all locations.</p>
                    </div>
                  </div>
                : profile.admin_locations?.length === 0
                  ? <div className="text-center py-8">
                      <MapPin size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400">No locations assigned yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Contact a superadmin to get assigned regions.</p>
                    </div>
                  : <div className="flex flex-wrap gap-2">
                      {profile.admin_locations?.map((loc, i) => (
                        <span key={i} className="text-sm font-medium px-3 py-1.5 rounded-full bg-[#1B3A6B]/8 text-[#1B3A6B] border border-[#1B3A6B]/15 flex items-center gap-1.5">
                          <MapPin size={12} /> {loc.city}, {loc.country}
                        </span>
                      ))}
                    </div>
              }
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-[#1B3A6B]" />
                <h2 className="font-bold text-gray-800">Activity Log</h2>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {profile.activity_log?.length ?? 0}
                </span>
              </div>
              {!profile.activity_log?.length
                ? <div className="text-center py-8">
                    <Activity size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No actions recorded yet.</p>
                  </div>
                : <div className="space-y-1">
                    {profile.activity_log.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${ACTION_META[entry.action] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {entry.action}
                        </span>
                        <span className="text-xs text-gray-400 capitalize flex-shrink-0">{entry.entity_type}</span>
                        <span className="text-sm text-gray-800 font-medium flex-1 truncate">{entry.entity_name ?? `#${entry.entity_id}`}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{new Date(entry.created_at).toLocaleDateString()}</span>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>
      {children}
    </div>
  );
}

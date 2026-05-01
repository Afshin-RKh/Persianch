"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, authHeaders } from "@/lib/auth";
import { businessSlug } from "@/lib/businessSlug";
import { CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY, CitySquare, SquareLink, SQUARE_LINK_CATEGORIES, SquareLinkCategory } from "@/types";
import LocationSelector, { type Location } from "@/components/LocationSelector";
import {
  Trash2, CheckCircle, XCircle, Edit2, ChevronDown, X, Eye,
  Users, Building2, FileText, Shield,
  ChevronRight, Save, MapPin, ExternalLink, Plus,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";

type Tab = "posts" | "businesses" | "users" | "squares" | "events" | "trash" | "about";

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
  cover_image?: string; deleted_at?: string; deleted_by?: number; deleted_by_name?: string;
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
  activity_log?: { action: string; entity_type: string; entity_id: number; entity_name: string; details?: string; created_at: string }[];
  owned_businesses?: { id: number; name: string; category: string; country: string; canton: string; is_approved: boolean }[];
}

interface EventRow {
  id: number; title: string; event_type: string; country: string; city: string;
  venue?: string; start_date: string; end_date: string; is_recurring: boolean;
  recurrence_type?: string; recurrence_end_date?: string;
  external_link?: string; description?: string; organizer_name?: string; organizer_email?: string;
  status: string; created_at: string; lat?: number | null; lng?: number | null;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  concert: "🎵", show: "🎭", march: "✊", class: "📚",
  sports: "🏃", party: "🎉", other: "📌",
};

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
                    {[...regions].sort((a, b) => a.localeCompare(b)).map((r) => <option key={r} value={r}>{r}</option>)}
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
              <input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="auto-detected on save" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="auto-detected on save" className={inp} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Leave blank to auto-detect from address. Or right-click on Google Maps → &ldquo;What&apos;s here?&rdquo;</p>
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
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Managed by</p>
          {assignOwner ? (
            <p className="text-xs font-semibold mb-2" style={{ color: "#15803d" }}>
              Currently assigned to: {ownerUsers.find(u => String(u.id) === String(assignOwner))?.name ?? `User #${assignOwner}`}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mb-2">Currently managed by BiruniMap (no owner assigned)</p>
          )}
          <select value={assignOwner} onChange={(e) => setAssignOwner(e.target.value)} className={inp}>
            <option value="">— Managed by BiruniMap —</option>
            {ownerUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1.5">Assigning a user promotes them to Business Owner role automatically.</p>
        </div>

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
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 mt-0.5">{actionBadge(e.action)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{e.details ?? `${e.entity_type}: ${e.entity_name ?? `#${e.entity_id}`}`}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{e.entity_type} · {new Date(e.created_at).toLocaleString()}</p>
                      </div>
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
  const [bizPage, setBizPage] = useState(0);
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

  // Trash
  const [trashedPosts, setTrashedPosts] = useState<BlogPost[]>([]);

  // Events
  const [events, setEvents]           = useState<EventRow[]>([]);
  const [editEvent, setEditEvent]     = useState<EventRow | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatus, setEventStatus] = useState("");
  const [eventType,   setEventType]   = useState("");

  // About
  interface AboutContent {
    about_biruni_en: string; about_biruni_fa: string;
    about_story_en: string; about_story_fa: string;
    about_vision_en: string; about_vision_fa: string;
    about_mission_en: string; about_mission_fa: string;
    about_founder_quote_en: string; about_founder_quote_fa: string;
    about_founder_name: string; about_founder_name_fa: string;
  }
  const [aboutContent, setAboutContent]   = useState<AboutContent | null>(null);
  const [aboutForm, setAboutForm]         = useState<AboutContent | null>(null);
  const [aboutLoading, setAboutLoading]   = useState(false);
  const [aboutSaving, setAboutSaving]     = useState(false);
  const [aboutSuccess, setAboutSuccess]   = useState(false);

  // Squares
  const [squares, setSquares]       = useState<CitySquare[]>([]);
  const [editSquare, setEditSquare] = useState<CitySquare | null>(null);
  const [showAddSq, setShowAddSq]   = useState(false);
  type SqFormState = Omit<Partial<CitySquare>, "links"> & { links: Partial<SquareLink>[] };
  const [sqForm, setSqForm]         = useState<SqFormState>({
    name_en: "", name_fa: "", city: "", country: "", lat: 0, lng: 0,
    description_en: "", description_fa: "", is_active: true, links: [],
  });
  const [sqLoading, setSqLoading]   = useState(false);
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
        const r = await fetch(`${API}/businesses.php?list=1`, { headers: authHeaders(token) });
        const all_biz = await r.json();
        setBusinesses(Array.isArray(all_biz) ? all_biz : []);
        // Pre-fetch users for owner assignment
        const ur = await fetch(`${API}/users.php`, { headers: authHeaders(token) });
        const all = await ur.json();
        setOwnerUsers(Array.isArray(all) ? all : []);
      }
      if (tab === "users") {
        const [ur, br] = await Promise.all([
          fetch(`${API}/users.php`, { headers: authHeaders(token) }),
          fetch(`${API}/businesses.php?list=1`, { headers: authHeaders(token) }),
        ]);
        setUsers(await ur.json());
        setBusinesses(await br.json());
      }
      if (tab === "squares") {
        const r = await fetch(`${API}/city_squares.php`);
        const data = await r.json();
        setSquares(Array.isArray(data) ? data : []);
      }
      if (tab === "trash") {
        const r = await fetch(`${API}/blog.php?trash=1`, { headers: authHeaders(token) });
        const data = await r.json();
        setTrashedPosts(Array.isArray(data) ? data : []);
      }
      if (tab === "about" && isSuperAdmin) {
        if (!aboutContent) {
          setAboutLoading(true);
          const r = await fetch(`${API}/about.php`);
          const data = await r.json();
          setAboutContent(data);
          setAboutForm(data);
          setAboutLoading(false);
        }
      }
      if (tab === "events") {
        const [r1, r2] = await Promise.all([
          fetch(`${API}/events.php?pending=1`, { headers: authHeaders(token) }),
          fetch(`${API}/events.php?filter=6months`, { headers: authHeaders(token) }),
        ]);
        const [pending, approved] = await Promise.all([r1.json(), r2.json()]);
        const combined: EventRow[] = [...(Array.isArray(pending) ? pending : []), ...(Array.isArray(approved) ? approved : [])];
        const seen = new Set<number>();
        setEvents(combined.filter((e) => { if (seen.has(e.id)) return false; seen.add(e.id); return true; }));
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
    if (!confirm("Move this post to trash?")) return;
    await fetch(`${API}/blog.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };
  const restorePost = async (id: number) => {
    await fetch(`${API}/blog.php`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ id, action: "restore" }) });
    loadData();
  };
  const permanentDeletePost = async (id: number, title: string) => {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    await fetch(`${API}/blog.php?id=${id}&permanent=1`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };

  // ── Business actions ───────────────────────────────────────────────────────
  const deleteBusiness = async (id: number) => {
    if (!confirm("Delete this business?")) return;
    await fetch(`${API}/businesses.php`, { method: "DELETE", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ id }) });
    loadData();
  };
  const openEdit = async (b: BusinessRow) => {
    setShowAddBiz(false);
    const r = await fetch(`${API}/businesses.php?id=${b.id}`, { headers: authHeaders(token) });
    const full = await r.json() ?? b;
    setEditBiz(full);
    setBizForm({
      name: full.name ?? "", name_fa: full.name_fa ?? "", category: full.category ?? "restaurant",
      canton: full.canton ?? "", country: full.country ?? "Switzerland", address: full.address ?? "",
      phone: full.phone ?? "", website: full.website ?? "", email: full.email ?? "",
      instagram: full.instagram ?? "", description: full.description ?? "",
      description_fa: full.description_fa ?? "", google_maps_url: full.google_maps_url ?? "",
      image_url: full.image_url ?? "", logo_url: full.logo_url ?? "",
      lat: full.lat?.toString() ?? "", lng: full.lng?.toString() ?? "",
      is_featured: !!full.is_featured, is_verified: !!full.is_verified, is_approved: !!full.is_approved,
    });
    setAssignOwner(full.owner_user_id ? String(full.owner_user_id) : "");
  };
  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizLoading(true);
    try {
      let lat = bizForm.lat;
      let lng = bizForm.lng;
      if (!lat || !lng) {
        try {
          const q1 = [bizForm.address, bizForm.canton, bizForm.country].filter(Boolean).join(", ");
          const geo1 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q1)}&format=json&limit=1`);
          const d1 = await geo1.json();
          if (d1[0]) { lat = d1[0].lat; lng = d1[0].lon; }
          else {
            const q2 = [bizForm.canton, bizForm.country].filter(Boolean).join(", ");
            const geo2 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q2)}&format=json&limit=1`);
            const d2 = await geo2.json();
            if (d2[0]) { lat = d2[0].lat; lng = d2[0].lon; }
          }
        } catch { /* non-fatal */ }
      }
      const isEdit = !!editBiz;
      const body = isEdit
        ? { id: editBiz!.id, ...bizForm, lat, lng, owner_user_id: assignOwner ? parseInt(assignOwner) : null }
        : { ...bizForm, lat, lng };
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

  // ── Squares actions ────────────────────────────────────────────────────────
  const EMPTY_SQ: SqFormState = { name_en: "", name_fa: "", city: "", country: "", lat: 0, lng: 0, description_en: "", description_fa: "", is_active: true, links: [] };

  const openEditSq = (sq: CitySquare) => {
    setEditSquare(sq);
    setShowAddSq(false);
    setSqForm({ ...sq, links: sq.links });
  };

  const submitSquare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSqLoading(true);
    try {
      const isEdit = !!editSquare;
      const body = isEdit ? { id: editSquare!.id, ...sqForm } : sqForm;
      await fetch(`${API}/city_squares.php`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(body),
      });
      setEditSquare(null); setShowAddSq(false); setSqForm({ ...EMPTY_SQ }); loadData();
    } finally { setSqLoading(false); }
  };

  const deleteSquare = async (id: number) => {
    if (!confirm("Delete this city square?")) return;
    await fetch(`${API}/city_squares.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };

  // ── Event actions ────────────────────────────────────────────────────────────
  const updateEventStatus = async (id: number, status: string) => {
    await fetch(`${API}/events.php`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ id, status }) });
    loadData();
  };
  const deleteEvent = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`${API}/events.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    loadData();
  };

  // ── About actions ────────────────────────────────────────────────────────────
  const saveAbout = async () => {
    if (!aboutForm) return;
    setAboutSaving(true);
    try {
      await fetch(`${API}/about.php`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify(aboutForm),
      });
      setAboutContent(aboutForm);
      setAboutSuccess(true);
      setTimeout(() => setAboutSuccess(false), 3000);
    } finally {
      setAboutSaving(false);
    }
  };

  const addSqLink = () => setSqForm((f) => ({ ...f, links: [...f.links, { title_en: "", title_fa: "", url: "", category: "other" as SquareLinkCategory }] as Partial<SquareLink>[] }));
  const updateSqLink = (i: number, patch: Partial<SquareLink>) => setSqForm((f) => ({ ...f, links: f.links.map((l, idx) => idx === i ? { ...l, ...patch } : l) as Partial<SquareLink>[] }));
  const removeSqLink = (i: number) => setSqForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) as Partial<SquareLink>[] }));

  if (loading || !user) return null;
  if (!isAdmin) return null;

  const TABS: { key: Tab; label: string; icon: React.ReactNode; superOnly?: boolean }[] = [
    { key: "posts",      label: "Blog Posts",   icon: <FileText size={15} /> },
    { key: "businesses", label: "Businesses",   icon: <Building2 size={15} /> },
    { key: "users",      label: "Users",        icon: <Users size={15} /> },
    { key: "events",     label: "Events",       icon: <span className="text-sm">📅</span> },
    { key: "squares",    label: "City Squares", icon: <MapPin size={15} />, superOnly: true },
    { key: "trash",      label: "Trash",        icon: <Trash2 size={15} /> },
    { key: "about",      label: "About Page",   icon: <Shield size={15} />, superOnly: true },
  ];

  const POST_TAGS = ["survival guides", "legal", "transportation", "travel guides"];
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

  const BIZ_PAGE_SIZE = 10;
  const bizTotalPages = Math.ceil(filteredBiz.length / BIZ_PAGE_SIZE);
  const pagedBiz = filteredBiz.slice(bizPage * BIZ_PAGE_SIZE, (bizPage + 1) * BIZ_PAGE_SIZE);

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

  const filteredEvents = events.filter((ev) => {
    const q = eventSearch.toLowerCase();
    const matchSearch = !q || ev.title.toLowerCase().includes(q) || (ev.city ?? "").toLowerCase().includes(q) || (ev.country ?? "").toLowerCase().includes(q) || (ev.organizer_name ?? "").toLowerCase().includes(q);
    const matchStatus = !eventStatus || ev.status === eventStatus;
    const matchType   = !eventType   || ev.event_type === eventType;
    return matchSearch && matchStatus && matchType;
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
        <div className={`grid gap-4 mb-6 ${isSuperAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
          {[
            { label: "Posts", value: posts.length || "—", color: "#8B1A1A", icon: <FileText size={18} /> },
            { label: "Businesses", value: businesses.length || "—", color: "#1B3A6B", icon: <Building2 size={18} /> },
            { label: "Users", value: users.length || "—", color: "#C9A84C", icon: <Users size={18} /> },
            { label: "Events", value: events.length || "—", color: "#059669", icon: <span>📅</span> },
            ...(isSuperAdmin ? [{ label: "Squares", value: squares.length || "—", color: "#6B3A9E", icon: <MapPin size={18} /> }] : []),
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
          {TABS.filter((t) => !t.superOnly || isSuperAdmin).map((t) => (
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
                <input type="text" placeholder="Search…" value={bizSearch} onChange={(e) => { setBizSearch(e.target.value); setBizPage(0); }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] flex-1 min-w-40" />
                <select value={bizCategory} onChange={(e) => { setBizCategory(e.target.value); setBizPage(0); }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="">All categories</option>
                  {[...CATEGORIES].sort((a, b) => a.slug === "other" ? 1 : b.slug === "other" ? -1 : a.label_en.localeCompare(b.label_en)).map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.label_en}</option>)}
                </select>
                <select value={bizCountry} onChange={(e) => { setBizCountry(e.target.value); setBizPage(0); }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                  <option value="">All countries</option>
                  {bizCountries.sort().map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={bizApproved} onChange={(e) => { setBizApproved(e.target.value as any); setBizPage(0); }}
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
              {bizTotalPages > 1 && (
                <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <span>{filteredBiz.length} businesses · page {bizPage + 1} of {bizTotalPages}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setBizPage((p) => Math.max(0, p - 1))} disabled={bizPage === 0}
                      className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors">← Prev</button>
                    <button onClick={() => setBizPage((p) => Math.min(bizTotalPages - 1, p + 1))} disabled={bizPage >= bizTotalPages - 1}
                      className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors">Next →</button>
                  </div>
                </div>
              )}
              {filteredBiz.length === 0
                ? <p className="text-gray-400 text-sm p-6">No businesses match your filters.</p>
                : <div className="divide-y divide-gray-50">
                  {pagedBiz.map((b) => (
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
                          <p className="text-xs mt-0.5 font-medium" style={{ color: b.owner_name ? "#15803d" : "#9ca3af" }}>
                            {b.owner_name ? `Managed by owner · ${b.owner_name}` : "Managed by BiruniMap"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/businesses/detail?slug=${businessSlug(b)}`} className="text-xs text-[#1B3A6B] hover:underline font-medium">View</Link>
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
        {/* ── CITY SQUARES TAB ───────────────────────────────────────────── */}
        {tab === "squares" && !dataLoading && isSuperAdmin && (
          <div>
            {/* Add / Edit form */}
            {(showAddSq || editSquare) && (
              <div className="bg-white rounded-2xl border border-[#1B3A6B]/15 shadow-sm mb-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">{editSquare ? `Editing: ${editSquare.name_en}` : "New City Square"}</h3>
                  <button onClick={() => { setShowAddSq(false); setEditSquare(null); setSqForm({ ...EMPTY_SQ }); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                </div>
                <form onSubmit={submitSquare} className="p-6 space-y-5">
                  {/* Names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Name (English) *</label>
                      <input value={sqForm.name_en ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, name_en: e.target.value }))} required className={inp} placeholder="Zurich Square" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Name (Persian) *</label>
                      <input value={sqForm.name_fa ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, name_fa: e.target.value }))} required className={inp} dir="rtl" placeholder="میدان زوریخ" />
                    </div>
                  </div>
                  {/* Location */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                      <input value={sqForm.city ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, city: e.target.value }))} required className={inp} placeholder="Zurich" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Country *</label>
                      <input value={sqForm.country ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, country: e.target.value }))} required className={inp} placeholder="Switzerland" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude *</label>
                      <input type="number" step="any" value={sqForm.lat ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, lat: parseFloat(e.target.value) }))} required className={inp} placeholder="47.3769" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude *</label>
                      <input type="number" step="any" value={sqForm.lng ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, lng: parseFloat(e.target.value) }))} required className={inp} placeholder="8.5417" />
                    </div>
                  </div>
                  {/* Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Description (English)</label>
                      <textarea value={sqForm.description_en ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, description_en: e.target.value }))} rows={3} className={`${inp} resize-none`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Persian)</label>
                      <textarea value={sqForm.description_fa ?? ""} onChange={(e) => setSqForm((f) => ({ ...f, description_fa: e.target.value }))} rows={3} dir="rtl" className={`${inp} resize-none`} />
                    </div>
                  </div>
                  {/* Active */}
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={!!sqForm.is_active} onChange={(e) => setSqForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded accent-[#1B3A6B] w-4 h-4" />
                    Active (visible on map)
                  </label>
                  {/* Links */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Links</p>
                      <button type="button" onClick={addSqLink} className="flex items-center gap-1 text-xs font-semibold text-[#1B3A6B] hover:underline"><Plus size={12} /> Add Link</button>
                    </div>
                    {sqForm.links.length === 0 && <p className="text-xs text-gray-400 italic">No links yet. Add some below.</p>}
                    <div className="space-y-3">
                      {sqForm.links.map((l, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Title (EN) *</label>
                            <input value={l.title_en ?? ""} onChange={(e) => updateSqLink(i, { title_en: e.target.value })} className={inp} placeholder="Iranian Students Association" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Title (FA)</label>
                            <input value={l.title_fa ?? ""} onChange={(e) => updateSqLink(i, { title_fa: e.target.value })} className={inp} dir="rtl" placeholder="انجمن دانشجویان ایرانی" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                            <select value={l.category ?? "other"} onChange={(e) => updateSqLink(i, { category: e.target.value as SquareLinkCategory })} className={inp}>
                              {SQUARE_LINK_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label_en}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">URL *</label>
                            <input value={l.url ?? ""} onChange={(e) => updateSqLink(i, { url: e.target.value })} className={inp} placeholder="https://..." />
                          </div>
                          <button type="button" onClick={() => removeSqLink(i)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 self-end"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button type="submit" disabled={sqLoading || !sqForm.name_en || !sqForm.city || !sqForm.country}
                      className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
                      style={{ backgroundColor: "#1B3A6B" }}>
                      <Save size={14} />{sqLoading ? "Saving…" : editSquare ? "Save Changes" : "Create Square"}
                    </button>
                    <button type="button" onClick={() => { setShowAddSq(false); setEditSquare(null); setSqForm({ ...EMPTY_SQ }); }} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">City Squares <span className="text-gray-400 font-normal text-sm">({squares.length})</span></h2>
                <button onClick={() => { setShowAddSq((v) => !v); setEditSquare(null); setSqForm({ ...EMPTY_SQ }); }}
                  className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl" style={{ backgroundColor: "#1B3A6B" }}>
                  <Plus size={13} /> Add Square
                </button>
              </div>
              {squares.length === 0
                ? <p className="text-gray-400 text-sm p-6">No city squares yet. Create one above.</p>
                : <div className="divide-y divide-gray-50">
                  {squares.map((sq) => (
                    <div key={sq.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1B3A6B" }}>
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12,2.5 L13.82,7.73 L19.28,5.65 L17.2,11.11 L22.43,12.93 L17.2,14.75 L19.28,20.21 L13.82,18.13 L12,23.37 L10.18,18.13 L4.72,20.21 L6.8,14.75 L1.57,12.93 L6.8,11.11 L4.72,5.65 L10.18,7.73 Z" fill="#C9A84C"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm">{sq.name_en}</p>
                          <span className="text-sm text-gray-500" dir="rtl">{sq.name_fa}</span>
                          {!sq.is_active && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">inactive</span>}
                        </div>
                        <p className="text-xs text-gray-400">{sq.city}, {sq.country} · {sq.links.length} link{sq.links.length !== 1 ? "s" : ""}</p>
                        {sq.description_en && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{sq.description_en}</p>}
                        {sq.links.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sq.links.slice(0, 5).map((l) => (
                              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                                style={{ background: "#EEF2FF", color: "#1B3A6B" }}>
                                {l.title_en} <ExternalLink size={9} />
                              </a>
                            ))}
                            {sq.links.length > 5 && <span className="text-xs text-gray-400 px-2 py-0.5">+{sq.links.length - 5} more</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => openEditSq(sq)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B3A6B] hover:bg-[#1B3A6B]/10 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deleteSquare(sq.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ──────────────────────────────────────────────────────── */}
        {tab === "events" && !dataLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Events <span className="text-gray-400 font-normal text-sm">({filteredEvents.length}/{events.length})</span></h2>
              <a href="/events/submit" className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:opacity-90" style={{ backgroundColor: "#059669" }}>
                + Submit Event
              </a>
            </div>
            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative flex-1 min-w-[160px]">
                <input
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search title, city, organizer…"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                {eventSearch && <button onClick={() => setEventSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
              </div>
              <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                <option value="">All Types</option>
                {Object.entries(EVENT_TYPE_ICONS).map(([k, icon]) => (
                  <option key={k} value={k}>{icon} {k.replace(/_/g, " ")}</option>
                ))}
              </select>
              {(eventSearch || eventStatus || eventType) && (
                <button onClick={() => { setEventSearch(""); setEventStatus(""); setEventType(""); }} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-white">Clear</button>
              )}
            </div>
            {filteredEvents.length === 0
              ? <p className="text-gray-400 text-sm p-6">{events.length === 0 ? "No events yet." : "No events match your filters."}</p>
              : <div className="divide-y divide-gray-50">
                {filteredEvents.map((ev) => (
                  <div key={ev.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    {editEvent?.id === ev.id ? (
                      /* ── Inline edit form ── */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
                            <input value={editEvent.title} onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} className={inp} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                            <select value={editEvent.event_type} onChange={(e) => setEditEvent({ ...editEvent, event_type: e.target.value })} className={inp}>
                              {Object.entries(EVENT_TYPE_ICONS).map(([k, icon]) => (
                                <option key={k} value={k}>{icon} {k.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                            <input type="datetime-local" value={editEvent.start_date?.slice(0, 16)} onChange={(e) => setEditEvent({ ...editEvent, start_date: e.target.value })} className={inp} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                            <input type="datetime-local" value={editEvent.end_date?.slice(0, 16)} onChange={(e) => setEditEvent({ ...editEvent, end_date: e.target.value })} className={inp} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                            <select value={editEvent.country} onChange={(e) => setEditEvent({ ...editEvent, country: e.target.value, city: "" })} className={inp}>
                              <option value="">Select country</option>
                              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                            {(REGIONS_BY_COUNTRY[editEvent.country] ?? []).length > 0 ? (
                              <select value={editEvent.city} onChange={(e) => setEditEvent({ ...editEvent, city: e.target.value })} className={inp}>
                                <option value="">Select city</option>
                                {[...( REGIONS_BY_COUNTRY[editEvent.country] ?? [])].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            ) : (
                              <input value={editEvent.city} onChange={(e) => setEditEvent({ ...editEvent, city: e.target.value })} className={inp} placeholder="Enter city" />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Venue</label>
                            <input value={editEvent.venue ?? ""} onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })} className={inp} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select value={editEvent.status} onChange={(e) => setEditEvent({ ...editEvent, status: e.target.value })} className={inp}>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                            <textarea rows={2} value={editEvent.description ?? ""} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} className={inp + " resize-none"} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">External Link</label>
                            <input value={editEvent.external_link ?? ""} onChange={(e) => setEditEvent({ ...editEvent, external_link: e.target.value })} className={inp} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                            <input type="number" step="any" placeholder="e.g. 47.3769" value={editEvent.lat ?? ""} onChange={(e) => setEditEvent({ ...editEvent, lat: e.target.value ? parseFloat(e.target.value) : null })} className={inp} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                            <input type="number" step="any" placeholder="e.g. 8.5417" value={editEvent.lng ?? ""} onChange={(e) => setEditEvent({ ...editEvent, lng: e.target.value ? parseFloat(e.target.value) : null })} className={inp} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            await fetch(`${API}/events.php`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify(editEvent) });
                            setEditEvent(null); loadData();
                          }} className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-2 rounded-xl" style={{ backgroundColor: "#1B3A6B" }}>
                            <Save size={13} /> Save
                          </button>
                          <button onClick={() => setEditEvent(null)} className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <span className="text-2xl flex-shrink-0">{EVENT_TYPE_ICONS[ev.event_type] ?? "📌"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {statusBadge(ev.status)}
                            <span className="text-xs text-gray-400 capitalize">{ev.event_type.replace(/_/g, " ")}</span>
                            <span className="text-xs text-gray-400">· {ev.city}, {ev.country}</span>
                            {ev.is_recurring && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Recurring · {ev.recurrence_type}</span>}
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{ev.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(ev.start_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                            {ev.venue && ` · ${ev.venue}`}
                          </p>
                          {ev.organizer_name && <p className="text-xs text-gray-400 mt-0.5">By: {ev.organizer_name}{ev.organizer_email ? ` (${ev.organizer_email})` : ""}</p>}
                          <p className="text-xs mt-0.5" style={{ color: ev.lat && ev.lng ? "#6b7280" : "#f59e0b" }}>
                            📍 {ev.lat && ev.lng ? `${ev.lat.toFixed(5)}, ${ev.lng.toFixed(5)}` : "No coordinates — won't appear on map"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {ev.status === "pending" && <>
                            <button onClick={() => updateEventStatus(ev.id, "approved")} title="Approve" className="p-1.5 rounded-lg text-gray-300 hover:text-green-600 hover:bg-green-50 transition-colors"><CheckCircle size={16} /></button>
                            <button onClick={() => updateEventStatus(ev.id, "rejected")} title="Reject" className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors"><XCircle size={16} /></button>
                          </>}
                          {ev.status === "approved" && <button onClick={() => updateEventStatus(ev.id, "rejected")} title="Reject" className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors"><XCircle size={16} /></button>}
                          {ev.status === "rejected" && <button onClick={() => updateEventStatus(ev.id, "approved")} title="Approve" className="p-1.5 rounded-lg text-gray-300 hover:text-green-600 hover:bg-green-50 transition-colors"><CheckCircle size={16} /></button>}
                          <button onClick={() => setEditEvent(ev)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B3A6B] hover:bg-[#1B3A6B]/10 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => deleteEvent(ev.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* Trash */}
        {tab === "trash" && !dataLoading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Deleted Blog Posts ({trashedPosts.length})</h2>
              <p className="text-xs text-gray-400">Posts here are hidden from the site. Restore or permanently delete.</p>
            </div>
            {trashedPosts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🗑</div>
                <p className="text-sm font-medium">Trash is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trashedPosts.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-red-100 p-4 flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0">
                      {p.cover_image && <img src={p.cover_image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 line-clamp-1">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          By {p.author_name ?? "unknown"}
                          {p.country && ` · ${[p.city, p.country].filter(Boolean).join(", ")}`}
                        </p>
                        <p className="text-xs text-red-400 mt-0.5">
                          Deleted {p.deleted_at ? new Date(p.deleted_at).toLocaleDateString("en-CH", { year: "numeric", month: "short", day: "numeric" }) : ""}
                          {p.deleted_by_name && ` by ${p.deleted_by_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => restorePost(p.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-green-50"
                        style={{ color: "#059669", borderColor: "#059669" }}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => permanentDeletePost(p.id, p.title)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ───────────────────────────────────────────────────── */}
        {tab === "about" && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Edit About Page</h2>
              {aboutSuccess && <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">✓ Saved!</span>}
            </div>

            {aboutLoading || !aboutForm ? (
              <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">⏳</div><p>Loading content...</p></div>
            ) : (
              <div className="space-y-6">
                {/* Al-Biruni */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Inspired by Al-Biruni</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">English</label>
                      <textarea rows={6} value={aboutForm.about_biruni_en}
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_biruni_en: e.target.value } : f)}
                        className={`${inp} resize-y`} placeholder="HTML supported" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">فارسی</label>
                      <textarea rows={6} value={aboutForm.about_biruni_fa} dir="rtl"
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_biruni_fa: e.target.value } : f)}
                        className={`${inp} resize-y`} placeholder="HTML پشتیبانی می‌شود" />
                    </div>
                  </div>
                </div>

                {/* Our Story */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Our Story</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">English</label>
                      <textarea rows={6} value={aboutForm.about_story_en}
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_story_en: e.target.value } : f)}
                        className={`${inp} resize-y`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">فارسی</label>
                      <textarea rows={6} value={aboutForm.about_story_fa} dir="rtl"
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_story_fa: e.target.value } : f)}
                        className={`${inp} resize-y`} />
                    </div>
                  </div>
                </div>

                {/* Vision */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Vision</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">English</label>
                      <textarea rows={3} value={aboutForm.about_vision_en}
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_vision_en: e.target.value } : f)}
                        className={`${inp} resize-y`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">فارسی</label>
                      <textarea rows={3} value={aboutForm.about_vision_fa} dir="rtl"
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_vision_fa: e.target.value } : f)}
                        className={`${inp} resize-y`} />
                    </div>
                  </div>
                </div>

                {/* Mission */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Mission (use &lt;ul&gt;&lt;li&gt; for list items)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">English</label>
                      <textarea rows={5} value={aboutForm.about_mission_en}
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_mission_en: e.target.value } : f)}
                        className={`${inp} resize-y font-mono text-xs`} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">فارسی</label>
                      <textarea rows={5} value={aboutForm.about_mission_fa} dir="rtl"
                        onChange={(e) => setAboutForm((f) => f ? { ...f, about_mission_fa: e.target.value } : f)}
                        className={`${inp} resize-y font-mono text-xs`} />
                    </div>
                  </div>
                </div>

                {/* Founder */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Founder&apos;s Message</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Quote (English)</label>
                        <textarea rows={3} value={aboutForm.about_founder_quote_en}
                          onChange={(e) => setAboutForm((f) => f ? { ...f, about_founder_quote_en: e.target.value } : f)}
                          className={`${inp} resize-y`} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name (English)</label>
                        <input value={aboutForm.about_founder_name}
                          onChange={(e) => setAboutForm((f) => f ? { ...f, about_founder_name: e.target.value } : f)}
                          className={inp} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">نقل‌قول (فارسی)</label>
                        <textarea rows={3} value={aboutForm.about_founder_quote_fa} dir="rtl"
                          onChange={(e) => setAboutForm((f) => f ? { ...f, about_founder_quote_fa: e.target.value } : f)}
                          className={`${inp} resize-y`} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">نام (فارسی)</label>
                        <input value={aboutForm.about_founder_name_fa} dir="rtl"
                          onChange={(e) => setAboutForm((f) => f ? { ...f, about_founder_name_fa: e.target.value } : f)}
                          className={inp} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={saveAbout} disabled={aboutSaving}
                    className="text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50"
                    style={{ backgroundColor: "#8B1A1A" }}>
                    {aboutSaving ? "Saving…" : "Save About Page"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

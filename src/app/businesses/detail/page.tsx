"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getBusinessById } from "@/lib/api";
import { Business, CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import { MapPin, Phone, Globe, Mail, CheckCircle, ArrowLeft, Trash2, Pencil, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth, authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://afshin.ch/persianch/api";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  user_name: string;
  avatar?: string;
}

function BusinessComments({ businessId }: { businessId: number }) {
  const { user, token, isAdmin } = useAuth();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [text, setText]         = React.useState("");
  const [loading, setLoading]   = React.useState(false);

  React.useEffect(() => {
    fetch(`${API}/comments.php?entity_type=business&entity_id=${businessId}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [businessId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/comments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ entity_type: "business", entity_id: businessId, content: text }),
      });
      const c = await res.json();
      if (res.ok) { setComments((prev) => [...prev, c]); setText(""); }
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: number) => {
    await fetch(`${API}/comments.php?id=${id}`, { method: "DELETE", headers: authHeaders(token) });
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="mt-8 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Comments ({comments.length})</h2>

      {comments.length === 0 && <p className="text-gray-400 text-sm mb-6">No comments yet.</p>}

      <div className="space-y-3 mb-6">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1B3A6B" }}>
                    {c.user_name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800">{c.user_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("en-CH", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              {(user?.id === c.user_id || isAdmin) && (
                <button onClick={() => deleteComment(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700">{c.content}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submit} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Sign in</Link> to leave a comment.
        </p>
      )}
    </section>
  );
}

const BusinessMap = dynamic(() => import("@/components/business/BusinessMap"), { ssr: false });

const CATEGORY_GRADIENTS: Record<string, string> = {
  restaurant:   "from-orange-200 to-red-200",
  cafe:         "from-amber-200 to-yellow-200",
  hairdresser:  "from-pink-200 to-rose-200",
  doctor:       "from-blue-200 to-cyan-200",
  dentist:      "from-sky-200 to-blue-200",
  lawyer:       "from-slate-200 to-gray-200",
  accountant:   "from-green-200 to-emerald-200",
  grocery:      "from-lime-200 to-green-200",
  beauty:       "from-purple-200 to-pink-200",
  "real-estate":"from-indigo-200 to-blue-200",
  other:        "from-gray-200 to-slate-200",
};

function ContactRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#FDF0E8" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

function AdminEditPanel({ business, token, onSaved }: { business: Business; token: string | null; onSaved: (b: Business) => void }) {
  const [form, setForm] = React.useState({
    name: business.name ?? "", name_fa: business.name_fa ?? "",
    category: business.category ?? "restaurant", country: (business as any).country ?? "Switzerland",
    canton: business.canton ?? "", address: business.address ?? "",
    phone: business.phone ?? "", email: business.email ?? "",
    website: business.website ?? "", instagram: business.instagram ?? "",
    google_maps_url: business.google_maps_url ?? "",
    description: business.description ?? "", description_fa: business.description_fa ?? "",
    image_url: (business as any).image_url ?? "", logo_url: (business as any).logo_url ?? "",
    lat: business.lat?.toString() ?? "", lng: business.lng?.toString() ?? "",
    is_featured: !!business.is_featured, is_verified: !!business.is_verified,
    is_approved: !!(business as any).is_approved,
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved]   = React.useState(false);
  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";
  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { id: business.id, ...form, lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null };
    const res = await fetch(`${API}/businesses.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    });
    if (res.ok) { setSaved(true); onSaved({ ...business, ...body } as any); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-4">Admin — Edit Business</p>
      {saved && <p className="text-green-600 text-sm font-medium mb-3">Saved!</p>}
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name (English)</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name (Persian)</label>
            <input value={form.name_fa} onChange={(e) => setForm({ ...form, name_fa: e.target.value })} className={inp} dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Business["category"] })} className={inp}>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">Region / Canton</label>
            {regions.length > 0 ? (
              <select value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} className={inp}>
                <option value="">— select —</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} className={inp} />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Website</label>
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Instagram</label>
            <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Google Maps URL</label>
            <input value={form.google_maps_url} onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description (English)</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Persian)</label>
            <textarea value={form.description_fa} onChange={(e) => setForm({ ...form, description_fa: e.target.value })} rows={3} dir="rtl" className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cover Image URL</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inp} placeholder="https://..." />
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-16 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display="none")} />}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Logo URL</label>
            <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className={inp} placeholder="https://..." />
            {form.logo_url && <img src={form.logo_url} alt="" className="mt-2 h-16 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display="none")} />}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Coordinates <span className="text-gray-400 font-normal">(map pin)</span></p>
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
          <p className="text-xs text-gray-400 mt-1">Right-click on Google Maps → &quot;What&apos;s here?&quot; to get coordinates.</p>
        </div>
        <div className="flex gap-5">
          {(["is_featured", "is_verified", "is_approved"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="rounded accent-red-600" />
              {k.replace("is_", "")}
            </label>
          ))}
        </div>
        <button type="submit" disabled={saving} className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: "#8B1A1A" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function BusinessDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    // Pass auth token so admins can view unapproved businesses
    const headers: Record<string, string> = {};
    if (token) Object.assign(headers, authHeaders(token));
    fetch(`${API}/businesses.php?id=${id}`, { headers })
      .then((r) => r.ok ? r.json() : null)
      .then(setBusiness)
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDelete = async () => {
    if (!business || !confirm(`Delete "${business.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`${API}/businesses.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: business.id }),
    });
    router.push("/businesses");
  };

  const category = business ? CATEGORIES.find((c) => c.slug === business.category) : null;

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-72 w-full mb-6" />
        <div className="skeleton h-8 w-64 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4" />
      </main>
    );
  }

  if (!business) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-bold text-lg">Business not found.</p>
        <Link href="/businesses" className="hover:underline mt-4 inline-block text-sm" style={{ color: "#1B3A6B" }}>
          ← Back to listings
        </Link>
      </main>
    );
  }

  const gradient = CATEGORY_GRADIENTS[business.category] ?? "from-gray-200 to-slate-200";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-up">
      <div className="flex items-center justify-between mb-6">
        <Link href="/businesses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors font-medium">
          <ArrowLeft size={15} /> Back to listings
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              style={editing ? { backgroundColor: "#f3f4f6", color: "#374151" } : { backgroundColor: "#1B3A6B", color: "#fff" }}
            >
              {editing ? <><X size={14} /> Close Editor</> : <><Pencil size={14} /> Edit</>}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#8B1A1A", color: "#fff" }}
            >
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Unapproved — block public entirely */}
      {!(business as any).is_approved && !isAdmin && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-600">This listing is not available.</p>
          <Link href="/businesses" className="text-sm mt-3 inline-block hover:underline" style={{ color: "#1B3A6B" }}>← Browse all businesses</Link>
        </div>
      )}

      {(isAdmin || (business as any).is_approved) && (
      <>
      {/* Unapproved warning for admins */}
      {!(business as any).is_approved && isAdmin && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 mb-6 text-yellow-800 text-sm font-medium">
          <AlertTriangle size={16} className="flex-shrink-0" />
          This business is <strong>not approved</strong> and is hidden from the public.
        </div>
      )}

      {editing && isAdmin && (
        <AdminEditPanel business={business} token={token} onSaved={(updated) => setBusiness(updated)} />
      )}

      {/* Hero banner */}
      <div className={`relative h-64 sm:h-80 bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden mb-6 flex items-center justify-center`}>
        {business.image_url ? (
          <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-9xl opacity-60">{category?.icon ?? "🏪"}</span>
        )}
        {/* Dark overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {business.is_featured && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full shadow"
              style={{ backgroundColor: "#C9A84C", color: "#3a0a0a" }}>
              ⭐ Featured
            </span>
          )}
          {business.is_verified && (
            <span className="bg-white text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1"
              style={{ color: "#1B3A6B" }}>
              <CheckCircle size={12} /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {business.logo_url && (
                <img src={business.logo_url} alt="logo" className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{business.name}</h1>
                {business.name_fa && (
                  <p className="text-gray-400 text-base mt-0.5" dir="rtl">{business.name_fa}</p>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#FDF0E8", color: "#1B3A6B" }}>
                    {category?.icon} {category?.label_en}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} style={{ color: "#1B3A6B" }} /> {business.canton}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {(business.description || business.description_fa) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">About</h2>
              {business.description && (
                <p className="text-gray-600 leading-relaxed">{business.description}</p>
              )}
              {business.description_fa && (
                <p className="text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-50" dir="rtl">
                  {business.description_fa}
                </p>
              )}
            </div>
          )}

          {/* Map */}
          <BusinessMap business={business} />
        </div>

        {/* Contact sidebar */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide px-1">Contact</h2>

          {business.phone && (
            <ContactRow icon={<Phone size={16} style={{ color: "#1B3A6B" }} />} label="Phone">
              <a href={`tel:${business.phone}`} className="text-sm font-medium text-gray-800 hover:text-[#1B3A6B] transition-colors">
                {business.phone}
              </a>
            </ContactRow>
          )}

          {business.address && (
            <ContactRow icon={<MapPin size={16} style={{ color: "#1B3A6B" }} />} label="Address">
              <p className="text-sm text-gray-700">{business.address}, {business.canton}</p>
              {business.google_maps_url && (
                <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold mt-1 block hover:underline" style={{ color: "#1B3A6B" }}>
                  Open in Google Maps →
                </a>
              )}
            </ContactRow>
          )}

          {business.website && (
            <ContactRow icon={<Globe size={16} style={{ color: "#1B3A6B" }} />} label="Website">
              <a href={business.website} target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium hover:underline break-all" style={{ color: "#1B3A6B" }}>
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            </ContactRow>
          )}

          {business.email && (
            <ContactRow icon={<Mail size={16} style={{ color: "#1B3A6B" }} />} label="Email">
              <a href={`mailto:${business.email}`} className="text-sm font-medium text-gray-800 hover:text-[#1B3A6B] transition-colors break-all">
                {business.email}
              </a>
            </ContactRow>
          )}

          {business.instagram && (
            <ContactRow icon={<span style={{ color: "#1B3A6B", fontSize: 16 }}>📸</span>} label="Instagram">
              <a href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium hover:underline" style={{ color: "#1B3A6B" }}>
                @{business.instagram.replace("@", "")}
              </a>
            </ContactRow>
          )}

        </div>
      </div>

      <BusinessComments businessId={Number(business.id)} />
      </>
      )}
    </main>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-72 w-full mb-6" />
        <div className="skeleton h-8 w-64 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4" />
      </main>
    }>
      <BusinessDetailContent />
    </Suspense>
  );
}

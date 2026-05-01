"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getBusinessById } from "@/lib/api";
import { idFromSlug } from "@/lib/businessSlug";
import { Business, CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import { MapPin, Phone, Globe, Mail, CheckCircle, ArrowLeft, Trash2, Pencil, X, AlertTriangle, Instagram, ExternalLink } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth, authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

const FARSI_STYLE: React.CSSProperties = { fontFamily: "'Vazirmatn', sans-serif" };

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
    <section className="mt-10 pt-8 border-t border-gray-100">
      <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
        Comments
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{comments.length}</span>
      </h2>

      {comments.length === 0 && (
        <p className="text-gray-400 text-sm mb-6">No comments yet. Be the first to share your experience.</p>
      )}

      <div className="space-y-3 mb-6">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                {c.avatar ? (
                  <Image src={c.avatar} alt={c.user_name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1B3A6B" }}>
                    {c.user_name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none">{c.user_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
              {(user?.id === c.user_id || isAdmin) && (
                <button onClick={() => deleteComment(c.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-10">{c.content}</p>
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={submit} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience…"
            rows={3}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#1B3A6B" }}
          >
            {loading ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-500">
          <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Sign in</Link> to leave a comment.
        </div>
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

interface UserOption { id: number; name: string; email: string; }

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
  const [assignOwner, setAssignOwner] = React.useState<string>(
    business.owner_user_id ? String(business.owner_user_id) : ""
  );
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved]   = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    fetch(`${API}/users.php`, { headers: authHeaders(token) })
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";
  const regions = REGIONS_BY_COUNTRY[form.country] ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = { id: business.id, ...form, lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null, owner_user_id: assignOwner ? parseInt(assignOwner) : null };
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
            <input value={form.name_fa} onChange={(e) => setForm({ ...form, name_fa: e.target.value })} className={inp} dir="rtl" style={FARSI_STYLE} />
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
              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Region / Canton</label>
            {regions.length > 0 ? (
              <select value={form.canton} onChange={(e) => setForm({ ...form, canton: e.target.value })} className={inp}>
                <option value="">— select —</option>
                {[...regions].sort((a, b) => a.localeCompare(b)).map((r) => <option key={r} value={r}>{r}</option>)}
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
            <textarea value={form.description_fa} onChange={(e) => setForm({ ...form, description_fa: e.target.value })} rows={3} dir="rtl" style={FARSI_STYLE} className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Cover Image URL</label>
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inp} placeholder="https://..." />
            {form.image_url && <img src={form.image_url} alt="Cover image preview" className="mt-2 h-16 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display="none")} />}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Logo URL</label>
            <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className={inp} placeholder="https://..." />
            {form.logo_url && <img src={form.logo_url} alt="Logo preview" className="mt-2 h-16 w-full object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display="none")} />}
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

        <div className="border-t border-amber-200 pt-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Managed by</label>
          {assignOwner ? (
            <p className="text-xs font-semibold mb-1.5" style={{ color: "#15803d" }}>
              Currently: {users.find(u => String(u.id) === assignOwner)?.name ?? `User #${assignOwner}`}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mb-1.5">Currently managed by BiruniMap</p>
          )}
          <select value={assignOwner} onChange={e => setAssignOwner(e.target.value)} className={inp}>
            <option value="">— Managed by BiruniMap —</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving} className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: "#8B1A1A" }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function BusinessDetailContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const id = slug ? String(idFromSlug(slug)) : searchParams.get("id");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) { setLoading(false); return; }
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

  useEffect(() => {
    if (business) document.title = `${business.name} — BiruniMap`;
  }, [business?.name]);

  const bSlug = business ? `${business.category}-${business.name}-${business.country ?? ""}-${business.canton ?? ""}-${business.id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : null;

  const breadcrumbLd = business ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://birunimap.com" },
      { "@type": "ListItem", "position": 2, "name": "Businesses", "item": "https://birunimap.com/businesses" },
      { "@type": "ListItem", "position": 3, "name": business.name, "item": `https://birunimap.com/businesses/detail?slug=${bSlug}` },
    ],
  }) : null;

  const jsonLd = business ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    ...(business.name_fa ? { "alternateName": business.name_fa } : {}),
    ...(business.description ? { "description": business.description } : {}),
    ...(business.address ? { "address": { "@type": "PostalAddress", "streetAddress": business.address, "addressLocality": business.canton ?? "", "addressCountry": (business as any).country ?? "" } } : {}),
    ...(business.phone ? { "telephone": business.phone } : {}),
    ...(business.email ? { "email": business.email } : {}),
    ...(business.website ? { "url": business.website } : {}),
    ...(business.lat && business.lng ? { "geo": { "@type": "GeoCoordinates", "latitude": business.lat, "longitude": business.lng } } : {}),
    ...(business.image_url ? { "image": business.image_url } : {}),
    "url": `https://birunimap.com/businesses/detail?slug=${bSlug}`,
  }) : null;

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="skeleton h-80 w-full rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-10 w-64" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-500">
        <p className="text-6xl mb-4">🔍</p>
        <p className="font-bold text-xl text-gray-800 mb-2">Business not found</p>
        <p className="text-sm text-gray-400 mb-6">This listing may have been removed or doesn&apos;t exist.</p>
        <Link href="/businesses" className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl text-white" style={{ backgroundColor: "#1B3A6B" }}>
          <ArrowLeft size={14} /> Browse all businesses
        </Link>
      </main>
    );
  }

  const gradient = CATEGORY_GRADIENTS[business.category] ?? "from-gray-200 to-slate-200";
  const country = (business as any).country;

  return (
    <>
      {breadcrumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-up">

        {/* Top nav row */}
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
                {editing ? <><X size={14} /> Close</> : <><Pencil size={14} /> Edit</>}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A", color: "#fff" }}
              >
                <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>

        {/* Unapproved — block public */}
        {!(business as any).is_approved && !isAdmin && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
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

            {/* Hero */}
            <div className={`relative h-56 sm:h-80 bg-gradient-to-br ${gradient} rounded-3xl overflow-hidden mb-8`}>
              {business.image_url ? (
                <Image src={business.image_url} alt={business.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 900px" priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-9xl opacity-50">{category?.icon ?? "🏪"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                {business.is_featured && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: "#C9A84C", color: "#3a0a0a" }}>
                    ⭐ Featured
                  </span>
                )}
                {business.is_verified && (
                  <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
                    style={{ color: "#1B3A6B" }}>
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
              </div>

              {/* Category pill bottom-left */}
              <div className="absolute bottom-4 left-4">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow"
                  style={{ color: "#1B3A6B" }}>
                  {category?.icon} {category?.label_en}
                </span>
              </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left — main info */}
              <div className="lg:col-span-2 space-y-6">

                {/* Title card */}
                <div className="flex items-start gap-4">
                  {business.logo_url && (
                    <Image
                      src={business.logo_url}
                      alt={`${business.name} logo`}
                      width={72} height={72}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-gray-100 shadow-md flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{business.name}</h1>
                    {business.name_fa && (
                      <p className="text-lg text-gray-500 mt-1" dir="rtl" style={FARSI_STYLE}>{business.name_fa}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap text-sm text-gray-500">
                      {(business.canton || country) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {[business.canton, country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {business.owner_user_id ? (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                          <CheckCircle size={11} /> Owner-managed
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full text-gray-400 border border-gray-200">
                          Managed by BiruniMap
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {(business.description || business.description_fa) && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About</h2>
                    {business.description && (
                      <p className="text-gray-700 leading-relaxed text-[15px]">{business.description}</p>
                    )}
                    {business.description_fa && (
                      <p className="text-gray-600 leading-loose text-base mt-4 pt-4 border-t border-gray-100" dir="rtl" style={FARSI_STYLE}>
                        {business.description_fa}
                      </p>
                    )}
                  </div>
                )}

                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <BusinessMap business={business} />
                </div>

              </div>

              {/* Right — contact sidebar */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact</h2>

                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-gray-200 hover:border-[#1B3A6B] hover:bg-blue-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2F9]">
                      <Globe size={16} style={{ color: "#1B3A6B" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Website</p>
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#1B3A6B] transition-colors">
                        {business.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </p>
                    </div>
                    <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1B3A6B] flex-shrink-0 transition-colors" />
                  </a>
                )}

                {business.phone && (
                  <a href={`tel:${business.phone}`}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-gray-200 hover:border-[#1B3A6B] hover:bg-blue-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2F9]">
                      <Phone size={16} style={{ color: "#1B3A6B" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Phone</p>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1B3A6B] transition-colors">{business.phone}</p>
                    </div>
                  </a>
                )}

                {business.email && (
                  <a href={`mailto:${business.email}`}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-gray-200 hover:border-[#1B3A6B] hover:bg-blue-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2F9]">
                      <Mail size={16} style={{ color: "#1B3A6B" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Email</p>
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#1B3A6B] transition-colors">{business.email}</p>
                    </div>
                  </a>
                )}

                {business.address && (
                  <div className="flex items-start gap-3 w-full px-4 py-3.5 rounded-2xl border border-gray-200">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EEF2F9]">
                      <MapPin size={16} style={{ color: "#1B3A6B" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Address</p>
                      <p className="text-sm font-semibold text-gray-800">{business.address}</p>
                      {business.canton && <p className="text-xs text-gray-400 mt-0.5">{business.canton}{country ? `, ${country}` : ""}</p>}
                      {business.google_maps_url && (
                        <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold mt-2 inline-flex items-center gap-1 hover:underline" style={{ color: "#1B3A6B" }}>
                          Open in Maps <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {business.instagram && (
                  <a href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-pink-50">
                      <Instagram size={16} className="text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">Instagram</p>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                        @{business.instagram.replace("@", "")}
                      </p>
                    </div>
                    <ExternalLink size={13} className="text-gray-300 group-hover:text-pink-400 flex-shrink-0 transition-colors" />
                  </a>
                )}

                {/* Get listed CTA */}
                <div className="mt-6 p-4 rounded-2xl text-center" style={{ backgroundColor: "#EEF2F9" }}>
                  <p className="text-xs text-gray-500 mb-2">Own a business?</p>
                  <Link href="/get-listed" className="text-sm font-bold hover:underline" style={{ color: "#1B3A6B" }}>
                    Get listed on BiruniMap →
                  </Link>
                </div>
              </div>
            </div>

            <BusinessComments businessId={Number(business.id)} />
          </>
        )}
      </main>
    </>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense fallback={
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="skeleton h-80 w-full rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-10 w-64" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
          <div className="space-y-3">
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    }>
      <BusinessDetailContent />
    </Suspense>
  );
}

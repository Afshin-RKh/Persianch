"use client";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import { useAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const navy = "#1B3A6B";
const red  = "#8B1A1A";
const gold = "#C9A84C";

export default function GetListedPage() {
  const { user, token } = useAuth();

  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner]           = useState(false);
  const [wantsAccount, setWantsAccount] = useState(false);

  const [form, setForm] = useState({
    businessName: "", category: "", country: "", city: "",
    address: "", phone: "", website: "", instagram: "",
    email: "", description: "",
  });

  const cities = form.country ? (REGIONS_BY_COUNTRY[form.country] ?? []) : [];
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white placeholder-gray-300";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const query = [form.address, form.city, form.country].filter(Boolean).join(", ");
        const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const geoData = await geo.json();
        if (geoData.length > 0) {
          lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon);
        } else {
          const geo2 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([form.city, form.country].join(", "))}&format=json&limit=1`);
          const geoData2 = await geo2.json();
          if (geoData2.length > 0) { lat = parseFloat(geoData2[0].lat); lng = parseFloat(geoData2[0].lon); }
        }
      } catch { /* non-fatal */ }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API}/businesses.php`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: form.businessName, category: form.category,
          country: form.country, canton: form.city,
          address: [form.address, form.city, form.country].filter(Boolean).join(", "),
          phone: form.phone || null, website: form.website || null,
          instagram: form.instagram?.replace(/^@/, "") || null,
          email: form.email || null, description: form.description || null,
          lat, lng, is_featured: false, is_verified: false, is_approved: false,
        }),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center fade-up">
        <div className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "#EEF2FF" }}>
          <svg className="w-7 h-7" fill="none" stroke={navy} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: navy }}>Submission received</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          Thank you. Our team will review your business and add it to the map within a few days.
          {user && isOwner && " You can manage your listing from your profile once it&apos;s approved."}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 fade-up">

      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>Add to Map</p>
        <h1 className="text-4xl font-bold mb-4" style={{ color: navy }}>Add a business.</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Iranian-run businesses are the backbone of our community abroad. Fill in the form — we&apos;ll review the submission and put it on the map within a few days.
        </p>
        <div className="flex flex-wrap gap-6 mt-6">
          {["Open to all Iranian businesses", "Listed within a few days", "Visible across Europe & beyond"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gold }} />
              {t}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Business info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Business Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Name <span className="text-red-400">*</span></label>
              <input type="text" required value={form.businessName} onChange={e => set({ businessName: e.target.value })} placeholder="e.g. Café Shiraz" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
              <select required value={form.category} onChange={e => set({ category: e.target.value })} className={inp}>
                <option value="">Select a category</option>
                {[...CATEGORIES]
                  .sort((a, b) => a.slug === "other" ? 1 : b.slug === "other" ? -1 : a.label_en.localeCompare(b.label_en))
                  .map((cat) => <option key={cat.slug} value={cat.slug}>{cat.label_en}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Short Description</label>
            <textarea rows={3} value={form.description} onChange={e => set({ description: e.target.value })}
              placeholder="What makes this business special for the Iranian community?" className={inp + " resize-none"} />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country <span className="text-red-400">*</span></label>
              <select required value={form.country} onChange={e => set({ country: e.target.value, city: "" })} className={inp}>
                <option value="">Select country</option>
                {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">City <span className="text-red-400">*</span></label>
              {cities.length > 0 ? (
                <select required value={form.city} onChange={e => set({ city: e.target.value })} className={inp}>
                  <option value="">Select city</option>
                  {[...cities].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" required value={form.city} onChange={e => set({ city: e.target.value })}
                  placeholder={form.country ? "City or region" : "Select country first"}
                  disabled={!form.country} className={inp + (!form.country ? " opacity-40 cursor-not-allowed" : "")} />
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Street Address <span className="text-red-400">*</span></label>
            <input type="text" required value={form.address} onChange={e => set({ address: e.target.value })} placeholder="Street and number" className={inp} />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })} placeholder="+49 30 123456" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="info@yourbusiness.com" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Website</label>
              <input type="url" value={form.website} onChange={e => set({ website: e.target.value })} placeholder="https://..." className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => set({ instagram: e.target.value })} placeholder="@yourbusiness" className={inp} />
            </div>
          </div>
        </div>

        {/* Ownership */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Ownership</p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={isOwner}
              onChange={e => { setIsOwner(e.target.checked); if (!e.target.checked) setWantsAccount(false); }}
              className="mt-0.5 w-4 h-4 accent-[#1B3A6B] cursor-pointer" />
            <span className="text-sm text-gray-700">I am the owner of this business</span>
          </label>

          {isOwner && (
            <div className="ml-7 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={wantsAccount} onChange={e => setWantsAccount(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#1B3A6B] cursor-pointer" />
                <span className="text-sm text-gray-700">I want to manage this page myself</span>
              </label>

              {wantsAccount && (
                user ? (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Signed in as <strong className="ml-0.5">{user.name}</strong> — your account will be linked as the owner.
                  </div>
                ) : (
                  <div className="border border-[#1B3A6B]/20 rounded-xl px-5 py-4 bg-[#f8faff] text-sm text-gray-600 leading-relaxed">
                    To manage your own page you need a BiruniMap account.{" "}
                    <Link href="/auth/signin" className="font-semibold underline underline-offset-2 hover:opacity-75" style={{ color: navy }}>Sign in</Link>
                    {" "}or{" "}
                    <Link href="/auth/signup" className="font-semibold underline underline-offset-2 hover:opacity-75" style={{ color: navy }}>create an account</Link>
                    , then come back to submit your business.
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting}
          className="w-full text-white font-semibold py-3.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: red }}>
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your submission will be reviewed by our team before appearing on the map.
        </p>

      </form>
    </main>
  );
}

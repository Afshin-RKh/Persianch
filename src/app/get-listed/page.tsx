"use client";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";

const API  = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const navy = "#1B3A6B";
const red  = "#8B1A1A";
const gold = "#C9A84C";

export default function GetListedPage() {
  const { user, token } = useAuth();
  const { info: toastInfo, error: toastError } = useToast();

  const [sent, setSent]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner]     = useState(false);
  const [geoWarning, setGeoWarning] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    businessName: "", category: "", country: "", city: "",
    address: "", phone: "", website: "", instagram: "",
    email: "", description: "",
  });

  const cities = form.country ? (REGIONS_BY_COUNTRY[form.country] ?? []) : [];
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const inp = (field?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white placeholder-gray-300 transition-colors ${
      field && fieldErrors[field] ? "border-red-300 bg-red-50" : "border-gray-200"
    }`;

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.businessName.trim()) errors.businessName = "Business name is required.";
    if (!form.category)            errors.category     = "Please select a category.";
    if (!form.country)             errors.country      = "Please select a country.";
    if (!form.city.trim())         errors.city         = "City is required.";
    if (!form.address.trim())      errors.address      = "Street address is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setGeoWarning(false);
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
          else setGeoWarning(true);
        }
      } catch { setGeoWarning(true); }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/businesses.php`, {
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
          is_owner: isOwner && !!user,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed. Please try again.");
      }
      setSent(true);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
        <h2 className="text-2xl font-bold mb-3" style={{ color: navy }}>Submission received!</h2>
        {geoWarning && (
          <div className="mx-auto max-w-sm mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            ⚠ We couldn&apos;t auto-pin your location on the map — an admin will verify and add the pin manually.
          </div>
        )}
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          Thank you. Our team will review your business and add it to the map within a few days.
          {user && isOwner && " You can manage your listing from your profile once it's approved."}
        </p>
      </main>
    );
  }

  const howToLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "HowTo",
    "name": "How to Add Your Iranian Business to BiruniMap",
    "description": "List your Iranian or Persian business on BiruniMap in a few simple steps. Free to add — visible to the global diaspora.",
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Sign in or create an account", "text": "Create a free BiruniMap account or sign in to track your listing." },
      { "@type": "HowToStep", "position": 2, "name": "Fill in your business details", "text": "Enter your business name, category, location, contact details, and a description." },
      { "@type": "HowToStep", "position": 3, "name": "Submit for review", "text": "Submit the form. Our team reviews all submissions to ensure quality." },
      { "@type": "HowToStep", "position": 4, "name": "Get listed on the map", "text": "Once approved (within a few days), your business appears on the BiruniMap global directory." },
    ],
  });

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: howToLd }} />
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 fade-up">

      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>Add to Map</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: navy }}>Add a business.</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Iranian-run businesses are the backbone of our community abroad. Fill in the form — we&apos;ll review the submission and put it on the map within a few days.
        </p>
        <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
          {["Open to all Iranian businesses", "Listed within a few days", "Visible across Europe & beyond"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: gold }} />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Ownership question */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 mb-6 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Before you start</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={isOwner} onChange={e => setIsOwner(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#1B3A6B] cursor-pointer flex-shrink-0" />
          <span className="text-sm text-gray-700">I am the owner and want to manage this business page myself</span>
        </label>
        {isOwner && (
          <div className="ml-7">
            {user ? (
              <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Signed in as <strong className="ml-0.5">{user.name}</strong> — your account will be linked as the owner.
              </div>
            ) : (
              <div className="border border-[#1B3A6B]/20 rounded-xl px-4 sm:px-5 py-4 bg-[#f8faff] text-sm text-gray-600 leading-relaxed">
                To manage your own page you need a BiruniMap account.{" "}
                <Link href="/auth/signin" className="font-semibold underline underline-offset-2 hover:opacity-75" style={{ color: navy }}>Sign in</Link>
                {" "}or{" "}
                <Link href="/auth/signup" className="font-semibold underline underline-offset-2 hover:opacity-75" style={{ color: navy }}>create an account</Link>
                , then come back to submit your business.
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* Business info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Business Info</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.businessName} onChange={e => { set({ businessName: e.target.value }); setFieldErrors(fe => ({ ...fe, businessName: "" })); }}
                placeholder="e.g. Café Shiraz" className={inp("businessName")} />
              {fieldErrors.businessName && <p className="mt-1 text-xs text-red-500">{fieldErrors.businessName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
              <select value={form.category} onChange={e => { set({ category: e.target.value }); setFieldErrors(fe => ({ ...fe, category: "" })); }} className={inp("category")}>
                <option value="">Select a category</option>
                {[...CATEGORIES].sort((a, b) => a.slug === "other" ? 1 : b.slug === "other" ? -1 : a.label_en.localeCompare(b.label_en))
                  .map((cat) => <option key={cat.slug} value={cat.slug}>{cat.label_en}</option>)}
              </select>
              {fieldErrors.category && <p className="mt-1 text-xs text-red-500">{fieldErrors.category}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Short Description</label>
            <textarea rows={3} value={form.description} onChange={e => set({ description: e.target.value })}
              placeholder="What makes this business special for the Iranian community?" className={inp() + " resize-none"} />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country <span className="text-red-400">*</span></label>
              <select value={form.country} onChange={e => { set({ country: e.target.value, city: "" }); setFieldErrors(fe => ({ ...fe, country: "" })); }} className={inp("country")}>
                <option value="">Select country</option>
                {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {fieldErrors.country && <p className="mt-1 text-xs text-red-500">{fieldErrors.country}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                City <span className="text-red-400">*</span>
                {!form.country && <span className="text-gray-400 font-normal ml-1 text-[11px]">(select country first)</span>}
              </label>
              {cities.length > 0 ? (
                <select value={form.city} onChange={e => { set({ city: e.target.value }); setFieldErrors(fe => ({ ...fe, city: "" })); }}
                  disabled={!form.country} className={inp("city") + (!form.country ? " opacity-40 cursor-not-allowed" : "")}>
                  <option value="">Select city</option>
                  {[...cities].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" value={form.city} onChange={e => { set({ city: e.target.value }); setFieldErrors(fe => ({ ...fe, city: "" })); }}
                  placeholder={form.country ? "Enter city or region" : "Select country first"}
                  disabled={!form.country}
                  title={!form.country ? "Please select a country first" : undefined}
                  className={inp("city") + (!form.country ? " opacity-40 cursor-not-allowed" : "")} />
              )}
              {fieldErrors.city && <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Street Address <span className="text-red-400">*</span></label>
            <input type="text" value={form.address} onChange={e => { set({ address: e.target.value }); setFieldErrors(fe => ({ ...fe, address: "" })); }}
              placeholder="Street and number" className={inp("address")} />
            {fieldErrors.address && <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Details <span className="normal-case font-normal text-gray-400">(optional)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set({ phone: e.target.value })} placeholder="+49 30 123456" className={inp()} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="info@yourbusiness.com" className={inp()} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Website</label>
              <input type="url" value={form.website} onChange={e => set({ website: e.target.value })} placeholder="https://yourbusiness.com" className={inp()} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instagram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">@</span>
                <input type="text" value={form.instagram.replace(/^@/, "")} onChange={e => set({ instagram: e.target.value.replace(/^@/, "") })}
                  placeholder="yourbusiness" className={inp() + " pl-7"} />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full text-white font-semibold py-3.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#8B1A1A]"
          style={{ backgroundColor: red }}>
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your submission will be reviewed by our team before appearing on the map.
        </p>
      </form>
    </main>
    </>
  );
}

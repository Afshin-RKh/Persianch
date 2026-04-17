"use client";
import { useState } from "react";
import { CATEGORIES, SWISS_CITIES } from "@/types";
import { addBusiness } from "@/lib/api";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "persianch2024";

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", name_fa: "", category: "restaurant", canton: "Zurich",
    address: "", phone: "", website: "", email: "", instagram: "",
    description: "", description_fa: "", google_maps_url: "",
    is_featured: false, is_verified: false, is_approved: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await addBusiness(form as any);
      if (!result.success) throw new Error("Failed to add business");
      setSuccess(true);
      setForm({
        name: "", name_fa: "", category: "restaurant", canton: "Zurich",
        address: "", phone: "", website: "", email: "", instagram: "",
        description: "", description_fa: "", google_maps_url: "",
        is_featured: false, is_verified: false, is_approved: true,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add business");
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => pw === ADMIN_PASSWORD ? setAuth(true) : setError("Wrong password")}
            className="w-full text-white font-semibold py-3 rounded-xl transition-colors text-sm" style={{ backgroundColor: "#8B1A1A" }}
          >
            Login
          </button>
          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </div>
      </main>
    );
  }

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add a Business</h1>

      {success && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
          ✅ Business added successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field("Business Name (English) *", "name", "text", "e.g. Persian Kitchen")}
          {field("Business Name (Persian)", "name_fa", "text", "نام به فارسی")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.icon} {c.label_en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Canton *</label>
            <select
              value={form.canton}
              onChange={(e) => setForm({ ...form, canton: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {SWISS_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {field("Address", "address", "text", "Street, number")}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field("Phone", "phone", "tel", "+41 ...")}
          {field("Email", "email", "email", "info@example.ch")}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field("Website", "website", "url", "https://...")}
          {field("Instagram", "instagram", "text", "@handle")}
        </div>

        {field("Google Maps URL", "google_maps_url", "url", "https://maps.google.com/...")}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (English)</label>
          <textarea
            placeholder="Describe the business..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (Persian / فارسی)</label>
          <textarea
            placeholder="توضیح کسب‌وکار..."
            value={form.description_fa}
            onChange={(e) => setForm({ ...form, description_fa: e.target.value })}
            rows={3}
            dir="rtl"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="rounded accent-red-600"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
              className="rounded accent-red-600"
            />
            Verified
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !form.name}
          className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? "Saving..." : "Add Business"}
        </button>
      </form>
    </main>
  );
}

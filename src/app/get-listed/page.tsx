"use client";
import { useState } from "react";
import { CATEGORIES, COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";

export default function GetListedPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    country: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    instagram: "",
    email: "",
    description: "",
    connection: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const cities = form.country ? (REGIONS_BY_COUNTRY[form.country] ?? []) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xvzdqpoq", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent bg-white";

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-4xl">🏪</span>
        <h1 className="text-3xl font-bold mt-3 mb-3" style={{ color: "#1B3A6B" }}>
          Get Your Business Listed
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
          Are you Persian or Iranian — running a business where your language, culture, and cuisine make a real difference for your audience? Fill in the form below and we'll review and add your business within a few days — for free.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-sm text-gray-600 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">✅</span>
          <span>100% Free</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span>Listed within days</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span>Visible across Europe</span>
        </div>
      </div>

      {sent ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <span className="text-5xl">🙏</span>
          <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: "#1B3A6B" }}>Submission received!</h3>
          <p className="text-gray-500 text-sm">We'll review your business and add it within a few days.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                placeholder="e.g. Café Shiraz"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                required
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={inputCls}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.label_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
              <select
                required
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value, city: "" }))}
                className={inputCls}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
              {cities.length > 0 ? (
                <select
                  required
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Select city</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder={form.country ? "Enter city" : "Select country first"}
                  disabled={!form.country}
                  className={inputCls + (!form.country ? " opacity-50 cursor-not-allowed" : "")}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Street address"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+49 30 123456"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
              <input
                type="text"
                value={form.instagram}
                onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                placeholder="@yourbusiness"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell us a bit about your business..."
              className={inputCls + " resize-none"}
            />
          </div>

          {/* Connection section */}
          <div className="rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your connection to this business *</label>
            <div className="flex flex-col gap-3">
              {[
                { value: "owner", label: "I am the business owner" },
                { value: "employee", label: "I work here" },
                { value: "referral", label: "I know them" },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    form.connection === value
                      ? "border-[#1B3A6B] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="connection"
                    value={value}
                    required
                    checked={form.connection === value}
                    onChange={e => setForm(f => ({ ...f, connection: e.target.value }))}
                    className="accent-[#1B3A6B]"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            {submitting ? "Submitting..." : "Submit Your Business →"}
          </button>
        </form>
      )}
    </main>
  );
}

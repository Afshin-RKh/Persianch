"use client";
import { useState } from "react";

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
  });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-4xl">🏪</span>
        <h1 className="text-3xl font-bold mt-3 mb-3" style={{ color: "#1B3A6B" }}>
          Get Your Business Listed
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
          Are you Persian, Afghan, or Tajik — running a business where your language, culture, and cuisine make a real difference for your audience? Fill in the form below and we'll review and add your business within a few days — for free.
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                required
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent bg-white"
              >
                <option value="">Select category</option>
                <option value="restaurant">🍽️ Restaurant</option>
                <option value="cafe">☕ Café</option>
                <option value="hairdresser">✂️ Hairdresser</option>
                <option value="doctor">🩺 Doctor</option>
                <option value="dentist">🦷 Dentist</option>
                <option value="lawyer">⚖️ Lawyer</option>
                <option value="grocery">🛒 Grocery</option>
                <option value="other">🔍 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
              <input
                type="text"
                required
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="e.g. Germany"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="e.g. Berlin"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
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
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent resize-none"
            />
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

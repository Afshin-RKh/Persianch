"use client";
import { useState } from "react";

export default function ContactPage() {
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const [listingSent, setListingSent] = useState(false);
  const [listingForm, setListingForm] = useState({
    businessName: "",
    category: "",
    country: "",
    city: "",
    address: "",
    phone: "",
    website: "",
    email: "",
    description: "",
  });
  const [listingSubmitting, setListingSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xbdqkrrp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(contactForm),
      });
      setContactSent(true);
    } catch {
      setContactSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xvzdqpoq", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(listingForm),
      });
      setListingSent(true);
    } catch {
      setListingSent(true);
    } finally {
      setListingSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

      {/* Get Listed */}
      <section id="get-listed" className="mb-20">
        <div className="text-center mb-10">
          <span className="text-4xl">🏪</span>
          <h1 className="text-3xl font-bold mt-3 mb-3" style={{ color: "#8B1A1A" }}>
            Get Your Business Listed
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            Are you a Persian or Iranian business owner in Europe? We'd love to feature you on PersianHub — for free.
            Fill in the form below and we'll review and add your business within a few days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-sm text-gray-600 text-center">
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

        {listingSent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <span className="text-5xl">🙏</span>
            <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: "#8B1A1A" }}>Submission received!</h3>
            <p className="text-gray-500 text-sm">We'll review your business and add it within a few days.</p>
          </div>
        ) : (
          <form
            onSubmit={handleListingSubmit}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                <input
                  type="text"
                  required
                  value={listingForm.businessName}
                  onChange={e => setListingForm(f => ({ ...f, businessName: e.target.value }))}
                  placeholder="e.g. Café Shiraz"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select
                  required
                  value={listingForm.category}
                  onChange={e => setListingForm(f => ({ ...f, category: e.target.value }))}
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
                  value={listingForm.country}
                  onChange={e => setListingForm(f => ({ ...f, country: e.target.value }))}
                  placeholder="e.g. Germany"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={listingForm.city}
                  onChange={e => setListingForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Berlin"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={listingForm.address}
                onChange={e => setListingForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street address"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={listingForm.phone}
                  onChange={e => setListingForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+49 30 123456"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input
                  type="url"
                  value={listingForm.website}
                  onChange={e => setListingForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email *</label>
              <input
                type="email"
                required
                value={listingForm.email}
                onChange={e => setListingForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
              <textarea
                rows={3}
                value={listingForm.description}
                onChange={e => setListingForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Tell us a bit about your business..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={listingSubmitting}
              className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              {listingSubmitting ? "Submitting..." : "Submit Your Business →"}
            </button>
          </form>
        )}
      </section>

      {/* Contact Us */}
      <section id="contact">
        <div className="text-center mb-10">
          <span className="text-4xl">✉️</span>
          <h2 className="text-3xl font-bold mt-3 mb-3" style={{ color: "#8B1A1A" }}>
            Get in Touch
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            Have a question, a suggestion, or want to report an issue? Send us a message and we'll get back to you.
          </p>
        </div>

        {contactSent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <span className="text-5xl">🙏</span>
            <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: "#8B1A1A" }}>Message received!</h3>
            <p className="text-gray-500 text-sm">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form
            onSubmit={handleContactSubmit}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={contactForm.message}
                onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                placeholder="How can we help?"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

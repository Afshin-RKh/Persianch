"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

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
            Click below to fill in our short listing form and we'll add your business within a few days.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-sm text-gray-600">
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
          <Link
            href="/get-listed"
            className="inline-block text-white font-bold px-8 py-3 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-105 shadow-sm"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            Submit Your Business →
          </Link>
          <p className="text-xs text-gray-400 mt-4">Takes about 2 minutes</p>
        </div>
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

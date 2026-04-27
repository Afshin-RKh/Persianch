"use client";
import { useState } from "react";
import Link from "next/link";

const navy = "#1B3A6B";
const red  = "#8B1A1A";
const gold = "#C9A84C";
const dark = "#0D1B2E";

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
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 fade-up">

      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold mb-3" style={{ color: navy }}>Get Involved</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
          BiruniMap is built by the community, for the community. Whether you run a business,
          organise events, or just want to say hello — we'd love to hear from you.
        </p>
      </div>

      {/* Two action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">

        {/* Add business */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col">
          <span className="text-3xl mb-4">🏪</span>
          <h2 className="text-lg font-bold mb-2" style={{ color: navy }}>Add Your Business</h2>
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            Own or know an Iranian business that belongs on the map? Getting listed is free and only takes a couple of minutes.
          </p>
          <div className="mt-5 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2"><span style={{ color: gold }}>✓</span> Free — always</div>
            <div className="flex items-center gap-2"><span style={{ color: gold }}>✓</span> Listed within a few days</div>
            <div className="flex items-center gap-2"><span style={{ color: gold }}>✓</span> Visible to Iranians worldwide</div>
          </div>
          <Link
            href="/get-listed"
            className="mt-6 block text-center text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: red }}
          >
            Add to Map →
          </Link>
        </div>

        {/* Submit event */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col">
          <span className="text-3xl mb-4">📅</span>
          <h2 className="text-lg font-bold mb-2" style={{ color: navy }}>Submit an Event</h2>
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            Organising a concert, festival, workshop, or community gathering? Share it on BiruniMap and reach thousands of Iranians near you.
          </p>
          <div className="mt-5 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2"><span style={{ color: gold }}>✓</span> Open to all cultural events</div>
            <div className="flex items-center gap-2"><span style={{ color: gold }}>✓</span> Shown on the events map</div>
            <div className="flex items-center gap-2"><span style={{ color: gold }}>✓</span> Reviewed and published quickly</div>
          </div>
          <Link
            href="/events/submit"
            className="mt-6 block text-center text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: red }}
          >
            Submit Event →
          </Link>
        </div>
      </div>

      {/* Join the team */}
      <div className="rounded-2xl p-7 mb-14 text-white" style={{ background: `linear-gradient(135deg, ${dark} 0%, ${navy} 100%)` }}>
        <div className="flex items-start gap-5">
          <span className="text-3xl shrink-0">🤝</span>
          <div>
            <h2 className="text-lg font-bold mb-1">Want to help build BiruniMap?</h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              We're a small volunteer team with big ambitions. If you want to contribute — as a developer,
              designer, translator, community ambassador, or anything else — we'd love to have you.
            </p>
            <p className="text-blue-200 text-sm">Send us a message below and tell us how you'd like to help.</p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: navy }}>Send Us a Message</h2>
          <p className="text-gray-500 text-sm">Questions, ideas, feedback — we read everything.</p>
        </div>

        {contactSent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <span className="text-5xl">🙏</span>
            <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: navy }}>Message received!</h3>
            <p className="text-gray-500 text-sm">We'll get back to you as soon as we can.</p>
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: red }}
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </section>

    </main>
  );
}

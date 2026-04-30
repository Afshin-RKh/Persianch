"use client";
import { useState } from "react";
import Link from "next/link";

const navy = "#1B3A6B";
const red  = "#8B1A1A";
const gold = "#C9A84C";

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

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white";

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 fade-up">

      {/* Header */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>Get Involved</p>
        <h1 className="text-4xl font-bold mb-4" style={{ color: navy }}>Help BiruniMap grow.</h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-xl">
          BiruniMap is built by Iranians, for Iranians. Add a business, share an event, or reach out and tell us how you&apos;d like to contribute.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col group hover:border-[#1B3A6B]/30 hover:shadow-md transition-all duration-200">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: gold }}>Businesses</p>
          <h2 className="text-xl font-bold mb-3" style={{ color: navy }}>Add a Business</h2>
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            Own or know an Iranian business? Getting listed takes a few minutes and puts you in front of thousands of Iranians searching for community services abroad.
          </p>
          <ul className="mt-5 space-y-2">
            {["Open to all Iranian-run businesses", "Listed within a few days", "Visible to Iranians worldwide"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: gold }} />
                {t}
              </li>
            ))}
          </ul>
          <Link
            href="/get-listed"
            className="mt-7 block text-center text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: red }}
          >
            Add Business
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col group hover:border-[#1B3A6B]/30 hover:shadow-md transition-all duration-200">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: gold }}>Events</p>
          <h2 className="text-xl font-bold mb-3" style={{ color: navy }}>Submit an Event</h2>
          <p className="text-gray-500 text-sm leading-relaxed flex-1">
            Organising a concert, workshop, festival, or community gathering? Share it on BiruniMap and reach Iranians near you.
          </p>
          <ul className="mt-5 space-y-2">
            {["Open to all cultural events", "Shown on the events map", "Reviewed and published quickly"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: gold }} />
                {t}
              </li>
            ))}
          </ul>
          <Link
            href="/events/submit"
            className="mt-7 block text-center text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: red }}
          >
            Add Event
          </Link>
        </div>

      </div>

      {/* Join the team */}
      <div className="rounded-2xl border border-[#1B3A6B]/15 bg-white p-8 mb-14">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-3" style={{ color: navy }}>Join us</h2>
          <p className="text-gray-500 text-sm leading-relaxed">We&apos;re a small, driven team building something the Iranian diaspora actually needs. If you want to contribute — as a developer, designer, translator, content writer, or community ambassador — send us a message below and tell us how you&apos;d like to help.</p>
        </div>
      </div>

      {/* Contact form */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1.5" style={{ color: navy }}>Send us a message</h2>
          <p className="text-gray-400 text-sm">Questions, ideas, feedback — we read everything.</p>
        </div>

        {contactSent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: "#EEF2FF" }}>
              <svg className="w-6 h-6" fill="none" stroke="#1B3A6B" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: navy }}>Message received</h3>
            <p className="text-gray-400 text-sm">We&apos;ll get back to you as soon as we can.</p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name</label>
                <input type="text" required value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input type="email" required value={contactForm.email}
                  onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com" className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
              <textarea required rows={5} value={contactForm.message}
                onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                placeholder="How can we help, or how would you like to get involved?"
                className={inp + " resize-none"} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full text-white font-semibold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: red }}>
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </section>

    </main>
  );
}

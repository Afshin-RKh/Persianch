"use client";
import { useState } from "react";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

const EVENT_TYPES = [
  { value: "concert", label: "🎵 Concert" },
  { value: "show",    label: "🎭 Show" },
  { value: "march",   label: "✊ March" },
  { value: "class",   label: "📚 Class" },
  { value: "sports",  label: "🏃 Sports" },
  { value: "party",   label: "🎉 Party" },
  { value: "other",   label: "📌 Other" },
];

const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white";

export default function SubmitEventPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    title_fa: "",
    event_type: "",
    country: "",
    city: "",
    address: "",
    venue: "",
    start_date: "",
    end_date: "",
    is_recurring: false,
    recurrence_type: "weekly",
    recurrence_end_date: "",
    description: "",
    external_link: "",
    organizer_name: "",
    organizer_email: "",
  });

  const cities = form.country ? (REGIONS_BY_COUNTRY[form.country] ?? []) : [];

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Geocode venue/city
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const q = [form.address || form.venue, form.city, form.country].filter(Boolean).join(", ");
        const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
        const gd  = await geo.json();
        if (gd.length > 0) { lat = parseFloat(gd[0].lat); lng = parseFloat(gd[0].lon); }
        else {
          const geo2 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([form.city, form.country].join(", "))}&format=json&limit=1`);
          const gd2  = await geo2.json();
          if (gd2.length > 0) { lat = parseFloat(gd2[0].lat); lng = parseFloat(gd2[0].lon); }
        }
      } catch { /* non-fatal */ }

      const body: Record<string, unknown> = {
        title:          form.title,
        title_fa:       form.title_fa || null,
        event_type:     form.event_type || "other",
        country:        form.country,
        city:           form.city,
        address:        form.address || null,
        venue:          form.venue || null,
        lat,
        lng,
        start_date:     form.start_date,
        end_date:       form.end_date,
        is_recurring:   form.is_recurring,
        description:    form.description || null,
        external_link:  form.external_link || null,
        organizer_name: form.organizer_name || null,
        organizer_email:form.organizer_email || null,
      };
      if (form.is_recurring) {
        body.recurrence_type     = form.recurrence_type;
        body.recurrence_end_date = form.recurrence_end_date || null;
      }

      await fetch(`${API}/events.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-2xl font-bold mt-4 mb-2" style={{ color: "#1B3A6B" }}>Event submitted!</h2>
        <p className="text-gray-500">Our team will review and approve it shortly. Thank you for contributing to the community.</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-4xl">📅</span>
        <h1 className="text-3xl font-bold mt-3 mb-3" style={{ color: "#1B3A6B" }}>Submit an Event</h1>
        <p className="text-gray-500 leading-relaxed max-w-xl mx-auto">
          Share a Persian or Iranian community event — concerts, classes, gatherings and more.
          It will appear on the map after admin review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        {/* Basic info */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Event Info</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title *</label>
              <input type="text" required value={form.title} onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. Persian New Year Concert" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title in Persian (optional)</label>
              <input type="text" value={form.title_fa} onChange={(e) => set({ title_fa: e.target.value })}
                placeholder="عنوان به فارسی" className={inp} dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type *</label>
              <select required value={form.event_type} onChange={(e) => set({ event_type: e.target.value })} className={inp}>
                <option value="">Select type</option>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Date & time */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Date & Time</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date & Time *</label>
              <input type="datetime-local" required value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date & Time *</label>
              <input type="datetime-local" required value={form.end_date} min={form.start_date} onChange={(e) => set({ end_date: e.target.value })} className={inp} />
            </div>
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center gap-3 mt-4 cursor-pointer select-none">
            <div
              onClick={() => set({ is_recurring: !form.is_recurring })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.is_recurring ? "bg-[#1B3A6B]" : "bg-gray-200"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_recurring ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">This is a recurring event</span>
          </label>

          {form.is_recurring && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Repeats</label>
                <select value={form.recurrence_type} onChange={(e) => set({ recurrence_type: e.target.value })} className={inp}>
                  <option value="weekly">Every week</option>
                  <option value="biweekly">Every two weeks</option>
                  <option value="monthly">Every month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Series ends on (optional)</label>
                <input type="date" value={form.recurrence_end_date} onChange={(e) => set({ recurrence_end_date: e.target.value })} className={inp} />
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Location</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country *</label>
              <select required value={form.country} onChange={(e) => set({ country: e.target.value, city: "" })} className={inp}>
                <option value="">Select country</option>
                {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
              {cities.length > 0 ? (
                <select required value={form.city} onChange={(e) => set({ city: e.target.value })} className={inp}>
                  <option value="">Select city</option>
                  {[...cities].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" required value={form.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder={form.country ? "Enter city" : "Select country first"}
                  disabled={!form.country} className={inp + (!form.country ? " opacity-50" : "")} />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue Name</label>
              <input type="text" value={form.venue} onChange={(e) => set({ venue: e.target.value })}
                placeholder="e.g. Kaufleuten Zurich" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input type="text" value={form.address} onChange={(e) => set({ address: e.target.value })}
                placeholder="Street address" className={inp} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Details</p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })}
                placeholder="Tell us about the event..." className={inp + " resize-none"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (tickets / more info)</label>
              <input type="url" value={form.external_link} onChange={(e) => set({ external_link: e.target.value })}
                placeholder="https://..." className={inp} />
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Organizer (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
              <input type="text" value={form.organizer_name} onChange={(e) => set({ organizer_name: e.target.value })}
                placeholder="Full name" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email</label>
              <input type="email" value={form.organizer_email} onChange={(e) => set({ organizer_email: e.target.value })}
                placeholder="you@example.com" className={inp} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full text-white font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#1B3A6B" }}>
          {submitting ? "Submitting…" : "Submit Event →"}
        </button>
      </form>
    </main>
  );
}

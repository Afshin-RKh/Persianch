"use client";
import { useState } from "react";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const navy = "#1B3A6B";
const red  = "#8B1A1A";
const gold = "#C9A84C";

const EVENT_TYPES = [
  { value: "concert",  label: "Concert" },
  { value: "show",     label: "Show / Performance" },
  { value: "class",    label: "Class / Workshop" },
  { value: "sports",   label: "Sports" },
  { value: "party",    label: "Party / Gathering" },
  { value: "march",    label: "March / Demonstration" },
  { value: "other",    label: "Other" },
];

const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white placeholder-gray-300";

export default function SubmitEventPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", title_fa: "", event_type: "",
    country: "", city: "", address: "", venue: "",
    start_date: "", end_date: "",
    is_recurring: false, recurrence_type: "weekly", recurrence_end_date: "",
    description: "", external_link: "",
    organizer_name: "", organizer_email: "",
  });

  const cities = form.country ? (REGIONS_BY_COUNTRY[form.country] ?? []) : [];
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
        title: form.title, title_fa: form.title_fa || null,
        event_type: form.event_type || "other",
        country: form.country, city: form.city,
        address: form.address || null, venue: form.venue || null,
        lat, lng,
        start_date: form.start_date, end_date: form.end_date,
        is_recurring: form.is_recurring,
        description: form.description || null,
        external_link: form.external_link || null,
        organizer_name: form.organizer_name || null,
        organizer_email: form.organizer_email || null,
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
      <main className="max-w-2xl mx-auto px-4 py-24 text-center fade-up">
        <div className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "#EEF2FF" }}>
          <svg className="w-7 h-7" fill="none" stroke={navy} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: navy }}>Event submitted</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          Thank you. Our team will review your event and publish it on the map shortly.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 fade-up">

      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: gold }}>Community Events</p>
        <h1 className="text-4xl font-bold mb-4" style={{ color: navy }}>Submit an event.</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Share a Persian or Iranian community event — concerts, workshops, festivals, gatherings and more. It will appear on the map after a short review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Event info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Event Info</p>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event Title <span className="text-red-400">*</span></label>
            <input type="text" required value={form.title} onChange={(e) => set({ title: e.target.value })}
              placeholder="e.g. Nowruz Celebration 2025" className={inp} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title in Persian <span className="text-gray-300 font-normal">(optional)</span></label>
            <input type="text" value={form.title_fa} onChange={(e) => set({ title_fa: e.target.value })}
              placeholder="عنوان به فارسی" className={inp} dir="rtl" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-3">Event Type <span className="text-red-400">*</span></label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => set({ event_type: t.value })}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    form.event_type === t.value
                      ? "text-white border-transparent"
                      : "text-gray-500 border-gray-200 hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                  }`}
                  style={form.event_type === t.value ? { backgroundColor: navy } : {}}>
                  {t.label}
                </button>
              ))}
            </div>
            {/* Hidden required field for validation */}
            <input type="text" required value={form.event_type} onChange={() => {}} className="sr-only" tabIndex={-1} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })}
              placeholder="Tell the community what this event is about..." className={inp + " resize-none"} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Link <span className="text-gray-300 font-normal">(tickets, registration, or more info)</span></label>
            <input type="url" value={form.external_link} onChange={(e) => set({ external_link: e.target.value })}
              placeholder="https://..." className={inp} />
          </div>
        </div>

        {/* Date & time */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Date & Time</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start <span className="text-red-400">*</span></label>
              <input type="datetime-local" required value={form.start_date}
                onChange={(e) => set({ start_date: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">End <span className="text-red-400">*</span></label>
              <input type="datetime-local" required value={form.end_date} min={form.start_date}
                onChange={(e) => set({ end_date: e.target.value })} className={inp} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set({ is_recurring: !form.is_recurring })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.is_recurring ? "bg-[#1B3A6B]" : "bg-gray-200"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_recurring ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-gray-600">This is a recurring event</span>
          </label>

          {form.is_recurring && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Repeats</label>
                <select value={form.recurrence_type} onChange={(e) => set({ recurrence_type: e.target.value })} className={inp}>
                  <option value="weekly">Every week</option>
                  <option value="biweekly">Every two weeks</option>
                  <option value="monthly">Every month</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Series ends <span className="text-gray-300 font-normal">(optional)</span></label>
                <input type="date" value={form.recurrence_end_date}
                  onChange={(e) => set({ recurrence_end_date: e.target.value })} className={inp} />
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country <span className="text-red-400">*</span></label>
              <select required value={form.country} onChange={(e) => set({ country: e.target.value, city: "" })} className={inp}>
                <option value="">Select country</option>
                {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">City <span className="text-red-400">*</span></label>
              {cities.length > 0 ? (
                <select required value={form.city} onChange={(e) => set({ city: e.target.value })} className={inp}>
                  <option value="">Select city</option>
                  {[...cities].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" required value={form.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder={form.country ? "City or region" : "Select country first"}
                  disabled={!form.country}
                  className={inp + (!form.country ? " opacity-40 cursor-not-allowed" : "")} />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => set({ venue: e.target.value })}
                placeholder="e.g. Kaufleuten Zurich" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Street Address</label>
              <input type="text" value={form.address} onChange={(e) => set({ address: e.target.value })}
                placeholder="Street and number" className={inp} />
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Organizer <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name</label>
              <input type="text" value={form.organizer_name}
                onChange={(e) => set({ organizer_name: e.target.value })}
                placeholder="Your full name" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.organizer_email}
                onChange={(e) => set({ organizer_email: e.target.value })}
                placeholder="you@example.com" className={inp} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full text-white font-semibold py-3.5 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: red }}>
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your event will be reviewed by our team before appearing on the map.
        </p>

      </form>
    </main>
  );
}

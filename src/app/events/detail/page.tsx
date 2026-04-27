"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, ArrowLeft, Pencil, X } from "lucide-react";
import { useAuth, authHeaders } from "@/lib/auth";
import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

const EVENT_TYPES = Object.entries(EVENT_TYPE_META).map(([value, v]) => ({ value, label: `${v.icon} ${v.label}` }));

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function AdminEditPanel({ event, token, onSaved }: { event: EventRow; token: string | null; onSaved: (e: EventRow) => void }) {
  const [form, setForm] = useState({
    title:           event.title ?? "",
    title_fa:        event.title_fa ?? "",
    event_type:      event.event_type ?? "other",
    country:         event.country ?? "",
    city:            event.city ?? "",
    venue:           event.venue ?? "",
    address:         event.address ?? "",
    start_date:      event.start_date?.slice(0, 16) ?? "",
    end_date:        event.end_date?.slice(0, 16) ?? "",
    is_recurring:    !!event.is_recurring,
    recurrence_type: event.recurrence_type ?? "weekly",
    description:     event.description ?? "",
    external_link:   event.external_link ?? "",
    status:          (event as any).status ?? "approved",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const cities = REGIONS_BY_COUNTRY[form.country] ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API}/events.php`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ id: event.id, ...form }),
    });
    if (res.ok) {
      setSaved(true);
      onSaved({ ...event, ...form } as any);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-4">Admin — Edit Event</p>
      {saved && <p className="text-green-600 text-sm font-medium mb-3">Saved!</p>}
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title (English)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title (Persian)</label>
            <input value={form.title_fa} onChange={(e) => setForm({ ...form, title_fa: e.target.value })} className={inp} dir="rtl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Event Type</label>
            <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className={inp}>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inp}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, city: "" })} className={inp}>
              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
            {cities.length > 0 ? (
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp}>
                <option value="">— select —</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Venue</label>
            <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date & Time</label>
            <input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date & Time</label>
            <input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">External Link</label>
            <input value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} className={inp} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <label className="text-xs font-semibold text-gray-600">Recurring</label>
            <div onClick={() => setForm({ ...form, is_recurring: !form.is_recurring })}
              className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${form.is_recurring ? "bg-[#1B3A6B]" : "bg-gray-200"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_recurring ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            {form.is_recurring && (
              <select value={form.recurrence_type} onChange={(e) => setForm({ ...form, recurrence_type: e.target.value })} className={inp}>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={`${inp} resize-none`} />
        </div>
        <button type="submit" disabled={saving}
          className="text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "#1B3A6B" }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function EventDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin, token } = useAuth();
  const id = searchParams.get("id");

  const [event, setEvent]     = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    fetch(`${API}/events.php?id=${id}`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => { data ? setEvent(data) : setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return (
    <div className="text-center py-24 text-gray-400">
      <div className="text-4xl mb-4">⏳</div>
      <p>Loading event…</p>
    </div>
  );

  if (notFound || !event) return (
    <div className="text-center py-24">
      <div className="text-4xl mb-4">📅</div>
      <p className="text-gray-500 font-medium">Event not found.</p>
      <Link href="/events" className="mt-4 inline-block text-sm font-semibold underline" style={{ color: "#1B3A6B" }}>Back to Events</Link>
    </div>
  );

  const meta = EVENT_TYPE_META[event.event_type] ?? EVENT_TYPE_META.other;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Events
      </Link>

      {/* Admin edit panel */}
      {isAdmin && editing && (
        <AdminEditPanel event={event} token={token} onSaved={(updated) => { setEvent(updated); setEditing(false); }} />
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{meta.icon}</span>
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: meta.color + "20", color: meta.color }}>
                {meta.label}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{event.title}</h1>
              {event.title_fa && <p className="text-gray-400 mt-1" dir="rtl">{event.title_fa}</p>}
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => setEditing((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors"
              style={{ borderColor: "#1B3A6B", color: editing ? "white" : "#1B3A6B", backgroundColor: editing ? "#1B3A6B" : "transparent" }}>
              {editing ? <X size={13} /> : <Pencil size={13} />}
              {editing ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        {/* Info rows */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">{formatDate(event.next_occurrence ?? event.start_date)}</p>
              {event.is_recurring && (
                <p className="text-xs text-blue-500 font-medium mt-0.5">Recurring · {event.recurrence_type}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              {event.venue && <p className="font-semibold text-gray-800">{event.venue}</p>}
              <p className="text-gray-500">{[event.address, event.city, event.country].filter(Boolean).join(", ")}</p>
            </div>
          </div>
          {event.external_link && (
            <a href={event.external_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "#8B1A1A", color: "white" }}>
              <ExternalLink size={16} />
              Tickets / More Info
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">About this event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      )}
    </main>
  );
}

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-gray-400">Loading…</div>}>
      <EventDetailContent />
    </Suspense>
  );
}

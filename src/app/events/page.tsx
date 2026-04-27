"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, ChevronDown } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

export const EVENT_TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  concert:            { icon: "🎵", label: "Concert",              color: "#7C3AED" },
  theatre:            { icon: "🎭", label: "Theatre",              color: "#B45309" },
  protest:            { icon: "✊", label: "Protest / Gathering",  color: "#DC2626" },
  language_class:     { icon: "📚", label: "Language Class",       color: "#0369A1" },
  dance_class:        { icon: "💃", label: "Dance Class",          color: "#DB2777" },
  food_culture:       { icon: "🍽️", label: "Food & Culture",       color: "#D97706" },
  art_exhibition:     { icon: "🎨", label: "Art Exhibition",       color: "#059669" },
  sports:             { icon: "🏃", label: "Sports",               color: "#16A34A" },
  religious_cultural: { icon: "🕌", label: "Religious / Cultural", color: "#1B3A6B" },
  party:              { icon: "🎉", label: "Party / Celebration",  color: "#9333EA" },
  conference:         { icon: "📢", label: "Conference / Talk",    color: "#475569" },
  other:              { icon: "📌", label: "Other",                color: "#6B7280" },
};

interface EventRow {
  id: number;
  title: string;
  title_fa?: string;
  event_type: string;
  country: string;
  city: string;
  address?: string;
  venue?: string;
  lat?: number;
  lng?: number;
  start_date: string;
  end_date: string;
  next_occurrence: string;
  is_recurring: boolean;
  recurrence_type?: string;
  recurrence_end_date?: string;
  description?: string;
  external_link?: string;
}

const FILTERS = [
  { value: "week",    label: "This week" },
  { value: "month",   label: "This month" },
  { value: "6months", label: "Next 6 months" },
];

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function EventsPage() {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstance   = useRef<import("leaflet").Map | null>(null);
  const markersRef    = useRef<import("leaflet").Marker[]>([]);

  const [events, setEvents]     = useState<EventRow[]>([]);
  const [filter, setFilter]     = useState("month");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Load events
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ filter });
    if (typeFilter) params.set("type", typeFilter);
    fetch(`${API}/events.php?${params}`)
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filter, typeFilter]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true }).setView([48, 15], 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 18,
      }).addTo(map);
      mapInstance.current = map;
    });
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!mapInstance.current) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      events.forEach((ev) => {
        if (ev.lat == null || ev.lng == null) return;
        const meta = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
        const icon = L.divIcon({
          html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${meta.icon}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const marker = L.marker([ev.lat, ev.lng], { icon })
          .addTo(mapInstance.current!)
          .on("click", () => setSelected(ev));
        markersRef.current.push(marker);
      });
    });
  }, [events]);

  const filterLabel = FILTERS.find((f) => f.value === filter)?.label ?? "This month";
  const typeLabel   = typeFilter ? (EVENT_TYPE_META[typeFilter]?.label ?? "") : "";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>Community Events</h1>
          <p className="text-gray-400 text-sm mt-0.5">Persian & Iranian events around the world</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date filter */}
          <div className="relative">
            <button onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium bg-white hover:border-[#1B3A6B] transition-colors">
              <Calendar size={15} className="text-gray-400" />
              {filterLabel}
              <ChevronDown size={13} className={`text-gray-400 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-20 min-w-[160px] py-1">
                {FILTERS.map((f) => (
                  <button key={f.value} onClick={() => { setFilter(f.value); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filter === f.value ? "text-[#1B3A6B] font-semibold bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type filter */}
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
            <option value="">All types</option>
            {Object.entries(EVENT_TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>

          <Link href="/events/submit"
            className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#1B3A6B" }}>
            + Submit Event
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-6" style={{ height: 420 }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Selected event popup */}
      {selected && (
        <div className="mb-6 bg-white rounded-2xl border border-[#1B3A6B]/20 shadow-md p-5 relative">
          <button onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          <div className="flex items-start gap-3">
            <span className="text-3xl">{EVENT_TYPE_META[selected.event_type]?.icon ?? "📌"}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base">{selected.title}</h3>
              {selected.title_fa && <p className="text-gray-400 text-sm" dir="rtl">{selected.title_fa}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(selected.next_occurrence)}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{[selected.venue, selected.city, selected.country].filter(Boolean).join(", ")}</span>
                {selected.is_recurring && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Recurring · {selected.recurrence_type}</span>}
              </div>
              {selected.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{selected.description}</p>}
              {selected.external_link && (
                <a href={selected.external_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#1B3A6B] hover:underline">
                  <ExternalLink size={12} /> More info / Tickets
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-4xl">📅</span>
          <p className="text-gray-500 mt-3 font-medium">No events found for this period.</p>
          <p className="text-gray-400 text-sm mt-1">Try a wider date range or <Link href="/events/submit" className="underline text-[#1B3A6B]">submit one</Link>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => {
            const meta = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
            return (
              <div key={ev.id} onClick={() => setSelected(ev)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1B3A6B]/20 transition-all cursor-pointer p-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.color + "20", color: meta.color }}>
                      {meta.label}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 truncate">{ev.title}</h3>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="flex-shrink-0" />
                    {formatDate(ev.next_occurrence)}
                    {ev.is_recurring && <span className="text-blue-500 font-medium">· {ev.recurrence_type}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="flex-shrink-0" />
                    {[ev.venue, ev.city, ev.country].filter(Boolean).join(", ")}
                  </div>
                </div>
                {ev.description && <p className="text-xs text-gray-400 mt-3 line-clamp-2">{ev.description}</p>}
                {ev.external_link && (
                  <a href={ev.external_link} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-[#1B3A6B] hover:underline">
                    <ExternalLink size={11} /> Tickets / Info
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

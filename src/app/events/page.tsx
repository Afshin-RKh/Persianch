"use client";
import { useEffect, useState, useCallback, useMemo, Suspense, lazy } from "react";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

const EventsMap = lazy(() => import("@/components/events/EventsMap"));

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";

const DATE_FILTERS = [
  { value: "week",    label: "This week" },
  { value: "month",   label: "This month" },
  { value: "6months", label: "Next 6 months" },
];

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const activePill   = "text-white font-medium text-xs px-3 py-1.5 rounded-full";
const inactivePill = "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 font-medium text-xs px-3 py-1.5 rounded-full transition-colors";

export default function EventsPage() {
  const [allEvents, setAllEvents]     = useState<EventRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<EventRow | null>(null);
  const [showMap, setShowMap]         = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating]       = useState(false);

  const [dateFilter, setDateFilter]   = useState("month");
  const [typeFilter, setTypeFilter]   = useState("");

  // Fetch events whenever date filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ filter: dateFilter });
    fetch(`${API}/events.php?${params}`)
      .then((r) => r.json())
      .then((data) => setAllEvents(Array.isArray(data) ? data : []))
      .catch(() => setAllEvents([]))
      .finally(() => setLoading(false));
  }, [dateFilter]);

  // Client-side type filter
  const events = useMemo(() => {
    if (!typeFilter) return allEvents;
    return allEvents.filter((ev) => ev.event_type === typeFilter);
  }, [allEvents, typeFilter]);

  const handleSelect = useCallback((ev: EventRow) => setSelected(ev), []);

  const handleFindLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setShowMap(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  }, []);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#1B3A6B" }}>Community Events</h1>
              <p className="text-gray-400 text-xs mt-0.5">Persian & Iranian events around the world</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Map / List toggle */}
              <button
                onClick={() => setShowMap((v) => !v)}
                className="text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors"
                style={{ backgroundColor: showMap ? "#1B3A6B" : "white", color: showMap ? "white" : "#1B3A6B", borderColor: "#1B3A6B" }}
              >
                {showMap ? "📋 List" : "🗺️ Map"}
              </button>
              <Link
                href="/events/submit"
                className="text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#8B1A1A" }}
              >
                + Submit Event
              </Link>
            </div>
          </div>

          {/* Date filter pills */}
          <div className="flex gap-2 flex-wrap mb-2">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={dateFilter === f.value ? activePill : inactivePill}
                style={dateFilter === f.value ? { backgroundColor: "#8B1A1A" } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Event type pills */}
          <div className="flex gap-2 flex-wrap mb-2">
            <button
              onClick={() => setTypeFilter("")}
              className={!typeFilter ? activePill : inactivePill}
              style={!typeFilter ? { backgroundColor: "#8B1A1A" } : {}}
            >
              All types
            </button>
            {Object.entries(EVENT_TYPE_META).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setTypeFilter(k === typeFilter ? "" : k)}
                className={typeFilter === k ? activePill : inactivePill}
                style={typeFilter === k ? { backgroundColor: v.color } : {}}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Find My Location */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleFindLocation}
              disabled={locating}
              className="text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors disabled:opacity-60"
              style={{ backgroundColor: userLocation ? "#1B3A6B" : "white", color: userLocation ? "white" : "#1B3A6B", borderColor: "#1B3A6B" }}
            >
              {locating ? "⏳ Locating..." : "📍 Find My Location"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1" style={{ minHeight: "600px" }}>

        {/* Event list */}
        <div className={`overflow-y-auto flex-shrink-0 ${showMap ? "hidden" : "w-full"} bg-[#FDF8F3]`}>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-4">⏳</div>
                <p>Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-4">📅</p>
                <p className="font-medium">No events found.</p>
                <p className="text-sm mt-1">
                  Try a wider date range or{" "}
                  <Link href="/events/submit" className="underline text-[#1B3A6B]">submit one</Link>.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">{events.length} events found</p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {events.map((ev) => {
                    const meta = EVENT_TYPE_META[ev.event_type] ?? EVENT_TYPE_META.other;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelected(ev)}
                        className={`cursor-pointer rounded-2xl transition-all bg-white border border-gray-100 shadow-sm hover:shadow-md p-4 ${selected?.id === ev.id ? "outline outline-2 outline-offset-1 outline-[#1B3A6B]" : ""}`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-2xl">{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.color + "20", color: meta.color }}>
                              {meta.label}
                            </span>
                            <h3 className="font-bold text-gray-900 text-sm mt-1 truncate">{ev.title}</h3>
                            {ev.title_fa && <p className="text-gray-400 text-xs" dir="rtl">{ev.title_fa}</p>}
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
                        {ev.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{ev.description}</p>}
                        {ev.external_link && (
                          <a href={ev.external_link} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#1B3A6B] hover:underline">
                            <ExternalLink size={11} /> Tickets / Info
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="flex-1 relative">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Loading map...</p>
              </div>
            }>
              <EventsMap events={events} userLocation={userLocation} onSelectEvent={handleSelect} />
            </Suspense>

            {/* Selected event popup over map */}
            {selected && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[1000]">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
                >×</button>
                <div className="flex items-start gap-3 pr-4">
                  <span className="text-2xl">{EVENT_TYPE_META[selected.event_type]?.icon ?? "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{selected.title}</p>
                    {selected.title_fa && <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{selected.title_fa}</p>}
                    <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(selected.next_occurrence)}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{[selected.venue, selected.city, selected.country].filter(Boolean).join(", ")}</span>
                    </div>
                    {selected.external_link && (
                      <a href={selected.external_link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#1B3A6B] hover:underline">
                        <ExternalLink size={11} /> More info / Tickets
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

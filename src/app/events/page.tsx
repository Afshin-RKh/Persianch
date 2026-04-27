"use client";
import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const EventsMap = dynamic(() => import("@/components/events/EventsMap"), { ssr: false });

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

  const handleFindLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
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

      {/* Main content — full-height map */}
      <div className="flex flex-1" style={{ minHeight: "600px" }}>
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              <p>Loading map...</p>
            </div>
          }>
            <EventsMap events={events} userLocation={userLocation} onSelectEvent={() => {}} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

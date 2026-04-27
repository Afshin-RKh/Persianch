"use client";
import { useEffect, useState, useCallback, useMemo, Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, X } from "lucide-react";

const EventsMap = dynamic(() => import("@/components/events/EventsMap"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";
import { useAuth } from "@/lib/auth";

const DATE_FILTERS = [
  { value: "week",    label: "This week" },
  { value: "month",   label: "This month" },
  { value: "6months", label: "Next 6 months" },
];

const activePill   = "text-white font-medium text-xs px-3 py-1.5 rounded-full";
const inactivePill = "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 font-medium text-xs px-3 py-1.5 rounded-full transition-colors";

function matchesSearch(ev: EventRow, q: string): boolean {
  const s = q.toLowerCase();
  return (
    ev.title?.toLowerCase().includes(s) ||
    (ev.title_fa ?? "").includes(q) ||
    (ev.description ?? "").toLowerCase().includes(s) ||
    (ev.venue ?? "").toLowerCase().includes(s) ||
    ev.city?.toLowerCase().includes(s) ||
    ev.country?.toLowerCase().includes(s)
  );
}

export default function EventsPage() {
  const { token, isAdmin, loading: authLoading } = useAuth();
  const [allEvents, setAllEvents]     = useState<EventRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating]       = useState(false);

  const [dateFilter, setDateFilter]   = useState("month");
  const [typeFilter, setTypeFilter]   = useState("");
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch events — admins send token so backend includes pending
  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    const params = new URLSearchParams({ filter: dateFilter });
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API}/events.php?${params}`, { headers })
      .then((r) => r.json())
      .then((data) => setAllEvents(Array.isArray(data) ? data : []))
      .catch(() => setAllEvents([]))
      .finally(() => setLoading(false));
  }, [dateFilter, authLoading, token]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val.trim()), 220);
  };

  // Client-side filters: type + search
  const events = useMemo(() => {
    let out = allEvents;
    if (typeFilter) out = out.filter((ev) => ev.event_type === typeFilter);
    if (search)     out = out.filter((ev) => matchesSearch(ev, search));
    return out;
  }, [allEvents, typeFilter, search]);

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
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search artist, event, city, country…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-gray-50"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
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
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {loading ? "Loading…" : `${events.length} event${events.length !== 1 ? "s" : ""}`}
              {(search || typeFilter) ? " found" : ""}
            </span>
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

      {/* Submit event banner */}
      <div className="border-t border-gray-100 bg-[#FDF8F3] px-6 py-6 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-gray-700">Know about an Iranian event happening near you?</p>
        <p className="text-xs text-gray-400">Share it with the community and get more participants.</p>
        <Link
          href="/events/submit"
          className="text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 hover:scale-105 shadow-sm"
          style={{ backgroundColor: "#8B1A1A" }}
        >
          + Submit Event
        </Link>
      </div>
    </div>
  );
}

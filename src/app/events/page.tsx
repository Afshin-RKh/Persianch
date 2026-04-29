"use client";
import { useEffect, useState, useCallback, useMemo, useRef, Suspense, lazy } from "react";
import { Search, X, Globe, MapPin } from "lucide-react";
import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";
import { useAuth } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import Link from "next/link";

const EventsMap = lazy(() => import("@/components/events/EventsMap"));

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

const DATE_FILTERS = [
  { value: "week",    label: "This week" },
  { value: "month",   label: "This month" },
  { value: "6months", label: "Next 6 months" },
];

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
  const { token, loading: authLoading } = useAuth();
  const [allEvents, setAllEvents] = useState<EventRow[]>([]);
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [dateFilter, setDateFilter] = useState("month");
  const [typeFilter, setTypeFilter] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams({ filter: dateFilter });
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API}/events.php?${params}`, { headers })
      .then((r) => r.json())
      .then((data) => setAllEvents(Array.isArray(data) ? data : []))
      .catch(() => setAllEvents([]));
  }, [dateFilter, authLoading, token]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val.trim()), 220);
  };

  const regions = useMemo(() =>
    country ? [...(REGIONS_BY_COUNTRY[country] ?? [])].sort((a, b) => a.localeCompare(b)) : []
  , [country]);

  const events = useMemo(() => {
    let out = allEvents;
    if (typeFilter) out = out.filter((ev) => ev.event_type === typeFilter);
    if (search)     out = out.filter((ev) => matchesSearch(ev, search));
    return out;
  }, [allEvents, typeFilter, search]);

  const handleSelectEvent = useCallback((ev: EventRow) => setSelected(ev), []);

  const activePill   = "text-white font-medium text-xs px-3 py-1.5 rounded-full shadow-sm";
  const inactivePill = "font-medium text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm text-gray-700 hover:bg-white/90 bg-white/70 backdrop-blur-sm border border-white/50";

  return (
    <div className="relative" style={{ height: "calc(100vh - 64px)" }}>

      {/* Map — fills entire container */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <p>Loading map...</p>
        </div>
      }>
        <EventsMap events={events} userLocation={null} onSelectEvent={handleSelectEvent} focusCountry={country} focusRegion={region} />
      </Suspense>

      {/* Floating search + filters overlay */}
      <div className="absolute top-3 left-3 right-16 z-[1000] flex flex-col gap-2 pointer-events-none">

        {/* Search + country + region row */}
        <div className="pointer-events-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search artist, event, city, country…"
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white/80 backdrop-blur-sm shadow-md placeholder-gray-400"
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
          <div className="relative">
            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setRegion(""); }}
              className="pl-9 pr-7 py-2.5 rounded-xl border border-white/50 bg-white/80 backdrop-blur-sm text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] appearance-none min-w-[150px] shadow-md cursor-pointer"
            >
              <option value="">All Countries</option>
              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="pl-9 pr-7 py-2.5 rounded-xl border border-white/50 bg-white/80 backdrop-blur-sm text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] appearance-none min-w-[150px] shadow-md cursor-pointer"
            >
              <option value="">All Regions</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Date filter pills */}
        <div className="pointer-events-auto flex gap-2 flex-wrap">
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
        <div className="pointer-events-auto flex gap-2 flex-wrap">
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
      </div>

      {/* Selected event card */}
      {selected && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[1000]">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >×</button>
          <p className="text-sm font-bold text-gray-900 pr-4">{selected.title}</p>
          {selected.title_fa && (
            <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{selected.title_fa}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            📅 {new Date(selected.next_occurrence ?? selected.start_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <p className="text-xs text-gray-400">{selected.venue || selected.city}</p>
          <Link
            href={`/events/detail?id=${selected.id}`}
            className="mt-3 block text-center text-white text-xs font-semibold py-2 rounded-xl"
            style={{ backgroundColor: "#8B1A1A" }}
          >
            View Details →
          </Link>
        </div>
      )}
    </div>
  );
}

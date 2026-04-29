"use client";
import { useEffect, useState, useCallback, useMemo, useRef, Suspense, lazy } from "react";
import { Search, X, Globe, MapPin, Calendar } from "lucide-react";
import { EVENT_TYPE_META, EventRow } from "@/lib/eventTypes";
import { useAuth } from "@/lib/auth";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import Link from "next/link";

const EventsMap = lazy(() => import("@/components/events/EventsMap"));

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

function fmt(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function fmtDisplay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

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
  const [typeFilter, setTypeFilter] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Date range — default: today → 6 months out
  const defaultStart = fmt(new Date());
  const defaultEnd   = fmt(new Date(Date.now() + 180 * 86400000));
  const [dateFrom, setDateFrom] = useState(defaultStart);
  const [dateTo,   setDateTo]   = useState(defaultEnd);
  const [dateOpen, setDateOpen] = useState(false);
  // Temp state while picker is open
  const [tempFrom, setTempFrom] = useState(defaultStart);
  const [tempTo,   setTempTo]   = useState(defaultEnd);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const searchTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boundsRef     = useRef<{ lat_min: number; lat_max: number; lng_min: number; lng_max: number } | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchForBounds = useCallback((bounds: typeof boundsRef.current) => {
    if (!bounds || authLoading) return;
    const params = new URLSearchParams();
    params.set("lat_min", String(bounds.lat_min));
    params.set("lat_max", String(bounds.lat_max));
    params.set("lng_min", String(bounds.lng_min));
    params.set("lng_max", String(bounds.lng_max));
    params.set("date_from", dateFrom);
    params.set("date_to",   dateTo);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API}/events.php?${params}`, { headers })
      .then((r) => r.json())
      .then((data) => setAllEvents(Array.isArray(data) ? data : []))
      .catch(() => setAllEvents([]));
  }, [authLoading, token, dateFrom, dateTo]);

  const handleBoundsChange = useCallback((bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => {
    boundsRef.current = bounds;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => fetchForBounds(bounds), 300);
  }, [fetchForBounds]);

  useEffect(() => {
    if (authLoading || !boundsRef.current) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => fetchForBounds(boundsRef.current), 300);
  }, [authLoading, token, dateFrom, dateTo, fetchForBounds]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val.trim()), 220);
  };

  const openPicker = () => {
    setTempFrom(dateFrom);
    setTempTo(dateTo);
    setDateOpen(true);
  };

  const applyDates = () => {
    setDateFrom(tempFrom);
    setDateTo(tempTo || tempFrom);
    setDateOpen(false);
  };

  const clearDates = () => {
    setDateFrom(defaultStart);
    setDateTo(defaultEnd);
    setTempFrom(defaultStart);
    setTempTo(defaultEnd);
    setDateOpen(false);
  };

  const isDefault = dateFrom === defaultStart && dateTo === defaultEnd;

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
  const inactivePill = "font-medium text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm text-gray-700 hover:bg-gray-50 bg-white border border-gray-200";

  return (
    <div className="relative" style={{ height: "calc(100vh - 64px)" }}>

      {/* Map — fills entire container */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <p>Loading map...</p>
        </div>
      }>
        <EventsMap events={events} userLocation={null} onSelectEvent={handleSelectEvent} onBoundsChange={handleBoundsChange} focusCountry={country} focusRegion={region} />
      </Suspense>

      {/* Floating search + filters overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">

        {/* Row 1: Search + Dates side by side */}
        <div className="pointer-events-auto flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search artist, event, city…"
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white shadow-sm placeholder-gray-400"
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

          {/* Dates button */}
          <div className="relative flex-shrink-0" ref={datePickerRef}>
            <button
              onClick={openPicker}
              className="flex items-center gap-1.5 pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm whitespace-nowrap"
              style={{ color: isDefault ? "#9ca3af" : "#8B1A1A" }}
            >
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: isDefault ? "#9ca3af" : "#8B1A1A" }} />
              {isDefault ? "Dates" : `${fmtDisplay(dateFrom)} → ${fmtDisplay(dateTo)}`}
              {!isDefault && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearDates(); }}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </button>

            {/* Dropdown calendar */}
            {dateOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 w-72">
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Select date range</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                    <input
                      type="date"
                      value={tempFrom}
                      min={fmt(new Date())}
                      onChange={(e) => {
                        setTempFrom(e.target.value);
                        if (tempTo < e.target.value) setTempTo(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                    <input
                      type="date"
                      value={tempTo}
                      min={tempFrom || fmt(new Date())}
                      onChange={(e) => setTempTo(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={clearDates}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyDates}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl text-white"
                    style={{ backgroundColor: "#8B1A1A" }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Country + Region side by side */}
        <div className="pointer-events-auto flex gap-2">
          <div className="relative flex-1">
            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setRegion(""); }}
              className="w-full pl-9 pr-7 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">All Countries</option>
              {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full pl-9 pr-7 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">All Regions</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: Type pills — swipeable */}
        <div className="pointer-events-auto relative">
          <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, rgba(255,255,255,0.95), transparent)" }} />
          <div
            className="flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
          >
            <button
              onClick={() => setTypeFilter("")}
              className={`flex-shrink-0 ${!typeFilter ? activePill : inactivePill}`}
              style={!typeFilter ? { backgroundColor: "#8B1A1A" } : {}}
            >
              All types
            </button>
            {Object.entries(EVENT_TYPE_META).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setTypeFilter(k === typeFilter ? "" : k)}
                className={`flex-shrink-0 ${typeFilter === k ? activePill : inactivePill}`}
                style={typeFilter === k ? { backgroundColor: v.color } : {}}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
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

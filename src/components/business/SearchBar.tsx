"use client";
import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Globe } from "lucide-react";
import { COUNTRIES, REGIONS_BY_COUNTRY, Business } from "@/types";

interface Props {
  // All businesses for autocomplete suggestions
  all?: Business[];
  // Controlled values
  search: string;
  country: string;
  canton: string;
  onSearchChange: (v: string) => void;
  onCountryChange: (v: string) => void;
  onCantonChange: (v: string) => void;
}

export default function SearchBar({
  all = [],
  search,
  country,
  canton,
  onSearchChange,
  onCountryChange,
  onCantonChange,
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Regions for selected country
  const regions = country ? (REGIONS_BY_COUNTRY[country] ?? []) : Object.values(REGIONS_BY_COUNTRY).flat();

  // Build suggestions from all businesses matching current search text
  const suggestions = search.trim().length > 0
    ? all
        .filter((b) => {
          const q = search.toLowerCase();
          return (
            b.name.toLowerCase().includes(q) ||
            (b.name_fa && b.name_fa.includes(search))
          );
        })
        .slice(0, 8)
    : [];

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">

      {/* Search with autocomplete */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent shadow-sm"
        />

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {suggestions.map((b) => (
              <button
                key={b.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSearchChange(b.name);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-800 truncate">{b.name}</span>
                {b.name_fa && (
                  <span className="text-xs text-gray-400 truncate" dir="rtl">{b.name_fa}</span>
                )}
                <span className="ml-auto text-xs text-gray-300 flex-shrink-0">{b.canton}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Country */}
      <div className="relative">
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        <select
          value={country}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onCantonChange(""); // reset canton when country changes
          }}
          className="pl-9 pr-7 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 appearance-none min-w-[150px] shadow-sm cursor-pointer"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Canton */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        <select
          value={canton}
          onChange={(e) => onCantonChange(e.target.value)}
          className="pl-9 pr-7 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 appearance-none min-w-[150px] shadow-sm cursor-pointer"
        >
          <option value="">{country ? "All Regions" : "All Regions"}</option>
          {regions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

    </div>
  );
}

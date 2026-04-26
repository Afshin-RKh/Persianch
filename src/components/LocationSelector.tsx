"use client";
import { useState } from "react";
import { COUNTRIES, REGIONS_BY_COUNTRY } from "@/types";
import { X } from "lucide-react";

export interface Location { country: string; city: string; }

interface Props {
  selected: Location[];
  onChange: (locs: Location[]) => void;
  label?: string;
}

export default function LocationSelector({ selected, onChange, label = "Locations" }: Props) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [city, setCity]       = useState("");

  const cities = REGIONS_BY_COUNTRY[country] ?? [];

  const add = () => {
    const c = city.trim();
    if (!c) return;
    if (selected.some((l) => l.country === country && l.city === c)) return;
    onChange([...selected, { country, city: c }]);
    setCity("");
  };

  const remove = (idx: number) => onChange(selected.filter((_, i) => i !== idx));

  const inp = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        <select value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); }} className={inp}>
          {[...COUNTRIES].sort((a, b) => a.localeCompare(b)).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {cities.length > 0 ? (
          <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inp} flex-1 min-w-32`}>
            <option value="">— select city —</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City / region"
            className={`${inp} flex-1 min-w-32`}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          />
        )}

        <button
          type="button"
          onClick={add}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl"
          style={{ backgroundColor: "#1B3A6B" }}
        >
          Add
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((loc, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-[#1B3A6B]/10 text-[#1B3A6B] font-semibold px-2.5 py-1 rounded-full">
              {loc.city}, {loc.country}
              <button type="button" onClick={() => remove(i)} className="hover:text-red-500 transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

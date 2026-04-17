"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { SWISS_CANTONS } from "@/types";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [canton, setCanton] = useState(searchParams.get("canton") ?? "");

  // Keep in sync when URL changes (e.g. clicking a category pill)
  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
    setCanton(searchParams.get("canton") ?? "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (canton) params.set("canton", canton);
    // preserve category if present
    const cat = searchParams.get("category");
    if (cat) params.set("category", cat);
    router.push(`/businesses?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search restaurants, doctors, lawyers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:border-transparent text-sm"
        />
      </div>

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <select
          value={canton}
          onChange={(e) => setCanton(e.target.value)}
          className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 text-sm appearance-none min-w-[170px]"
        >
          <option value="">All Cantons</option>
          {SWISS_CANTONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        style={{ backgroundColor: "#8B1A1A" }}
      >
        Search
      </button>
    </form>
  );
}

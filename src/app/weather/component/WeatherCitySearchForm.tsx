"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useCallback, useEffect, useRef, useState} from "react";
import {WeatherCitySearchProps, WeatherSearchResult} from "../types/weather-types";
import {WEATHER_API_CONSTANT, WEATHER_API_TYPE} from "../constants/weather-constants";
import {logger} from "@/app/util/logger";

export default function WeatherCitySearchForm({
  setCityName,
  inputRef: externalRef,
}: WeatherCitySearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WeatherSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [error, setError] = useState("");

  const internalRef = useRef<HTMLInputElement | null>(null);
  const inputRef = externalRef ?? internalRef;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({cityName: q.trim(), type: WEATHER_API_TYPE.SEARCH});
      const res = await fetch(`${WEATHER_API_CONSTANT.BASE_ROUTE_URL}?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data: WeatherSearchResult[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIdx(-1);
    } catch (err) {
      logger.error("Autocomplete error:", (err as Error).message);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCity = (name: string) => {
    if (!name.trim()) return;
    logger.log(`Searched city ${name}`);
    setCityName(name.trim());
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      selectCity(suggestions[activeIdx].name);
      return;
    }
    if (!query.trim()) return;
    if (!/^[a-zA-Z\s\-.]{1,64}$/.test(query.trim())) {
      setError("Use letters, spaces, hyphens, and periods only (1–64 chars)");
      return;
    }
    selectCity(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder="Search city… (or press /)"
          aria-label="City name"
          aria-autocomplete="list"
          aria-expanded={open}
          className="flex-1"
        />
        <Button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? "…" : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600 mt-1" role="alert">{error}</p>}

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          {suggestions.slice(0, 5).map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === activeIdx}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                i === activeIdx ? "bg-blue-50 text-blue-700" : "text-gray-800 hover:bg-gray-50"
              }`}
              onMouseDown={() => selectCity(s.name)}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-gray-400 ml-1">
                {s.region ? `${s.region}, ` : ""}{s.country}
              </span>
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="px-4 py-2.5 text-sm text-gray-400">No cities found</li>
          )}
        </ul>
      )}
    </div>
  );
}

"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Check} from "lucide-react";
import {useDebounce} from "@/app/hooks/useDebounce";
import type {TimezoneSelectorProps} from "@/app/timezone/types";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function TimezoneSelector({
                                           options,
                                           selected,
                                           onAdd,
                                         }: TimezoneSelectorProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return options;
    const lower = debouncedQuery.toLowerCase();
    return options.filter(
      (entry) =>
        entry.timezone.toLowerCase().includes(lower) ||
        entry.country.toLowerCase().includes(lower)
    );
  }, [debouncedQuery, options]);

  const highlightRegex = useMemo(
    () => (debouncedQuery ? new RegExp(`(${escapeRegex(debouncedQuery)})`, "ig") : null),
    [debouncedQuery]
  );

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const highlight = useCallback(
    (text: string) => {
      if (!highlightRegex) return text;
      const lowerQuery = debouncedQuery.toLowerCase();

      return text.split(highlightRegex).map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <span key={i} className="font-semibold">
            {part}
          </span>
        ) : (
          part
        )
      );
    },
    [highlightRegex, debouncedQuery]
  );

  const commitSelection = (idx: number) => {
    const entry = filtered[idx];
    if (entry && !selected.includes(entry.timezone)) {
      onAdd(entry.timezone);
    }
    setQuery("");
    setActiveIndex(0);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i === 0 ? filtered.length - 1 : i - 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      commitSelection(activeIndex);
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setQuery("");
      setActiveIndex(0);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search by country or timezone..."
        className="w-full rounded-xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
        onKeyDown={handleKeyDown}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              No results found
            </div>
          ) : (
            filtered.map((entry, index) => {
              const isSelected = selected.includes(entry.timezone);
              return (
                <div
                  key={`${entry.country}-${entry.timezone}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitSelection(index)}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 ${
                    index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-900 truncate">
                      {highlight(entry.country)}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {highlight(entry.timezone)}
                    </span>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-green-500 shrink-0 ml-2"/>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

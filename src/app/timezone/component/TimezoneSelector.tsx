"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {Check} from "lucide-react";
import {useDebounce} from "@/app/hooks/useDebounce";

export default function TimezoneSelector({
                                           options,
                                           selected,
                                           onAdd,
                                         }: {
  options: string[];
  selected: string[];
  onAdd: (tz: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query);
  
  const filtered = useMemo(() => {
    if (!debouncedQuery) return options;
    return options.filter((tz) =>
      tz.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, options]);
  
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
  
  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const regex = new RegExp(`(${q})`, "ig");
    
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    }
    
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        i === 0 ? filtered.length - 1 : i - 1
      );
    }
    
    if (e.key === "Enter") {
      e.preventDefault();
      const tz = filtered[activeIndex];
      if (tz && !selected.includes(tz)) {
        onAdd(tz);
      }
      setQuery("");
      setActiveIndex(0);
      setOpen(false);
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
        placeholder="Search timezone..."
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
            filtered.map((tz, index) => (
              <div
                key={tz}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!selected.includes(tz)) {
                    onAdd(tz);
                  }
                  setQuery("");
                  setOpen(false);
                }}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                  index === activeIndex
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <span>{highlight(tz, debouncedQuery)}</span>
                
                {selected.includes(tz) && (
                  <Check size={16} className="text-green-500"/>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
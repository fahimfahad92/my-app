"use client";

import {BookmarkPlus, Cloud, GripVertical, Info, ListCollapse, RefreshCcw, WifiOff,} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {toast} from "sonner";
import WeatherCard from "./component/WeatherCard";
import WeatherCitySearchForm from "./component/WeatherCitySearchForm";
import {
  getFromLocalStorage,
  removeItemFromLocalStorageArray,
  setInLocalStorage,
  setItemInLocalStorageAsArray,
} from "@/app/util/LocalStorageHelper";
import HomeComponent from "@/app/weather/component/HomeComponent";
import {logger} from "@/app/util/logger";
import {useStatsigEvents} from "@/components/statsig-event";
import type {WeatherEventMetadata, WeatherEventName} from "@/app/weather/types/weather-types";
import type {TemperatureUnit} from "@/app/weather/types/weather-types";
import {MAX_CITIES, TEMP_UNIT_KEY} from "@/app/weather/constants/weather-constants";

const WEATHER_EVENT: WeatherEventName = "myapp_pv_weather";

export default function WeatherApp() {
  const [cityName, setCityName] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [watchList, setWatchList] = useState<string[]>([]);
  const [unit, setUnit] = useState<TemperatureUnit>("C");
  const [isOnline, setIsOnline] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const {logEvent} = useStatsigEvents();
  const hasFired = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Init: load from localStorage and URL params
  useEffect(() => {
    logger.info("Initializing cities from local storage");

    // 5.2: restore persisted temp unit
    const savedUnit = localStorage.getItem(TEMP_UNIT_KEY);
    if (savedUnit === "F" || savedUnit === "C") setUnit(savedUnit);

    const urlCities = searchParams.get("cities")?.split(",").filter(Boolean) ?? [];
    const stored = getFromLocalStorage<string>("watchList");
    const normalizedStored = Array.from(
      new Set((stored || []).map((c) => c?.trim().toLowerCase()).filter(Boolean))
    );

    setWatchList(normalizedStored);

    if (urlCities.length > 0) {
      // 5.5: seed from URL, merging with watchlist
      const merged = Array.from(
        new Set([...urlCities.map((c) => c.trim().toLowerCase()), ...normalizedStored])
      ).slice(0, MAX_CITIES);
      setCities(merged);
    } else {
      setCities(normalizedStored);

      // 5.1: Geolocation auto-detect on first visit (no stored cities, no URL)
      if (normalizedStored.length === 0 && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const {latitude, longitude} = pos.coords;
            setCityName(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
          },
          () => { /* user denied — silently skip */ }
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5.4: Offline banner
  useEffect(() => {
    if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // 5.5: Sync cities to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (cities.length > 0) params.set("cities", cities.join(","));
    router.replace(cities.length > 0 ? `?${params.toString()}` : "?", {scroll: false});
  }, [cities, router]);

  // 5.6: Keyboard shortcut `/` → focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Page-view analytics — fires once
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    const meta: WeatherEventMetadata = {page: "weather"};
    logEvent(WEATHER_EVENT, meta);
  }, [logEvent]);

  // City-add effect
  useEffect(() => {
    const normalizedCity = cityName.trim().toLowerCase();
    if (!normalizedCity) return;

    setCities((prevCities: string[]) => {
      if (prevCities.includes(normalizedCity)) {
        toast.info(`${cityName} is already shown below`);
        return [...prevCities];
      }
      if (prevCities.length >= MAX_CITIES) {
        toast.warning(`Maximum ${MAX_CITIES} cities reached. Remove one to add more.`);
        return prevCities;
      }
      logger.info("City updated for " + cityName);
      const meta: WeatherEventMetadata = {page: "weather", city: normalizedCity, action: "add"};
      logEvent(WEATHER_EVENT, meta);
      return [normalizedCity, ...prevCities];
    });
    setCityName("");
  }, [cityName, logEvent]);

  const removeCity = useCallback((city: string) => {
    setCities((prev) => prev.filter((c) => c !== city));
  }, []);

  const addToWatchList = useCallback((city: string) => {
    const normalized = city.trim().toLowerCase();
    const current = getFromLocalStorage<string>("watchList").map((c) => c.trim().toLowerCase());
    if (current.includes(normalized)) {
      toast.error(`${city} is already in the watch list`);
      return;
    }
    setItemInLocalStorageAsArray("watchList", normalized);
    setWatchList((prev) => [...prev, normalized]);
    toast.success(`${city} added to watch list`);
  }, []);

  const removeFromWatchList = useCallback((city: string) => {
    const normalized = city.trim().toLowerCase();
    removeItemFromLocalStorageArray("watchList", normalized);
    setWatchList((prev) => prev.filter((c) => c !== normalized));
    removeCity(normalized);
    toast.info(`${city} removed`);
  }, [removeCity]);

  const fixCity = useCallback((prevCity: string, updatedCity: string) => {
    const prev = prevCity.trim().toLowerCase();
    const normalized = updatedCity.trim().toLowerCase();
    if (!normalized) return;
    setCities((prevCities) => {
      const without = prevCities.filter((c) => c !== prev);
      if (without.includes(normalized)) return without;
      return [normalized, ...without];
    });
  }, []);

  // 5.2: Toggle °C / °F and persist
  const toggleUnit = () => {
    setUnit((prev) => {
      const next = prev === "C" ? "F" : "C";
      setInLocalStorage(TEMP_UNIT_KEY, next);
      return next;
    });
  };

  // 5.11: Drag-and-drop reorder
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    setCities((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <>
      {/* 5.4: Offline banner */}
      {!isOnline && (
        <div className="w-full bg-yellow-400 text-yellow-900 text-sm font-medium py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4"/>
          You are offline. Showing cached data.
        </div>
      )}

      <div className="relative min-h-screen flex flex-col items-center justify-start pt-10 p-4 bg-gray-50 space-y-4">
        <div className="absolute top-4 left-40">
          <HomeComponent/>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-center">Weather APP</h1>
          {/* 5.2: °C / °F toggle */}
          <button
            onClick={toggleUnit}
            className="text-sm font-semibold px-2 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-colors select-none"
            aria-label={`Switch to °${unit === "C" ? "F" : "C"}`}
            title={`Switch to °${unit === "C" ? "F" : "C"}`}
          >
            °C · °F
          </button>
        </div>

        <div className="w-full max-w-xl flex items-center mb-6 relative gap-3">
          {/* 5.6: pass ref for keyboard shortcut */}
          <WeatherCitySearchForm setCityName={setCityName} inputRef={searchInputRef}/>

          {/* Info Tooltip */}
          <div className="relative group shrink-0">
            <Info className="w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer"
                  aria-describedby="weather-icons-tip" aria-label="Weather card icon legend"/>
            <div
              id="weather-icons-tip"
              role="tooltip"
              className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50 space-y-2"
            >
              <p className="text-sm text-gray-800 font-medium mb-1">What the icons mean:</p>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <RefreshCcw className="w-4 h-4"/><span>Refresh weather data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <ListCollapse className="w-4 h-4"/><span>Show weather details</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <GripVertical className="w-4 h-4"/><span>Drag to reorder</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <BookmarkPlus className="w-4 h-4"/><span>Add city to watch list</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {cities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-gray-400">
            <Cloud className="w-16 h-16 opacity-30"/>
            <p className="text-base">Search for a city above to see its current weather</p>
            <p className="text-sm opacity-70">Tip: press <kbd className="px-1.5 py-0.5 rounded border border-gray-300 text-gray-500 font-mono text-xs">/</kbd> to focus the search box</p>
          </div>
        )}

        {/* 5.11: Drag-and-drop grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
          {cities.map((city, idx) =>
            city ? (
              <div
                key={city}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={draggedIndex === idx ? "opacity-40" : ""}
              >
                <WeatherCard
                  cityName={city}
                  removeCity={removeCity}
                  addToWatchList={addToWatchList}
                  removeFromWatchList={removeFromWatchList}
                  fixCity={fixCity}
                  isSaved={watchList.includes(city)}
                  unit={unit}
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    </>
  );
}

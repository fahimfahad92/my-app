"use client";

import {BookmarkPlus, Cloud, Info, ListCollapse, RefreshCcw, Trash2,} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import WeatherCard from "./component/WeatherCard";
import WeatherCitySearchForm from "./component/WeatherCitySearchForm";
import {
  getFromLocalStorage,
  removeItemFromLocalStorageArray,
  setItemInLocalStorageAsArray,
} from "@/app/util/LocalStorageHelper";
import HomeComponent from "@/app/weather/component/HomeComponent";
import {logger} from "@/app/util/logger";
import {useStatsigEvents} from "@/components/statsig-event";
import type {WeatherEventMetadata, WeatherEventName} from "@/app/weather/types/weather-types";
import {MAX_CITIES} from "@/app/weather/constants/weather-constants";

const WEATHER_EVENT: WeatherEventName = "myapp_pv_weather";

export default function WeatherApp() {
  const [cityName, setCityName] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [watchList, setWatchList] = useState<string[]>([]);
  const {logEvent} = useStatsigEvents();
  const hasFired = useRef(false);

  // 3.3: Dedicated init effect — load from localStorage only, no logEvent dep
  useEffect(() => {
    logger.info("Initializing cities from local storage");
    const stored = getFromLocalStorage<string>("watchList");
    const normalized = Array.from(
      new Set((stored || []).map((c) => c?.trim().toLowerCase()).filter(Boolean))
    );
    setCities(normalized);
    setWatchList(normalized);
  }, []);

  // 3.2: Page-view event fires once, guarded by hasFired ref
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    const meta: WeatherEventMetadata = {page: "weather"};
    logEvent(WEATHER_EVENT, meta);
  }, [logEvent]);

  useEffect(() => {
    const normalizedCity = cityName.trim().toLowerCase();
    if (!normalizedCity) return;

    setCities((prevCities: string[]) => {
      if (prevCities.includes(normalizedCity)) {
        toast.info(`${cityName} is already shown below`);
        return [...prevCities];
      }
      // 4.9: Enforce city cap with user feedback
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
  
  const removeCity = useCallback((cityName: string) => {
    setCities((prev) => prev.filter((currentLocation) => currentLocation !== cityName));
  }, []);
  
  const addToWatchList = useCallback((cityName: string) => {
    const normalized = cityName.trim().toLowerCase();
    const current = getFromLocalStorage<string>("watchList").map((c) => c.trim().toLowerCase());
    if (current.includes(normalized)) {
      logger.info(`${cityName} is already in the watch list`);
      toast.error(`${cityName} is already in the watch list`);
      return;
    }
    setItemInLocalStorageAsArray("watchList", normalized);
    setWatchList((prev) => [...prev, normalized]);
    logger.info(`${cityName} added to watch list`);
    toast.success(`${cityName} added to watch list`);
  }, []);

  const removeFromWatchList = useCallback((cityName: string) => {
    const normalized = cityName.trim().toLowerCase();
    removeItemFromLocalStorageArray("watchList", normalized);
    setWatchList((prev) => prev.filter((c) => c !== normalized));
    removeCity(normalized);
    toast.info(`${cityName} removed`);
  }, [removeCity]);
  
  const fixCity = useCallback((prevCity: string, updatedCity: string) => {
    const prev = prevCity.trim().toLowerCase();
    const normalizedCity = updatedCity.trim().toLowerCase();
    if (!normalizedCity) return;
    
    setCities((prevCities: string[]) => {
      const withoutPrev = prevCities.filter((c) => c !== prev);
      if (withoutPrev.includes(normalizedCity)) {
        // If the corrected city already exists, just remove the previous entry
        return withoutPrev;
      }
      logger.log("City updated for " + updatedCity);
      return [normalizedCity, ...withoutPrev];
    });
  }, []);
  
  return (
    <>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 space-y-4">
        <div className="absolute top-4 left-40">
          <HomeComponent/>
        </div>
        
        <h1 className="text-2xl font-semibold mb-6 text-center">Weather APP</h1>
        
        <div className="w-full max-w-xl flex items-center mb-6 relative">
          {/* Search Form */}
          <WeatherCitySearchForm setCityName={setCityName}/>
          
          {/* Info Tooltip */}
          <div className="relative group ml-4">
            <Info className="w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer"
                  aria-describedby="weather-icons-tip" aria-label="Weather card icon legend"/>
            
            <div
              id="weather-icons-tip"
              role="tooltip"
              className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50 space-y-2">
              <p className="text-sm text-gray-800 font-medium mb-1">
                What the icons mean:
              </p>
              
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <RefreshCcw className="w-4 h-4"/>
                <span>Refresh weather data</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <ListCollapse className="w-4 h-4"/>
                <span>Show weather details</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Trash2 className="w-4 h-4"/>
                <span>Delete city</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <BookmarkPlus className="w-4 h-4"/>
                <span>Add city to watch list</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 4.8: Empty state */}
        {cities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-gray-400">
            <Cloud className="w-16 h-16 opacity-30"/>
            <p className="text-base">Search for a city above to see its current weather</p>
          </div>
        )}

        {/* 4.12: auto-fill grid keeps cards from stretching on 2K+ screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
          {cities.map((city) =>
            city ? (
              <div key={city} className="p-2">
                <WeatherCard
                  cityName={city}
                  removeCity={removeCity}
                  addToWatchList={addToWatchList}
                  removeFromWatchList={removeFromWatchList}
                  fixCity={fixCity}
                  isSaved={watchList.includes(city)}
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    </>
  );
}

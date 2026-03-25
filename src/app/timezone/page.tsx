"use client";

import {useEffect, useState} from "react";
import TimezoneSelector from "@/app/timezone/component/TimezoneSelector";
import ClockList from "@/app/timezone/component/ClockList";
import HomeComponent from "@/app/weather/component/HomeComponent";
import {TIMEZONES} from "@/app/timezone/data/TIMEZONES";
import {getFromLocalStorage, setInLocalStorage} from "@/app/util/LocalStorageHelper";

export default function Timezones() {
  const [timezones, setTimezones] = useState<string[]>([]);
  
  useEffect(() => {
    const stored = getFromLocalStorage<string>("timezones");
    if (stored && stored?.length > 0) {
      console.log('Initializing from local storage', stored);
      setTimezones(stored);
    }
  }, []);
  
  useEffect(() => {
    setInLocalStorage("timezones", timezones);
  }, [timezones]);
  
  const addTimezone = (tz: string) => {
    if (!tz || timezones.includes(tz) || !TIMEZONES.includes(tz)) return;
    setTimezones((prev) => [...prev, tz]);
  };
  
  const removeTimezone = (tz: string) => {
    setTimezones((prev) => prev.filter((t) => t !== tz));
  };
  
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="absolute top-4 left-40">
        <HomeComponent/>
      </div>
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          🌍 World Clock
        </h1>
        
        <TimezoneSelector
          options={TIMEZONES}
          selected={timezones}
          onAdd={addTimezone}
        />
        
        <ClockList timezones={timezones} onRemove={removeTimezone}/>
      </div>
    </main>
  );
}
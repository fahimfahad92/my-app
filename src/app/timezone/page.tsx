"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import TimezoneSelector from "@/app/timezone/component/TimezoneSelector";
import ClockList from "@/app/timezone/component/ClockList";
import HomeComponent from "@/app/weather/component/HomeComponent";
import {TIMEZONE_ENTRIES, TIMEZONES} from "@/app/timezone/data/TIMEZONES";
import {getFromLocalStorage, setInLocalStorage} from "@/app/util/LocalStorageHelper";
import {useStatsigEvents} from "@/components/statsig-event";
import {logger} from "@/app/util/logger";
import {MAX_TIMEZONES} from "@/app/timezone/types";

export default function Timezones() {
  const [timezones, setTimezones] = useState<string[]>([]);
  const {logEvent} = useStatsigEvents();
  const hasFired = useRef(false);

  useEffect(() => {
    const stored = getFromLocalStorage<string>("timezones");
    if (stored && stored.length > 0) {
      logger.log("Initializing from local storage", stored);
      setTimezones(stored);
    }
  }, []);

  useEffect(() => {
    if (!hasFired.current) {
      hasFired.current = true;
      return;
    }
    setInLocalStorage("timezones", timezones);
    logEvent("myapp_pv_timezone", {page: "timezone", timezones: timezones.join(",")});
  }, [timezones, logEvent]);

  const addTimezone = useCallback((tz: string) => {
    if (!tz || timezones.includes(tz) || !TIMEZONES.includes(tz)) return;
    if (timezones.length >= MAX_TIMEZONES) {
      toast.warning(`You can track up to ${MAX_TIMEZONES} timezones at a time.`, {
        description: "Remove one to add another.",
      });
      return;
    }
    setTimezones((prev) => [...prev, tz]);
  }, [timezones]);

  const removeTimezone = useCallback((tz: string) => {
    setTimezones((prev) => prev.filter((t) => t !== tz));
  }, []);

  const reorderTimezones = useCallback((from: number, to: number) => {
    setTimezones((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="absolute top-4 left-40">
        <HomeComponent/>
      </div>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          🌍 World Clock
        </h1>

        <TimezoneSelector
          options={TIMEZONE_ENTRIES}
          selected={timezones}
          onAdd={addTimezone}
        />

        <ClockList
          timezones={timezones}
          onRemove={removeTimezone}
          onReorder={reorderTimezones}
        />
      </div>
    </main>
  );
}

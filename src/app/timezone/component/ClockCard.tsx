"use client";

import {memo, useEffect, useMemo, useState} from "react";
import {X} from "lucide-react";
import {logger} from "@/app/util/logger";
import {cn} from "@/lib/utils";
import type {ClockCardProps} from "@/app/timezone/types";

function getOffset(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return raw.replace("GMT", "UTC");
  } catch {
    return "";
  }
}

function ClockCard({timezone, onRemove}: ClockCardProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isDay, setIsDay] = useState(true);
  const [isLocal, setIsLocal] = useState(false);

  const offset = useMemo(() => getOffset(timezone), [timezone]);

  useEffect(() => {
    setIsLocal(Intl.DateTimeFormat().resolvedOptions().timeZone === timezone);
  }, [timezone]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      try {
        const formattedTime = now.toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedDate = now.toLocaleDateString("en-US", {
          timeZone: timezone,
          weekday: "long",
          month: "short",
          day: "numeric",
        });
        const hourString = now.toLocaleString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          hour12: false,
        });
        const hour = parseInt(hourString, 10);

        setTime(formattedTime);
        setDate(formattedDate);
        setIsDay(hour >= 6 && hour < 18);
      } catch (err) {
        logger.error("Invalid timezone:", timezone, err);
        return;
      }
    };

    updateTime();

    // Align ticks to the next minute boundary, then run once per minute.
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      updateTime();
      intervalId = setInterval(updateTime, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [timezone]);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl p-4 shadow-md border transition-all duration-300 hover:shadow-lg",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        isDay
          ? "bg-sky-50 border-sky-100"
          : "bg-slate-800 border-slate-700 text-slate-100"
      )}
    >
      <button
        onClick={() => onRemove(timezone)}
        aria-label={`Remove ${timezone}`}
        className={cn(
          "absolute top-2 right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity",
          isDay
            ? "text-slate-500 hover:bg-slate-200 hover:text-red-600"
            : "text-slate-300 hover:bg-slate-700 hover:text-red-400"
        )}
      >
        <X size={16}/>
      </button>

      <div className="flex items-center gap-2">
        <p
          className={cn(
            "text-sm font-medium truncate pr-6",
            isDay ? "text-slate-600" : "text-slate-300"
          )}
          title={timezone}
        >
          {timezone}
        </p>
        {isLocal && (
          <span
            className={cn(
              "px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full font-semibold",
              isDay
                ? "bg-emerald-100 text-emerald-700"
                : "bg-emerald-900/60 text-emerald-300"
            )}
          >
            Local
          </span>
        )}
      </div>

      {offset && (
        <p
          className={cn(
            "text-xs mt-0.5",
            isDay ? "text-slate-400" : "text-slate-400"
          )}
        >
          {offset}
        </p>
      )}

      <p className="text-3xl font-semibold tracking-wide mt-3 tabular-nums">
        {time || "—"}
      </p>

      <p
        className={cn(
          "text-sm mt-1",
          isDay ? "text-slate-500" : "text-slate-300"
        )}
      >
        {date}
      </p>
    </div>
  );
}

export default memo(ClockCard);

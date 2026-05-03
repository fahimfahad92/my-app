"use client";

import {cn} from "@/lib/utils";
import {Hourly} from "@/app/weather/types/weather-types";
import {TemperatureUnit} from "@/app/weather/types/weather-types";

function getCurrentHourIndex(hours: Hourly[]): number {
  const now = Date.now();
  let closest = 0;
  let minDiff = Infinity;
  hours.forEach((h, i) => {
    const [datePart, timePart] = h.time.split(" ");
    const [y, mo, d] = datePart.split("-").map(Number);
    const [hr, min] = timePart.split(":").map(Number);
    const ts = new Date(y, mo - 1, d, hr, min).getTime();
    const diff = Math.abs(now - ts);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}

function formatStripHour(timeString: string): string {
  const hhmm = timeString.slice(11, 16);
  const h = parseInt(hhmm.slice(0, 2), 10);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}${period}`;
}

export default function HourlyStrip({
  hours,
  unit,
}: {
  hours: Hourly[];
  unit: TemperatureUnit;
}) {
  if (!hours.length) return null;
  const currentIdx = getCurrentHourIndex(hours);

  return (
    <div className="flex overflow-x-auto gap-2 py-2 scrollbar-hide">
      {hours.map((h, i) => {
        const temp = unit === "C" ? h.temp_c : h.temp_f;
        const tempUnit = unit === "C" ? "°C" : "°F";
        const rainH = h.chance_of_rain;
        const isCurrent = i === currentIdx;

        return (
          <div
            key={h.time}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[52px] rounded-xl px-1 py-2 shrink-0",
              isCurrent
                ? "ring-2 ring-blue-400 bg-blue-50"
                : "bg-gray-50"
            )}
          >
            <span className="text-[11px] text-gray-500 font-medium">{formatStripHour(h.time)}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.condition.icon} alt={h.condition.text} className="w-7 h-7"/>
            <span className="text-xs font-semibold text-gray-800">{temp}{tempUnit}</span>
            {/* Mini rain bar */}
            <div className="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400"
                style={{width: `${rainH}%`}}
              />
            </div>
            <span className="text-[10px] text-blue-500">{rainH}%</span>
          </div>
        );
      })}
    </div>
  );
}

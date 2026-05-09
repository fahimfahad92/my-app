"use client";

import {cn} from "@/lib/utils";
import {Hourly, TemperatureUnit} from "@/app/weather/types/weather-types";

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
  const h = parseInt(timeString.slice(11, 13), 10);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}${period}`;
}

function HourCell({
  h,
  isCurrent,
  unit,
  className,
}: {
  h: Hourly;
  isCurrent: boolean;
  unit: TemperatureUnit;
  className?: string;
}) {
  const temp = unit === "C" ? h.temp_c : h.temp_f;
  const tempUnit = unit === "C" ? "°C" : "°F";
  const rainH = h.chance_of_rain;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-1 py-2",
        isCurrent ? "ring-2 ring-blue-400 bg-blue-50" : "bg-gray-50",
        className
      )}
    >
      <span className="text-[11px] text-gray-500 font-medium">{formatStripHour(h.time)}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={h.condition.icon} alt={h.condition.text} className="w-7 h-7"/>
      <span className="text-xs font-semibold text-gray-800">{temp}{tempUnit}</span>
      <div className="w-8 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full bg-blue-400" style={{width: `${rainH}%`}}/>
      </div>
      <span className="text-[10px] text-blue-500">{rainH}%</span>
    </div>
  );
}

export default function HourlyStrip({hours, unit}: {hours: Hourly[]; unit: TemperatureUnit}) {
  if (!hours.length) return null;

  const currentIdx = getCurrentHourIndex(hours);
  const amHours = hours.slice(0, 12);
  const pmHours = hours.slice(12);

  return (
    <>
      {/* Small screens — single horizontally scrollable row */}
      <div className="md:hidden flex overflow-x-auto gap-2 py-1 scrollbar-hide">
        {hours.map((h, i) => (
          <HourCell key={h.time} h={h} isCurrent={i === currentIdx} unit={unit} className="shrink-0 min-w-[52px]"/>
        ))}
      </div>

      {/* md+ — AM row on top, PM row below; cells stretch to fill width evenly */}
      <div className="hidden md:flex flex-col gap-1">
        <div className="flex gap-1">
          {amHours.map((h, i) => (
            <HourCell key={h.time} h={h} isCurrent={i === currentIdx} unit={unit} className="flex-1 min-w-0"/>
          ))}
        </div>
        <div className="flex gap-1">
          {pmHours.map((h, i) => (
            <HourCell key={h.time} h={h} isCurrent={i + 12 === currentIdx} unit={unit} className="flex-1 min-w-0"/>
          ))}
        </div>
      </div>
    </>
  );
}

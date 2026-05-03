"use client";

import {CloudRain, Droplets, Eye, Wind} from "lucide-react";
import {cn} from "@/lib/utils";
import {DaySummary} from "@/app/weather/types/weather-types";
import {getUvColor, getUvLabel} from "@/app/weather/util/conditionUtils";

export default function DayStatsSection({day}: { day: DaySummary }) {
  const uvPercent = Math.min((day.uv / 12) * 100, 100);

  return (
    <div className="space-y-4">
      {/* UV Index */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">UV Index</span>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full text-white", getUvColor(day.uv))}>
            {day.uv} — {getUvLabel(day.uv)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", getUvColor(day.uv))}
            style={{width: `${uvPercent}%`}}
          />
        </div>
      </div>

      {/* 2×2 stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCell icon={<Droplets className="w-4 h-4 text-blue-500"/>} label="Avg Humidity" value={`${day.avghumidity}%`}/>
        <StatCell icon={<Eye className="w-4 h-4 text-slate-500"/>} label="Avg Visibility" value={`${day.avgvis_km} km`}/>
        <StatCell icon={<Wind className="w-4 h-4 text-cyan-500"/>} label="Max Wind" value={`${day.maxwind_kph} kph`}/>
        <StatCell icon={<CloudRain className="w-4 h-4 text-indigo-500"/>} label="Total Precip" value={`${day.totalprecip_mm} mm`}/>
      </div>
    </div>
  );
}

function StatCell({icon, label, value}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

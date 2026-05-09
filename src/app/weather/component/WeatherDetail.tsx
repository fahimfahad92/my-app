"use client";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {useEffect, useMemo, useState} from "react";
import {cn} from "@/lib/utils";
import {ChevronDown, ListCollapse} from "lucide-react";
import {WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {TemperatureDataPoint, TemperatureUnit, WeatherDetailResponse,} from "../types/weather-types";
import LineChartComponent from "./LineChartComponent";
import HourlyStrip from "./HourlyStrip";
import DayStatsSection from "./DayStatsSection";
import {DetailSkeleton} from "./Skeletons";
import {logger} from "@/app/util/logger";
import {getMoonEmoji} from "@/app/weather/util/conditionUtils";

function formatDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WeatherDetail({
  cityName,
  localTimeEpoch,
  tzId,
  unit,
  triggerClassName,
}: {
  cityName: string;
  localTimeEpoch: number;
  tzId: string;
  unit: TemperatureUnit;
  triggerClassName?: string;
}) {
  const [data, setData] = useState<WeatherDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [astroOpen, setAstroOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const queryDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: tzId,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(localTimeEpoch * 1000));

    try {
      const urlParams = new URLSearchParams({
        cityName: cityName || "",
        type: WEATHER_API_TYPE.DETAIL,
        queryDate,
      });
      const url = `${WEATHER_API_CONSTANT.BASE_ROUTE_URL}?${urlParams.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");

      const result: WeatherDetailResponse = await response.json();
      setData(result);
      setSelectedDay(0);
    } catch (err) {
      logger.error("Error fetching detail:", (err as Error).message);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityName) fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName, localTimeEpoch, tzId]);

  const chartData = useMemo<TemperatureDataPoint[]>(() => {
    if (!data) return [];
    const day = data.forecast.forecastday[selectedDay];
    return (day?.hour ?? []).map((h) => ({
      hour: h.time,
      temp: h.temp_c,
      temp_f: h.temp_f,
      feelslike_c: h.feelslike_c,
      feelslike_f: h.feelslike_f,
      chance_of_rain: h.chance_of_rain,
      icon: h.condition?.icon,
    }));
  }, [data, selectedDay]);

  const forecastDay = data?.forecast.forecastday[selectedDay];
  const unitLabel = unit === "C" ? "°C" : "°F";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Show weather details"
          title="Show weather details"
          className={cn("w-full rounded-none", triggerClassName)}
        >
          <ListCollapse className="w-4 h-4"/>
        </Button>
      </DialogTrigger>

      {/*
        Override shadcn defaults (grid gap-4 p-6 sm:max-w-lg):
          flex flex-col gap-0  — replace grid with a plain column
          p-0                  — sections manage their own padding
          max-w-* / max-h-*   — wider + taller than the default sm:max-w-lg
          overflow-y-auto      — kept as a plain scroll safety net; no overflow-hidden tricks
      */}
      <DialogContent className="flex flex-col gap-0 p-0 max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">

        {loading && <DetailSkeleton/>}

        {error && (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button variant="outline" onClick={fetchData}>Retry</Button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/*
              Sticky header — stays visible while the user scrolls on small screens.
              pr-10 leaves room for the shadcn built-in ✕ close button (absolute top-4 right-4).
            */}
            <div className="sticky top-0 z-10 bg-background border-b pl-4 sm:pl-6 pr-10 pt-5 pb-3">
              <DialogHeader>
                <DialogTitle className="text-lg">{data.location.name}</DialogTitle>
                <DialogDescription className="text-sm">{data.location.country}</DialogDescription>
              </DialogHeader>

              {data.forecast.forecastday.length > 1 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {data.forecast.forecastday.map((day, i) => (
                    <Button
                      key={day.date}
                      variant={selectedDay === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(i)}
                    >
                      {formatDayLabel(day.date, i)}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/*
              Two-column layout on md+, single column on smaller screens.
              No overflow-hidden, no flex-1 height tricks — columns are content-height
              driven. On a 1080p screen both columns fit within 90vh without scrolling.
            */}
            {forecastDay && (
              <div className="md:grid md:grid-cols-[2fr_3fr]">

                {/* Left column — summary, stats, astronomy */}
                <div className="p-4 sm:p-5 space-y-4 md:border-r">

                  {/* Day summary: icon + condition + high/low in one row */}
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={forecastDay.day.condition.icon}
                      alt={forecastDay.day.condition.text}
                      className="h-14 w-14 flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{forecastDay.day.condition.text}</p>
                      <div className="flex gap-5 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">High</p>
                          <p className="font-semibold">
                            {unit === "C" ? forecastDay.day.maxtemp_c : forecastDay.day.maxtemp_f}{unitLabel}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Low</p>
                          <p className="font-semibold">
                            {unit === "C" ? forecastDay.day.mintemp_c : forecastDay.day.mintemp_f}{unitLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DayStatsSection day={forecastDay.day}/>

                  {/*
                    Astronomy: toggle button visible only on < md (single-column view).
                    On md+ the section is always shown — no toggle button rendered.
                  */}
                  <div>
                    <button
                      className="md:hidden w-full flex items-center justify-between text-xs font-medium text-gray-500 py-1"
                      onClick={() => setAstroOpen(v => !v)}
                    >
                      <span>Astronomy — {forecastDay.astro.sunrise} / {forecastDay.astro.sunset}</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 flex-shrink-0 transition-transform", astroOpen && "rotate-180")}/>
                    </button>
                    <p className="hidden md:block text-xs font-medium text-gray-500 mb-2">Astronomy</p>
                    <div className={cn(
                      "grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm mt-2 md:mt-0",
                      astroOpen ? "grid" : "hidden md:grid"
                    )}>
                      <AstroCell label="Sunrise" value={forecastDay.astro.sunrise}/>
                      <AstroCell label="Sunset" value={forecastDay.astro.sunset}/>
                      <AstroCell label="Moonrise" value={forecastDay.astro.moonrise}/>
                      <AstroCell label="Moonset" value={forecastDay.astro.moonset}/>
                      <AstroCell
                        label="Moon Phase"
                        value={`${getMoonEmoji(forecastDay.astro.moon_phase)} ${forecastDay.astro.moon_phase}`}
                      />
                      <AstroCell label="Illumination" value={`${forecastDay.astro.moon_illumination}%`}/>
                    </div>
                  </div>

                  {/* Close button — only in the left column on md+ */}
                  <div className="hidden md:block pt-1">
                    <DialogClose asChild>
                      <Button variant="secondary">Close</Button>
                    </DialogClose>
                  </div>
                </div>

                {/* Right column — hourly strip + chart */}
                <div className="p-4 sm:p-5 space-y-3 border-t md:border-t-0">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Hourly</p>
                    <HourlyStrip hours={forecastDay.hour} unit={unit}/>
                  </div>

                  <LineChartComponent
                    date={formatDayLabel(forecastDay.date, selectedDay)}
                    chartData={chartData}
                    unit={unit}
                  />
                </div>
              </div>
            )}

            {/* Footer close button — only on < md (md+ uses the left-column button) */}
            {forecastDay && (
              <div className="md:hidden px-4 pb-4 pt-2 border-t">
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AstroCell({label, value}: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

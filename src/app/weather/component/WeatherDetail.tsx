"use client";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {useEffect, useMemo, useState} from "react";
import {cn} from "@/lib/utils";
import {ListCollapse} from "lucide-react";
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

      <DialogContent className="w-full max-w-4xl sm:max-w-2xl md:max-w-3xl max-h-[85vh] overflow-y-auto px-2 sm:px-4">
        {loading ? (
          <DetailSkeleton/>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button variant="outline" onClick={fetchData}>Retry</Button>
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">{data.location.name}</DialogTitle>
              <DialogDescription className="text-sm md:text-base">{data.location.country}</DialogDescription>
            </DialogHeader>

            {/* Day-selector tabs */}
            {data.forecast.forecastday.length > 1 && (
              <div className="flex gap-2 flex-wrap">
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

            {forecastDay && (
              <div className="space-y-5 pb-2">
                {/* Day summary */}
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Max Temp</p>
                    <p className="font-semibold">{unit === "C" ? forecastDay.day.maxtemp_c : forecastDay.day.maxtemp_f}{unitLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Min Temp</p>
                    <p className="font-semibold">{unit === "C" ? forecastDay.day.mintemp_c : forecastDay.day.mintemp_f}{unitLabel}</p>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={forecastDay.day.condition.icon} alt={forecastDay.day.condition.text} className="h-14 w-14"/>
                  </div>
                </div>

                {/* 5.15: Day stats — UV, humidity, visibility, wind, precip */}
                <DayStatsSection day={forecastDay.day}/>

                {/* 5.16: Astronomy + moon phase */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm">
                  <AstroCell label="Sunrise" value={forecastDay.astro.sunrise}/>
                  <AstroCell label="Sunset" value={forecastDay.astro.sunset}/>
                  <AstroCell label="Moonrise" value={forecastDay.astro.moonrise}/>
                  <AstroCell label="Moonset" value={forecastDay.astro.moonset}/>
                  <AstroCell
                    label="Moon Phase"
                    value={`${getMoonEmoji(forecastDay.astro.moon_phase)} ${forecastDay.astro.moon_phase}`}
                  />
                  <AstroCell
                    label="Illumination"
                    value={`${forecastDay.astro.moon_illumination}%`}
                  />
                </div>

                {/* 5.14: Horizontal hourly strip */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Hourly</p>
                  <HourlyStrip hours={forecastDay.hour} unit={unit}/>
                </div>

                {/* 5.13: ComposedChart */}
                <LineChartComponent
                  date={formatDayLabel(forecastDay.date, selectedDay)}
                  chartData={chartData}
                  unit={unit}
                />
              </div>
            )}

            <DialogFooter className="mt-4 sm:justify-start">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : null}
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

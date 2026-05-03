"use client";

import {Button} from "@/components/ui/button";
import {BookmarkMinus, BookmarkPlus, Droplets, Eye, GripVertical, RefreshCcw, Wind, X} from "lucide-react";
import {toast} from "sonner";
import {CACHE_TTL_MS, WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {TemperatureUnit, WeatherResponse} from "../types/weather-types";
import WeatherDetail from "./WeatherDetail";
import {memo, useEffect, useState} from "react";
import {CardSkeleton} from "@/app/weather/component/Skeletons";
import {logger} from "@/app/util/logger";
import {cn} from "@/lib/utils";
import {getCardBackground} from "@/app/weather/util/conditionUtils";

const MAX_CACHE_SIZE = 20;
const overviewCache = new Map<string, { data: WeatherResponse; ts: number }>();
const pendingRequests = new Map<string, Promise<WeatherResponse>>();

function getTimeSince(epochSeconds: number): string {
  const diffMin = Math.floor((Date.now() - epochSeconds * 1000) / 60000);
  if (diffMin < 1) return "Just now";
  return `${diffMin} min ago`;
}

function WeatherCard({
                       cityName,
                       removeCity,
                       addToWatchList,
                       removeFromWatchList,
                       fixCity,
                       isSaved,
                       unit,
                     }: {
  cityName: string;
  removeCity: (data: string) => void;
  addToWatchList: (data: string) => void;
  removeFromWatchList: (data: string) => void;
  fixCity: (prevCity: string, updatedCity: string) => void;
  isSaved: boolean;
  unit: TemperatureUnit;
}) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState("Just now");

  const fetchData = async (isUpdate: boolean) => {
    const cacheKey = cityName.trim().toLowerCase();
    try {
      if (!isUpdate) {
        const cached = overviewCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
          setData(cached.data);
          toast.success(`Loaded cached data for ${cityName}`);
          return;
        }

        const inflight = pendingRequests.get(cacheKey);
        if (inflight) {
          const result = await inflight;
          setData(result);
          return;
        }
      }

      const urlParams = new URLSearchParams({
        cityName: cityName || "",
        type: WEATHER_API_TYPE.OVERVIEW,
      });
      const url = `${WEATHER_API_CONSTANT.BASE_ROUTE_URL}?${urlParams.toString()}`;

      const promise: Promise<WeatherResponse> = fetch(url).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Something went wrong");
        }
        return response.json() as Promise<WeatherResponse>;
      });

      if (!isUpdate) pendingRequests.set(cacheKey, promise);

      let result: WeatherResponse;
      try {
        result = await promise;
      } finally {
        pendingRequests.delete(cacheKey);
      }

      setData(result);

      if (overviewCache.size >= MAX_CACHE_SIZE) {
        const oldest = overviewCache.keys().next().value;
        if (oldest !== undefined) overviewCache.delete(oldest);
      }
      overviewCache.set(cacheKey, {data: result, ts: Date.now()});

      if (cityName !== result.location.name.toLowerCase()) {
        fixCity(cityName, result.location.name);
      }
      if (isUpdate) {
        toast.info(`Weather data updated for ${cityName}`);
      } else {
        toast.success(`Got data for ${cityName}`);
      }
    } catch (err) {
      logger.error("Error fetching data:", (err as Error).message);
      setError((err as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cityName) return;
    setError(null);
    fetchData(false);
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName]);

  useEffect(() => {
    if (!error) return;
    toast.error(`Error: ${error}`);
    removeCity(cityName);
  }, [error, cityName, removeCity]);

  useEffect(() => {
    if (!data) return;
    const epoch = data.current.last_updated_epoch;
    setLastUpdatedText(getTimeSince(epoch));
    const id = setInterval(() => setLastUpdatedText(getTimeSince(epoch)), 60000);
    return () => clearInterval(id);
  }, [data]);

  const refreshData = () => {
    if (!cityName) return;
    setError(null);
    fetchData(true);
  };

  if (loading) return <CardSkeleton/>;
  if (error) return null;
  if (!data) return null;

  const { bg, isDark } = getCardBackground(data.current.condition.code, data.current.is_day);
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/70" : "text-gray-500";
  const borderColor = isDark ? "border-white/20" : "border-gray-200";

  const temp = unit === "C" ? data.current.temp_c : data.current.temp_f;
  const feelslike = unit === "C" ? data.current.feelslike_c : data.current.feelslike_f;
  const tempUnit = unit === "C" ? "°C" : "°F";

  const forecastDay = data.forecast?.forecastday?.[0];
  const maxTemp = forecastDay
    ? (unit === "C" ? forecastDay.day.maxtemp_c : forecastDay.day.maxtemp_f)
    : null;
  const minTemp = forecastDay
    ? (unit === "C" ? forecastDay.day.mintemp_c : forecastDay.day.mintemp_f)
    : null;
  const rainChance = forecastDay?.day.daily_chance_of_rain ?? 0;

  return (
    <div
      className={cn(
        "flex justify-center p-4 transition-all",
        isHighlighted ? "motion-safe:scale-[1.02]" : ""
      )}
    >
      <div className={cn(
        "w-full max-w-sm rounded-2xl shadow-md border overflow-hidden",
        borderColor,
        "bg-gradient-to-br",
        bg
      )}>
        {/* Header row: city + rain badge */}
        <div className="flex items-start justify-between px-4 pt-4 pb-1">
          <div>
            <p className={cn("text-lg font-semibold leading-tight", textPrimary)}>
              {data.location.name}
            </p>
            <p className={cn("text-xs", textMuted)}>{data.location.country}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Drag handle — rendered by parent wrapper */}
            <GripVertical className={cn("w-4 h-4 opacity-40 cursor-grab", textPrimary)}/>
            {rainChance >= 30 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/80 text-white">
                🌧 {rainChance}%
              </span>
            )}
          </div>
        </div>

        {/* Condition icon + text */}
        <div className="flex flex-col items-center pt-2 pb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-20 h-20"
            src={data.current.condition.icon}
            alt={data.current.condition.text}
          />
          <p className={cn("text-sm", textMuted)}>{data.current.condition.text}</p>
        </div>

        {/* Hero temperature */}
        <div className="flex flex-col items-center py-1">
          <p className={cn("text-5xl font-bold", textPrimary)}>
            {temp}{tempUnit}
          </p>
          <p className={cn("text-sm mt-1", textMuted)}>Feels like {feelslike}{tempUnit}</p>
        </div>

        {/* Max/min + timezone row */}
        {maxTemp !== null && minTemp !== null && (
          <div className="flex justify-center gap-4 py-1">
            <p className={cn("text-xs", textMuted)}>
              H:{maxTemp}{tempUnit} L:{minTemp}{tempUnit}
            </p>
            <span className={cn("text-xs", textMuted)}>·</span>
            <p className={cn("text-xs", textMuted)}>{data.location.tz_id}</p>
          </div>
        )}

        {/* Icon stat strip */}
        <div className={cn("flex justify-center gap-5 py-2 border-t mt-2", borderColor)}>
          <div className="flex items-center gap-1">
            <Droplets className={cn("w-3.5 h-3.5", textMuted)}/>
            <span className={cn("text-xs", textPrimary)}>{data.current.humidity}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wind className={cn("w-3.5 h-3.5", textMuted)}/>
            <span className={cn("text-xs", textPrimary)}>{data.current.wind_kph} {data.current.wind_dir}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className={cn("w-3.5 h-3.5", textMuted)}/>
            <span className={cn("text-xs", textMuted)}>Updated {lastUpdatedText}</span>
          </div>
        </div>

        {/* Action buttons row */}
        <div className={cn("grid grid-cols-4 border-t", borderColor)}>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            aria-label="Refresh weather data"
            title="Refresh weather data"
            className={cn("rounded-none", isDark ? "text-white hover:bg-white/10" : "")}
          >
            <RefreshCcw className="w-4 h-4"/>
          </Button>

          <WeatherDetail
            cityName={cityName}
            localTimeEpoch={data.location.localtime_epoch}
            tzId={data.location.tz_id}
            unit={unit}
            triggerClassName={isDark ? "text-white hover:bg-white/10" : ""}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCity(cityName)}
            aria-label="Dismiss from page"
            title="Dismiss from page (watchlist unchanged)"
            className={cn("rounded-none", isDark ? "text-white hover:bg-white/10" : "")}
          >
            <X className="w-4 h-4"/>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => isSaved ? removeFromWatchList(cityName) : addToWatchList(cityName)}
            aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"}
            title={isSaved ? "Remove from watchlist" : "Save to watchlist"}
            className={cn(
              "rounded-none",
              isSaved
                ? (isDark ? "text-red-300 hover:bg-white/10" : "text-red-500 hover:bg-red-50")
                : (isDark ? "text-white hover:bg-white/10" : "")
            )}
          >
            {isSaved ? <BookmarkMinus className="w-4 h-4"/> : <BookmarkPlus className="w-4 h-4"/>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(WeatherCard);

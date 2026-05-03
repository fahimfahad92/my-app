import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {BookmarkMinus, BookmarkPlus, RefreshCcw, X} from "lucide-react";
import {toast} from "sonner";
import {CACHE_TTL_MS, WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {WeatherResponse} from "../types/weather-types";
import WeatherDetail from "./WeatherDetail";
import {memo, useEffect, useState} from "react";
import {CardSkeleton} from "@/app/weather/component/Skeletons";
import {logger} from "@/app/util/logger";
import {cn} from "@/lib/utils";

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
                     }: {
  cityName: string;
  removeCity: (data: string) => void;
  addToWatchList: (data: string) => void;
  removeFromWatchList: (data: string) => void;
  fixCity: (prevCity: string, updatedCity: string) => void;
  isSaved: boolean;
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
  }, [cityName]);

  useEffect(() => {
    if (!error) return;
    toast.error(`Error: ${error}`);
    removeCity(cityName);
  }, [error, cityName, removeCity]);

  // 4.1: Live "updated X min ago" counter, ticks every minute
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

  return (
    <div
      className={cn(
        "flex justify-center p-4 transition-all",
        // 4.10: Scale animation opt-out for reduced-motion users
        isHighlighted ? "font-bold motion-safe:scale-[1.02] bg-blue-200 rounded-2xl" : "bg-gray-50"
      )}
    >
      <Card className="w-full max-w-sm rounded-2xl shadow-md border border-gray-200 bg-white">
        <CardHeader className="flex flex-col items-center text-center space-y-1 pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {data.location.name}
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            {data.location.country}
          </CardDescription>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mx-auto w-14 h-14"
            src={data.current.condition.icon}
            alt={data.current.condition.text}
          />
          {/* 4.5: Condition description text */}
          <p className="text-sm text-gray-600">{data.current.condition.text}</p>
        </CardHeader>

        <CardContent className="px-4 pb-3 space-y-3">
          <p className="text-center text-xs text-gray-400">
            {data.location.tz_id}
            <span className="mx-1">·</span>
            {data.location.localtime}
          </p>

          <div className="text-center">
            <Label className="text-3xl font-bold text-blue-600">
              {data.current.temp_c}°C
            </Label>
          </div>

          {/* 4.6 + 4.11: Feels-like, humidity, wind in a compact secondary row */}
          <div className="grid grid-cols-3 gap-1 text-center">
            <div>
              <p className="text-sm font-medium text-gray-700">{data.current.feelslike_c}°C</p>
              <p className="text-xs text-gray-400">Feels like</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{data.current.humidity}%</p>
              <p className="text-xs text-gray-400">Humidity</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{data.current.wind_kph} {data.current.wind_dir}</p>
              <p className="text-xs text-gray-400">Wind (kph)</p>
            </div>
          </div>

          {/* 4.1: Live "updated X min ago" timestamp */}
          <p className="text-center text-xs text-gray-400">Updated {lastUpdatedText}</p>
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            aria-label="Refresh weather data"
            title="Refresh weather data"
          >
            <RefreshCcw className="w-4 h-4"/>
          </Button>

          <WeatherDetail
            cityName={cityName}
            localTimeEpoch={data.location.localtime_epoch}
            tzId={data.location.tz_id}
          />

          {/* 4.4: Dismiss from page only — does not remove from watchlist */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeCity(cityName)}
            aria-label="Dismiss from page"
            title="Dismiss from page (watchlist unchanged)"
          >
            <X className="w-4 h-4"/>
          </Button>

          {/* 4.4: Bookmark toggle — add or remove from watchlist */}
          <Button
            variant={isSaved ? "destructive" : "default"}
            size="sm"
            onClick={() => isSaved ? removeFromWatchList(cityName) : addToWatchList(cityName)}
            aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"}
            title={isSaved ? "Remove from watchlist" : "Save to watchlist"}
          >
            {isSaved ? <BookmarkMinus className="w-4 h-4"/> : <BookmarkPlus className="w-4 h-4"/>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default memo(WeatherCard);

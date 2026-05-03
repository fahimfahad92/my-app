import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {BookmarkPlus, RefreshCcw, Trash2} from "lucide-react";
import {toast} from "sonner";
import {CACHE_TTL_MS, WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {WeatherResponse} from "../types/weather-types";
import WeatherDetail from "./WeatherDetail";

import {memo, useEffect, useState} from "react";
import {CardSkeleton} from "@/app/weather/component/Skeletons";
import {logger} from "@/app/util/logger";

const MAX_CACHE_SIZE = 20;
const overviewCache = new Map<string, { data: WeatherResponse; ts: number }>();
const pendingRequests = new Map<string, Promise<WeatherResponse>>();

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

        // 3.5: Reuse an in-flight request for the same city instead of firing a duplicate
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

      // 3.1: Evict the oldest entry when the cache reaches capacity
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
  
  // Move side-effects out of render: handle error via effect
  useEffect(() => {
    if (!error) return;
    toast.error(`Error: ${error}`);
    removeCity(cityName);
  }, [error, cityName, removeCity]);
  
  const refreshData = () => {
    if (!cityName || cityName === "") return;
    setError(null);
    fetchData(true);
  };
  
  if (loading) return <CardSkeleton/>;
  if (error) {
    return null;
  }
  if (!data) return null;
  
  return (
    <div
      className={`flex justify-center p-6 transition-all ${
        isHighlighted
          ? "font-bold scale-[1.02] bg-blue-200 rounded-2xl" // Highlighted
          : "bg-gray-50" // Normal
      }`}
    >
      <Card
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl shadow-md border border-gray-200 bg-white">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <CardTitle className="text-xl font-semibold text-gray-800">
            {data.location.name}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {data.location.country}
          </CardDescription>
          <img
            className="mx-auto w-16 h-16"
            src={data.current.condition.icon}
            alt={data.current.condition.text}
          />
        </CardHeader>
        
        <CardContent className="px-6 pb-4 space-y-2">
          <div className="flex flex-col space-y-1.5 items-center">
            <p className="text-sm text-gray-500">Timezone</p>
            <Label className="text-base font-medium text-gray-700">
              {data.location.tz_id}
            </Label>
          </div>
          <div className="flex flex-col space-y-1.5 items-center">
            <p className="text-sm text-gray-500">Local Time</p>
            <Label className="text-base font-medium text-gray-700">
              {data.location.localtime}
            </Label>
          </div>
          <div className="flex flex-col space-y-1.5 items-center">
            <p className="text-sm text-gray-500">Last Updated</p>
            <Label className="text-base font-medium text-gray-700">
              {data.current.last_updated}
            </Label>
          </div>
          <div className="flex flex-col space-y-1.5 items-center">
            <p className="text-sm text-gray-500">Time of Day</p>
            <Label className="text-base font-medium text-gray-700">
              {data.current.is_day ? "Day" : "Night"}
            </Label>
          </div>
          <div className="flex flex-col space-y-1.5 items-center">
            <p className="text-sm text-gray-500">Temperature</p>
            <Label className="text-xl font-semibold text-blue-600">
              {data.current.temp_c}°C
            </Label>
          </div>
        </CardContent>
        
        <CardFooter className="grid grid-cols-2 space-x-2 space-y-2 items-center justify-between text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="center"
            aria-label="Refresh weather data"
            title="Refresh weather data"
          >
            {/* Refresh */}
            <RefreshCcw/>
          </Button>
          
          <WeatherDetail
            cityName={cityName}
            localTimeEpoch={data.location.localtime_epoch}
            tzId={data.location.tz_id}
          />
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeFromWatchList(cityName)}
            className="center"
            aria-label="Remove city from watch list"
            title="Remove city from watch list"
          >
            <Trash2 className="w-4 h-4 mr-2"/>
          </Button>
          <Button
            variant={isSaved ? "secondary" : "default"}
            size="sm"
            onClick={() => {
              if (!isSaved) addToWatchList(cityName);
            }}
            className="center"
            aria-label={isSaved ? "Already in watch list" : "Add city to watch list"}
            title={isSaved ? "Already in watch list" : "Add city to watch list"}
            disabled={isSaved}
          >
            <BookmarkPlus className="w-4 h-4 mr-2"/>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default memo(WeatherCard);

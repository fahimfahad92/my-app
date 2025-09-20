import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {BookmarkPlus, RefreshCcw, Trash2} from "lucide-react";
import {toast} from "sonner";
import {WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {WeatherResponse} from "../types/weather-types";
import WeatherDetail from "./WeatherDetail";

import {memo, useEffect, useState} from "react";
import {CardSkeleton} from "@/app/weather/component/Skeletons";
import {getArrayFromLocalStorage} from "@/app/weather/util/LocalStorageHelper";
import {logger} from "@/app/weather/util/logger";

// Simple in-memory cache with TTL for weather overview requests
const WEATHER_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const overviewCache = new Map<string, { data: WeatherResponse; ts: number }>();

function WeatherCard({
                       cityName,
                       removeCity,
                       addToWatchList,
                       removeFromWatchList,
                       fixCity,
                     }: {
  cityName: string;
  removeCity: (data: string) => void;
  addToWatchList: (data: string) => void;
  removeFromWatchList: (data: string) => void;
  fixCity: (prevCity: string, updatedCity: string) => void;
}) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localDate, setLocalDate] = useState<string>("");
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const fetchData = async (isUpdate: boolean) => {
    try {
      const cacheKey = cityName.trim().toLowerCase();
      if (!isUpdate) {
        const cached = overviewCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < WEATHER_CACHE_TTL_MS) {
          setData(cached.data);
          setLocalDate(cached.data.location.localtime);
          setLoading(false);
          toast.success(`Loaded cached data for ${cityName}`);
          return;
        }
      }
      
      const urlParams = new URLSearchParams({
        cityName: cityName || "",
        type: WEATHER_API_TYPE.OVERVIEW,
      });
      
      const url = `${
        WEATHER_API_CONSTANT.BASE_ROUTE_URL
      }?${urlParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }
      
      const result: WeatherResponse = await response.json();
      setData(result);
      setLocalDate(result.location.localtime);
      // update cache
      overviewCache.set(cityName.trim().toLowerCase(), {
        data: result,
        ts: Date.now(),
      });
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
    
    // reflect watch list state
    const watch = getArrayFromLocalStorage<string>("watchList").map((c) => c?.trim().toLowerCase());
    setIsSaved(watch.includes(cityName.trim().toLowerCase()));
    
    setIsHighlighted(true); // Highlight on mount/update
    const timer = setTimeout(() => setIsHighlighted(false), 2000); // Remove after 2s
    return () => clearTimeout(timer);
  }, [cityName]);
  
  // Move side-effects out of render: handle error via effect
  useEffect(() => {
    if (!error) return;
    toast.error(`Error: ${error}`);
    removeCity(cityName);
  }, [error, cityName, removeCity]);
  
  const refreshData = () => {
    if (!cityName || cityName == "") return;
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
          
          <WeatherDetail cityName={cityName} localDate={localDate}/>
          
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
              if (!isSaved) {
                addToWatchList(cityName);
                setIsSaved(true);
              }
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

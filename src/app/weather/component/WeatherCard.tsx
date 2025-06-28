import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookmarkPlus, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WeatherResponse } from "../types/weather-types";
import WeatherDetail from "./WeatherDetail";

export default function WeatherCard({
  cityName,
  removeCity,
  addToWatchList,
  removefromWatchList,
}: {
  cityName: string;
  removeCity: (data: string) => void;
  addToWatchList: (data: string) => void;
  removefromWatchList: (data: string) => void;
}) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localDate, setLocalDate] = useState<string>("");

  const url =
    `${process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL}` +
    `${process.env.NEXT_PUBLIC_WEATHER_API_GET_CURRENT_DATA_PATH}` +
    `${process.env.NEXT_PUBLIC_WEATHER_API_API_KEY}` +
    `&q=${encodeURIComponent(cityName)}`;

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log("Weather card API call for " + cityName);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result: WeatherResponse = await response.json();
      setData(result);
      setLocalDate(result.location.localtime);
    } catch (err: unknown) {
      console.error("Error fetching data:", err);
      setError((err as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cityName) return;
    setError(null);
    fetchData();
  }, [cityName]);

  const refreshData = () => {
    if (!cityName || cityName == "") return;
    fetchData();
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    toast.error(`Error: ${error}`);
    setError(null);
    removeCity(cityName);
    return null;
  }
  if (!data) return null;

  return (
    <div className="flex justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl shadow-md border border-gray-200 bg-white">
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
          >
            {/* Refresh */}
            <RefreshCcw />
          </Button>

          <WeatherDetail cityName={cityName} localDate={localDate} />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => removefromWatchList(cityName)}
            className="center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => addToWatchList(cityName)}
            className="center"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

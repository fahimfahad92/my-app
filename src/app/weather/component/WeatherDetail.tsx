"use client";

import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
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
import {Label} from "@radix-ui/react-label";
import {useEffect, useMemo, useState} from "react";
import {ListCollapse} from "lucide-react";
import {WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {TemperatureDataPoint, WeatherDetailResponse,} from "../types/weather-types";
import LineChartComponent from "./LineChartComponent";
import {DetailSkeleton} from "./Skeletons";
import {logger} from "@/app/util/logger";

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
                                        cityName, localTimeEpoch, tzId,
                                      }: {
  cityName: string;
  localTimeEpoch: number;
  tzId: string;
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
        queryDate: queryDate,
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
  }, [cityName, localTimeEpoch, tzId]);

  // 4.7: Derive chart data for the selected forecast day via memo
  const chartData = useMemo<TemperatureDataPoint[]>(() => {
    if (!data) return [];
    const day = data.forecast.forecastday[selectedDay];
    return (day?.hour ?? []).map((h) => ({
      hour: h.time,
      temp: h.temp_c,
      icon: h.condition?.icon,
    }));
  }, [data, selectedDay]);

  const forecastDay = data?.forecast.forecastday[selectedDay];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="Show weather details" title="Show weather details">
          <ListCollapse className="w-4 h-4 mr-2"/>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-4xl sm:max-w-2xl md:max-w-3xl max-h-[80vh] overflow-y-auto px-2 sm:px-4">
        {loading ? (
          <DetailSkeleton/>
        ) : error ? (
          // 4.2: Retry button on error
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button variant="outline" onClick={fetchData}>Retry</Button>
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">
                {data.location.name}
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base">
                {data.location.country}
              </DialogDescription>
            </DialogHeader>

            {/* 4.7: Day-selector tabs */}
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

            <Card>
              <CardContent className="space-y-6 pt-6 px-4 md:px-8">
                {forecastDay && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center text-sm md:text-base">
                      <div>
                        <Label>Max Temp</Label>
                        <div>{forecastDay.day.maxtemp_c}°C</div>
                      </div>
                      <div>
                        <Label>Min Temp</Label>
                        <div>{forecastDay.day.mintemp_c}°C</div>
                      </div>
                      <div className="col-span-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={forecastDay.day.condition.icon}
                          alt={forecastDay.day.condition.text}
                          className="mx-auto h-16 w-16"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center text-sm md:text-base">
                      <div>
                        <Label>Sunrise</Label>
                        <div>{forecastDay.astro.sunrise}</div>
                      </div>
                      <div>
                        <Label>Sunset</Label>
                        <div>{forecastDay.astro.sunset}</div>
                      </div>
                      <div>
                        <Label>Moonrise</Label>
                        <div>{forecastDay.astro.moonrise}</div>
                      </div>
                      <div>
                        <Label>Moonset</Label>
                        <div>{forecastDay.astro.moonset}</div>
                      </div>
                    </div>

                    <LineChartComponent
                      date={formatDayLabel(forecastDay.date, selectedDay)}
                      chartData={chartData}
                    />
                  </>
                )}
              </CardContent>
            </Card>

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

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
import {useEffect, useState} from "react";

import {ListCollapse} from "lucide-react";
import {WEATHER_API_CONSTANT, WEATHER_API_TYPE,} from "../constants/weather-constants";
import {TemperatureDataPoint, WeatherDetailResponse,} from "../types/weather-types";
import LineChartComponent from "./LineChartComponent";
import {DetailSkeleton} from "./Skeletons";
import {logger} from "../util/logger";

export default function WeatherDetail({
                                        cityName, localDate,
                                      }: {
  cityName: string;
  localDate: string;
}) {
  const [data, setData] = useState<WeatherDetailResponse | null>(null);
  const [chartData, setChartData] = useState<TemperatureDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    // Prefer parsing the YYYY-MM-DD portion from localDate to avoid timezone shifts
    const queryDate = (localDate && localDate.includes(" ")
      ? localDate.split(" ")[0]
      : new Date(localDate).toISOString().split("T")[0]);
    
    try {
      const urlParams = new URLSearchParams({
        cityName: cityName || "",
        type: WEATHER_API_TYPE.DETAIL,
        queryDate: queryDate,
      });
      const url = `${
        WEATHER_API_CONSTANT.BASE_ROUTE_URL
      }?${urlParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const result: WeatherDetailResponse = await response.json();
      setData(result);
      
      const hourly = result?.forecast?.forecastday[0]?.hour.map((h) => ({
        hour: h.time,
        temp: h.temp_c,
        icon: h.condition?.icon,
      }));
      
      setChartData(hourly);
    } catch (err) {
      logger.error("Error fetching detail:", (err as Error).message);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (cityName) fetchData();
  }, [cityName, localDate]);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-label="Show weather details" title="Show weather details">
          <ListCollapse className="w-4 h-4 mr-2"/>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-full max-w-4xl sm:max-w-2xl md:max-w-3xl max-h-[70vh] overflow-y-auto px-2 sm:px-4">
        {loading ? (
          <DetailSkeleton/>
        ) : error ? (
          <div className="text-red-500 text-center p-4">Error: {error}</div>
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
            
            <Card>
              <CardContent className="space-y-6 pt-6 px-4 md:px-8">
                {/* Temperature Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center text-sm md:text-base">
                  <div>
                    <Label>Max Temp</Label>
                    <div>{data.forecast.forecastday[0].day.maxtemp_c}°C</div>
                  </div>
                  <div>
                    <Label>Min Temp</Label>
                    <div>{data.forecast.forecastday[0].day.mintemp_c}°C</div>
                  </div>
                  <div className="col-span-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.forecast.forecastday[0].day.condition.icon}
                      alt={data.forecast.forecastday[0].day.condition.text}
                      className="mx-auto h-16 w-16"
                    />
                  </div>
                </div>
                
                {/* Astro Info */}
                <div className="grid grid-cols-2 gap-4 text-center text-sm md:text-base">
                  <div>
                    <Label>Sunrise</Label>
                    <div>{data.forecast.forecastday[0].astro.sunrise}</div>
                  </div>
                  <div>
                    <Label>Sunset</Label>
                    <div>{data.forecast.forecastday[0].astro.sunset}</div>
                  </div>
                  <div>
                    <Label>Moonrise</Label>
                    <div>{data.forecast.forecastday[0].astro.moonrise}</div>
                  </div>
                  <div>
                    <Label>Moonset</Label>
                    <div>{data.forecast.forecastday[0].astro.moonset}</div>
                  </div>
                </div>
                
                {/* Temperature Graph */}
                <LineChartComponent
                  date={data.location.localtime}
                  chartData={chartData}
                />
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

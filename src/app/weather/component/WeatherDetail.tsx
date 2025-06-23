"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";

import {
  TemperatureDataPoint,
  WeatherDetailResponse,
} from "../types/weather-types";
import LineChartComponent from "./LineChartComponent";

export default function WeatherDetail({
  cityName,
  localDate,
}: {
  cityName: string;
  localDate: string;
}) {
  const [data, setData] = useState<WeatherDetailResponse | null>(null);
  const [chartData, setChartData] = useState<TemperatureDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityName) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const dateObj = new Date(localDate);
      const queryDate = dateObj.toISOString().split("T")[0]; // yyyy-mm-dd

      // const params = new URLSearchParams({
      //   key: process.env.NEXT_PUBLIC_WEATHER_API_API_KEY!,
      //   q: cityName,
      //   dt: queryDate,
      // });

      // var date = new Date(localDate);
      // var day = date.getDate();
      // var month = date.getMonth() + 1;
      // var year = date.getFullYear();

      // const queryDate = year + "-" + month + "-" + day;

      const url: string =
        `${process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL}` +
        `${process.env.NEXT_PUBLIC_WEATHER_API_GET_DETAIL_PATH}` +
        `${process.env.NEXT_PUBLIC_WEATHER_API_API_KEY}` +
        `&q=${encodeURIComponent(cityName)}` +
        "&dt=" +
        queryDate;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch weather details");

        const result: WeatherDetailResponse = await res.json();
        setData(result);

        console.log(url);

        const hourly = result.forecast.forecastday[0].hour.map((h) => ({
          hour: h.time,
          temp: h.temp_c,
        }));

        setChartData(hourly);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName, localDate]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Details</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">Error: {error}</div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle>{data.location.name}</DialogTitle>
              <DialogDescription>{data.location.country}</DialogDescription>
            </DialogHeader>

            <Card>
              <CardContent className="space-y-4 pt-6">
                {/* Temperature Info */}
                <div className="grid sm:grid-cols-2 gap-4 text-center">
                  <div>
                    <Label>Max Temp</Label>
                    <div>{data.forecast.forecastday[0].day.maxtemp_c}°C</div>
                  </div>
                  <div>
                    <Label>Min Temp</Label>
                    <div>{data.forecast.forecastday[0].day.mintemp_c}°C</div>
                  </div>
                  <div className="col-span-2">
                    <img
                      src={data.forecast.forecastday[0].day.condition.icon}
                      alt={data.forecast.forecastday[0].day.condition.text}
                      title={data.forecast.forecastday[0].day.condition.text}
                      className="mx-auto"
                    />
                  </div>
                </div>

                {/* Astro Info */}
                <div className="grid sm:grid-cols-2 gap-4 text-center">
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

                {/* Line Chart */}
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

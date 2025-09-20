"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {ReactElement} from "react";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis,} from "recharts";
import {CustomDotProps, LineChartComponentProps,} from "../types/weather-types";

const CustomDot = ({
                     cx = 0,
                     cy = 0,
                     payload,
                   }: CustomDotProps): ReactElement | null => {
  const icon = payload?.icon;
  
  if (!icon) {
    return null;
  }
  
  return (
    <image
      href={icon}
      x={cx - 12}
      y={cy - 12}
      width={24}
      height={24}
      style={{pointerEvents: "none"}}
    />
  );
};

export default function LineChartComponent({
                                             date,
                                             chartData,
                                           }: LineChartComponentProps) {
  if (!chartData?.length) {
    return (
      <div className="text-center text-gray-500 text-sm sm:text-base">
        No data available.
      </div>
    );
  }
  
  const formatHour = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const processedData = chartData.map((item) => ({
    hour: formatHour(item.hour),
    temp: item.temp,
    icon: item.icon,
  }));
  
  return (
    <div className="max-w-[95vw] max-h-[70vh]">
      <div>
        <Card className="shadow-md">
          <CardHeader className="px-4 sm:px-6 md:px-8">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              Today&acute;s Temperature
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {date}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-2 sm:px-4 md:px-6">
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart
                  data={processedData}
                  margin={{top: 10, right: 5, left: 5, bottom: 20}}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  
                  <XAxis
                    dataKey="hour"
                    tickMargin={20}
                    className="text-xs sm:text-sm"
                  />
                  
                  <Tooltip
                    content={({active, payload, label}) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded shadow text-sm text-gray-800">
                            <p className="font-medium">{label}</p>
                            <p>{payload[0].value}°C</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={<CustomDot/>}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

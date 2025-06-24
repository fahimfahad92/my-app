"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { LineChartComponentProps } from "../types/weather-types";

export const chartConfig = {
  temp: {
    label: "Temperature (°C)",
    color: "#2563eb",
  },
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
      hour12: false,
    });
  };

  const processedData = chartData.map((item) => ({
    hour: formatHour(item.hour),
    temp: item.temp,
  }));

  return (
    <div className="max-w-[95vw] max-h-[70vh]">
      <div>
        <Card className="shadow-md">
          <CardHeader className="px-4 sm:px-6 md:px-8">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              Today's Temperature
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {date}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-2 sm:px-4 md:px-6">
            <div>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer>
                  <LineChart
                    data={processedData}
                    margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tickLine
                      axisLine
                      tickMargin={10}
                      className="text-xs sm:text-sm"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="var(--color-temp, #2563eb)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-temp, #2563eb)", r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

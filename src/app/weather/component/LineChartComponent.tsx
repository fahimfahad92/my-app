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
  const hasData = chartData && chartData.length > 0;

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
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Today's Temperature</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={processedData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="var(--color-temp)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-temp)", r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center text-gray-500">No data available.</div>
        )}
      </CardContent>
    </Card>
  );
}

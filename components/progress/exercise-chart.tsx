"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import type { ProgressDataPoint } from "@/lib/api/progress";
import type { Timeframe } from "./timeframe-selector";

interface ExerciseChartProps {
  exerciseName: string;
  dataPoints: ProgressDataPoint[];
  timeframe: Timeframe;
}

function getTimeframeDate(timeframe: Timeframe): Date | null {
  const now = new Date();
  switch (timeframe) {
    case "7d":
      return new Date(now.setDate(now.getDate() - 7));
    case "1m":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3m":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "6m":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "all":
      return null;
  }
}

const MAX_DATA_POINTS = 6;

function sampleDataPoints<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;

  // Always include first and last points
  const result: T[] = [data[0]];
  const step = (data.length - 1) / (maxPoints - 1);

  for (let i = 1; i < maxPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  result.push(data[data.length - 1]);
  return result;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ExerciseChart({
  exerciseName,
  dataPoints,
  timeframe,
}: ExerciseChartProps) {
  const filteredData = useMemo(() => {
    const minDate = getTimeframeDate(timeframe);
    if (!minDate) return dataPoints;

    return dataPoints.filter((dp) => new Date(dp.date) >= minDate);
  }, [dataPoints, timeframe]);

  const chartData = useMemo(() => {
    const sampledData = sampleDataPoints(filteredData, MAX_DATA_POINTS);
    return sampledData.map((dp) => ({
      ...dp,
      dateLabel: formatDate(dp.date),
    }));
  }, [filteredData]);

  // Calculate Y-axis domains with ±20% padding
  const { weightDomain, dynascoreDomain } = useMemo(() => {
    if (chartData.length === 0) {
      return { weightDomain: [0, 100] as [number, number], dynascoreDomain: [0, 100] as [number, number] };
    }

    const weights = chartData.map((d) => d.maxWeight);
    const dynascores = chartData.map((d) => d.dynascore);

    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || maxWeight * 0.2;
    const weightPadding = weightRange * 0.2;

    const minDynascore = Math.min(...dynascores);
    const maxDynascore = Math.max(...dynascores);
    const dynascoreRange = maxDynascore - minDynascore || maxDynascore * 0.2;
    const dynascorePadding = dynascoreRange * 0.2;

    return {
      weightDomain: [
        Math.max(0, Math.floor(minWeight - weightPadding)),
        Math.ceil(maxWeight + weightPadding),
      ] as [number, number],
      dynascoreDomain: [
        Math.max(0, Math.floor(minDynascore - dynascorePadding)),
        Math.ceil(maxDynascore + dynascorePadding),
      ] as [number, number],
    };
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{exerciseName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No data for this timeframe
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{exerciseName}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 0, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="weight"
                orientation="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickCount={4}
                domain={weightDomain}
                tickFormatter={(value) => `${value}kg`}
              />
              <YAxis
                yAxisId="dynascore"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickCount={4}
                domain={dynascoreDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value, name) => {
                  if (typeof value !== "number") return [value, name];
                  if (name === "Max Weight") return [`${value} kg`, name];
                  if (name === "Dynascore") return [value.toFixed(2), name];
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="line"
              />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="maxWeight"
                name="Max Weight"
                stroke="#f5e916"
                strokeWidth={2}
                dot={{ fill: "#f5e916", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#f5e916" }}
              />
              <Line
                yAxisId="dynascore"
                type="monotone"
                dataKey="dynascore"
                name="Dynascore"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats summary - uses all filtered data, not just sampled */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 px-6">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Best Weight</p>
            <p className="text-lg font-bold text-foreground">
              {Math.max(...filteredData.map((d) => d.maxWeight))} kg
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Best Dynascore</p>
            <p className="text-lg font-bold text-foreground">
              {Math.max(...filteredData.map((d) => d.dynascore)).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

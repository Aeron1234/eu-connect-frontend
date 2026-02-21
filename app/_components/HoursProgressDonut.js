"use client";

import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { useEffect, useState } from "react";

export const description = "A donut chart with text";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isDesktop;
}

const chartData = [
  { browser: "chrome", visitors: 20, fill: "var(--color-primary-200)" },
  { browser: "safari", visitors: 200, fill: "var(--color-primary-500)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
};

export default function HoursProgressDonut() {
  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc - curr.visitors, 400);
  }, []);

  if (!useIsDesktop()) return null;

  return (
    <div className="w-full h-75">
      <Card className="flex flex-col text-stone-800 rounded-md">
        <CardHeader className="items-center">
          <CardTitle className="font-bold">Hours Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-62.5 h-full w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Hours
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-stone-500 text-xs font-semibold">
            January - June 2024
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

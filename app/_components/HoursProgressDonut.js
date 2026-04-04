"use client";

import React, { useMemo } from "react";
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

// Your database record

export default function HoursProgressDonut({ internshipData }) {
  const chartData = useMemo(() => {
    const total = Number(internshipData?.total_hours) || 0;
    const accumulated = Number(internshipData?.accumulated_hours) || 0;

    // 2. Calculate remaining as a number
    const remaining = total - accumulated;
    return [
      {
        status: "completed",
        hours: internshipData?.accumulated_hours,
        fill: "var(--color-primary-500)",
      },
      {
        status: "remaining",
        hours: remaining > 0 ? remaining : 0,
        fill: "var(--color-primary-100)",
      },
    ];
  }, [internshipData]);

  const chartConfig = {
    hours: {
      label: "Hours",
    },
    completed: {
      label: "Completed",
    },
    remaining: {
      label: "Remaining",
    },
  };

  const percentage = (
    (Number(internshipData?.accumulated_hours || 0) /
      Number(internshipData?.total_hours || 1)) *
    100
  ).toFixed(1);

  return (
    <div className="w-full h-full shadow-sm rounded-sm max-lg:w-fit max-lg:h-fit max-sm:w-full max-sm:h-full">
      <Card className="flex flex-col h-full max-sm:w-full text-stone-800 rounded-md border-none shadow-none ">
        <CardHeader className="items-center">
          {/* <CardTitle className="font-bold text-base">Hours Progress</CardTitle> */}
          <CardTitle className="font-bold text-base max-xs:text-sm">
            Hours Progress
          </CardTitle>
          <p className="text-sm text-stone-500 font-medium max-xs:text-sm">
            {internshipData.company_name}
          </p>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-45 w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="hours"
                nameKey="status"
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
                            {internshipData.accumulated_hours.toFixed(2)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-xs font-medium"
                          >
                            out of {internshipData.total_hours} hrs
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
        <CardFooter className="flex-col gap-1 text-center">
          <div className="text-sm font-bold text-stone-700 max-xs:text-xs">
            {percentage}% Progress
          </div>
          <p className="text-stone-400 text-[10px] uppercase tracking-wider font-bold max-xs:text-xs">
            Status: {internshipData.status}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

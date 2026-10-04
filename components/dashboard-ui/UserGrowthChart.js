"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import chartPalette from "./chartPalette";

const chartConfig = {
  students: { label: "Students", color: chartPalette[0] },
  employers: { label: "Employers", color: chartPalette[1] },
  deptHeads: {
    label: "Department Heads",
    color: chartPalette[2],
  },
};

function UserGrowthChart({ data = [] }) {
  return (
    <div className="min-w-0 rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="w-4 h-4 text-primary-emphasis" />
          User Growth Over Time
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          New signups per month, split by role
        </p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="h-72 min-w-0 w-full bg-muted rounded-lg p-3"
      >
        <LineChart
          data={data}
          margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend
            content={
              <ChartLegendContent className="flex-wrap items-center justify-center gap-x-3 gap-y-2 [&>div]:shrink-0 [&>div]:whitespace-nowrap" />
            }
          />
          <Line
            type="monotone"
            dataKey="students"
            stroke="var(--color-students)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="employers"
            stroke="var(--color-employers)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="deptHeads"
            stroke="var(--color-deptHeads)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default UserGrowthChart;

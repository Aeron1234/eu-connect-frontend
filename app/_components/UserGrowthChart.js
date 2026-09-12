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

const chartConfig = {
  students: { label: "Students", color: "var(--color-primary-500)" },
  employers: { label: "Employers", color: "var(--color-amber-500)" },
  deptHeads: { label: "Department Heads", color: "var(--color-blue-500)" },
};

function UserGrowthChart({ data = [] }) {
  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          User Growth Over Time
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          New signups per month, split by role
        </p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="h-72 w-full bg-stone-100 rounded-lg p-3"
      >
        <LineChart
          data={data}
          margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#d6d3d1"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#78716c" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#78716c" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
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

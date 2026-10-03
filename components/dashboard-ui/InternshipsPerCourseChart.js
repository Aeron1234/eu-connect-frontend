// app/_components/InternshipsPerCourseChart.js
"use client";

import { Briefcase } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  interns: {
    label: "Interns",
    color: "var(--chart-maroon)",
  },
};

// When there are only a few courses, the single/few bars end up centered
// and floating awkwardly in the middle of the full-width chart. Padding
// the dataset with blank placeholder slots pushes the real bars toward
// the left instead, while the grid/axis still spans the full card.
const MIN_SLOTS = 5;

function buildChartData(data) {
  if (data.length >= MIN_SLOTS) return data;
  const placeholders = Array.from(
    { length: MIN_SLOTS - data.length },
    (_, i) => ({
      course: `__placeholder_${i}`,
      interns: null,
      isPlaceholder: true,
    }),
  );
  return [...data, ...placeholders];
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0]?.payload?.isPlaceholder) {
    return null;
  }
  return (
    <ChartTooltipContent active={active} payload={payload} label={label} />
  );
}

function InternshipsPerCourseChart({ data = [] }) {
  const chartData = buildChartData(data);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Briefcase className="w-4 h-4 text-primary-emphasis" />
          Ongoing Internships per Course
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Active interns grouped by course in your department
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No ongoing internships yet.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full bg-muted rounded-lg p-3"
        >
          <BarChart
            data={chartData}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="course"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(value) =>
                value.startsWith("__placeholder_") ? "" : value
              }
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar
              dataKey="interns"
              fill="var(--color-interns)"
              radius={[6, 6, 0, 0]}
              maxBarSize={80}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default InternshipsPerCourseChart;

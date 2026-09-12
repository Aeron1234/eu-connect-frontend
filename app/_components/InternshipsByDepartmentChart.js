"use client";

import { Briefcase } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  interns: { label: "Interns", color: "var(--color-primary-500)" },
};

const MIN_SLOTS = 5;

function buildChartData(data) {
  if (data.length >= MIN_SLOTS) return data;
  const placeholders = Array.from(
    { length: MIN_SLOTS - data.length },
    (_, i) => ({
      department: `__placeholder_${i}`,
      interns: null,
      isPlaceholder: true,
    }),
  );
  return [...data, ...placeholders];
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0]?.payload?.isPlaceholder)
    return null;
  return (
    <ChartTooltipContent active={active} payload={payload} label={label} />
  );
}

function InternshipsByDepartmentChart({ data = [] }) {
  const chartData = buildChartData(data);

  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <Briefcase className="w-4 h-4 text-primary-500" />
          Internships by Department
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ongoing internships across all departments
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-64 w-full bg-stone-100 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No ongoing internships yet.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full bg-stone-100 rounded-lg p-3"
        >
          <BarChart
            data={chartData}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#d6d3d1"
            />
            <XAxis
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickFormatter={(value) =>
                value.startsWith("__placeholder_") ? "" : value
              }
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar
              dataKey="interns"
              fill="var(--color-interns)"
              radius={[6, 6, 0, 0]}
              maxBarSize={64}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default InternshipsByDepartmentChart;

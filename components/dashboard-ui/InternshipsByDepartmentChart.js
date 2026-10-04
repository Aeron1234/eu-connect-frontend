"use client";

import { Briefcase } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useChartLabelVisibility from "./useChartLabelVisibility";

const chartConfig = {
  interns: { label: "Interns", color: "var(--chart-maroon)" },
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
  const labelWidth = chartData.reduce(
    (width, { department, isPlaceholder }) =>
      width +
      (isPlaceholder ? 64 : Math.max(64, department.length * 6 + 16)),
    40,
  );
  const [chartRef, showDepartmentLabels] = useChartLabelVisibility(
    labelWidth,
    data.length > 0,
  );

  return (
    <div className="min-w-0 rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Briefcase className="w-4 h-4 text-primary-emphasis" />
          Internships by Department
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ongoing internships across all departments
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
          ref={chartRef}
          config={chartConfig}
          className="h-64 min-w-0 w-full bg-muted rounded-lg p-3"
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
              dataKey="department"
              tickLine={false}
              axisLine={false}
              tick={
                showDepartmentLabels
                  ? { fontSize: 11, fill: "var(--muted-foreground)" }
                  : false
              }
              height={showDepartmentLabels ? 30 : 8}
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
              maxBarSize={64}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default InternshipsByDepartmentChart;

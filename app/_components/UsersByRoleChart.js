"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const roleLabels = {
  student: "Students",
  employer: "Employers",
  department_head: "Department Heads",
  admin: "Admins",
};

const roleColors = {
  student: "var(--color-primary-500)",
  employer: "var(--color-amber-500)",
  department_head: "var(--color-blue-500)",
  admin: "var(--color-emerald-500)",
};

const chartConfig = {
  student: { label: "Students", color: "var(--color-primary-500)" },
  employer: { label: "Employers", color: "var(--color-amber-500)" },
  department_head: {
    label: "Department Heads",
    color: "var(--color-blue-500)",
  },
  admin: { label: "Admins", color: "var(--color-emerald-500)" },
};

function UsersByRoleChart({ data = [] }) {
  const chartData = data.map((row) => ({
    role: row.role,
    label: roleLabels[row.role] || row.role,
    value: row.count,
    fill: roleColors[row.role] || "var(--color-stone-400)",
  }));

  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <PieChartIcon className="w-4 h-4 text-primary-500" />
          Users by Role
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Role distribution across the whole system
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 w-full bg-stone-100 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No user data yet.</p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full bg-stone-100 rounded-lg p-3 flex items-center justify-center"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
              stroke="#f5f5f4"
            >
              {chartData.map((entry) => (
                <Cell key={entry.role} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="label" />} />
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default UsersByRoleChart;

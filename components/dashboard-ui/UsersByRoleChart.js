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
import chartPalette from "./chartPalette";

const roleLabels = {
  student: "Students",
  employer: "Employers",
  department_head: "Department Heads",
  admin: "Admins",
};

const roleColors = {
  student: chartPalette[0],
  employer: chartPalette[1],
  department_head: chartPalette[2],
  admin: chartPalette[3],
};

const chartConfig = {
  student: { label: "Students", color: roleColors.student },
  employer: { label: "Employers", color: roleColors.employer },
  department_head: {
    label: "Department Heads",
    color: roleColors.department_head,
  },
  admin: { label: "Admins", color: roleColors.admin },
};

function UsersByRoleChart({ data = [] }) {
  const chartData = data.map((row) => ({
    role: row.role,
    label: roleLabels[row.role] || row.role,
    value: row.count,
    fill: roleColors[row.role] || "var(--color-stone-400)",
  }));

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PieChartIcon className="w-4 h-4 text-primary-emphasis" />
          Users by Role
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Role distribution across the whole system
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No user data yet.</p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full bg-muted rounded-lg p-3 flex items-center justify-center"
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
              stroke="var(--card)"
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

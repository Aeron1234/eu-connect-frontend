"use client";

import { useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { isStudentAtRisk } from "@/lib/internshipRisk";

// Fixed palette, assigned to courses in sorted order so the same course
// always gets the same color across renders/filters.
const palette = [
  "var(--chart-maroon)",
  "var(--color-blue-500)",
  "var(--color-amber-500)",
  "var(--color-emerald-500)",
  "var(--color-purple-500)",
  "var(--color-rose-500)",
  "var(--color-cyan-500)",
];

function buildCourseColorMap(courses) {
  const sorted = [...courses].sort();
  const map = new Map();
  sorted.forEach((course, i) => {
    map.set(course, palette[i % palette.length]);
  });
  return map;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-foreground">{entry.course}</p>
      <p className="text-foreground-soft mt-0.5">
        Avg. completion: {entry.avgCompletion}%
      </p>
      <p className="text-foreground-soft mt-0.5">
        {entry.studentCount} student{entry.studentCount === 1 ? "" : "s"}
      </p>
      {entry.atRiskCount > 0 && (
        <p className="text-red-600 font-medium mt-0.5">
          {entry.atRiskCount} at risk
        </p>
      )}
    </div>
  );
}

function HoursDistributionDonut({ students = [] }) {
  const { chartData, chartConfig } = useMemo(() => {
    const courses = Array.from(new Set(students.map((s) => s.course)));
    const colorMap = buildCourseColorMap(courses);

    const grouped = new Map();
    courses.forEach((course) => {
      grouped.set(course, {
        course,
        students: [],
        fill: colorMap.get(course),
      });
    });

    students.forEach((s) => {
      grouped.get(s.course).students.push(s);
    });

    const data = Array.from(grouped.values()).map((group) => {
      const studentCount = group.students.length;
      const avgCompletion =
        studentCount > 0
          ? Math.round(
              group.students.reduce(
                (sum, s) => sum + (s.accumulated_hours / s.total_hours) * 100,
                0,
              ) / studentCount,
            )
          : 0;
      const atRiskCount = group.students.filter((s) =>
        isStudentAtRisk(s),
      ).length;

      return {
        course: group.course,
        avgCompletion,
        studentCount,
        atRiskCount,
        fill: group.fill,
      };
    });

    const config = {};
    data.forEach((d) => {
      config[d.course] = { label: d.course, color: d.fill };
    });

    return { chartData: data, chartConfig: config };
  }, [students]);

  const totalAtRisk = chartData.reduce((sum, d) => sum + d.atRiskCount, 0);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PieChartIcon className="w-4 h-4 text-primary-emphasis" />
          Hours Completion Distribution
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Average completion per course
          {totalAtRisk > 0 && (
            <span className="text-red-600 font-medium">
              {" "}
              · {totalAtRisk} at risk
            </span>
          )}
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No active interns yet.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="flex-1 min-h-[220px] w-full bg-muted rounded-lg p-3"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey="avgCompletion"
              nameKey="course"
              innerRadius={55}
              outerRadius={85}
              strokeWidth={2}
              stroke="var(--card)"
            >
              {chartData.map((entry) => (
                <Cell key={entry.course} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="course" />} />
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default HoursDistributionDonut;

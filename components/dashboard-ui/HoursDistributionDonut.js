"use client";

import { useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import useChartLabelVisibility from "./useChartLabelVisibility";
import useWideChartViewport from "./useWideChartViewport";
import chartPalette from "./chartPalette";

// Assign colors by sorted course names so reordering the same set is stable.
// Adding/removing courses can shift palette positions; colors are not permanent IDs.
function buildCourseColorMap(courses) {
  const sorted = [...courses].sort();
  const map = new Map();
  sorted.forEach((course, i) => {
    map.set(course, chartPalette[i % chartPalette.length]);
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

function HoursDistributionDonut({ summary = [] }) {
  const useHoverTooltip = useWideChartViewport();
  const { chartData, chartConfig } = useMemo(() => {
    // Use the whole supplied summary, not the tracker page/course filter, for colors.
    // Segment values below are course average-completion percentages, not student counts.
    const courses = summary.map((row) => row.course);
    const colorMap = buildCourseColorMap(courses);
    const data = summary.map((row) => ({
      ...row,
      fill: colorMap.get(row.course),
    }));

    const config = {};
    data.forEach((d) => {
      config[d.course] = { label: d.course, color: d.fill };
    });

    return { chartData: data, chartConfig: config };
  }, [summary]);
  const [chartRef, showCourseLabels] = useChartLabelVisibility(
    480,
    chartData.length > 0,
  );

  const totalAtRisk = chartData.reduce((sum, d) => sum + d.atRiskCount, 0);

  return (
    <div className="min-w-0 rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6 h-full flex flex-col">
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
        <div ref={chartRef} className="flex min-w-0 flex-1 flex-col justify-center rounded-lg bg-muted p-3">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-52 min-w-0 w-full"
          >
            <PieChart>
              <ChartTooltip
                trigger={useHoverTooltip ? "hover" : "click"}
                content={<CustomTooltip />}
              />
              <Pie
                data={chartData}
                dataKey="avgCompletion"
                nameKey="course"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={2}
                stroke="var(--card)"
                className="cursor-pointer"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.course} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {showCourseLabels && (
            <div
              className="mt-3 flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2"
              aria-label="Course colors"
            >
              {chartData.map((entry) => (
                <div
                  key={entry.course}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] leading-tight text-muted-foreground"
                >
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: entry.fill }}
                    aria-hidden="true"
                  />
                  <span>{entry.course}</span>
                </div>
              ))}
            </div>
          )}
          {!showCourseLabels && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {useHoverTooltip ? "Hover" : "Tap"} a segment to see its course details.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default HoursDistributionDonut;

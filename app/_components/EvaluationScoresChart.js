// app/_components/EvaluationScoresChart.js
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  score: {
    label: "Avg Score",
    color: "var(--chart-maroon)",
  },
};

function IndexAxisTick({ x, y, index }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontSize={11} fill="var(--muted-foreground)" dy={14}>
        {index + 1}
      </text>
    </g>
  );
}

function EvaluationScoresChart({ title, description, icon: Icon, data = [] }) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {Icon && Icon}
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>

      {data.length === 0 ? (
        <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No evaluations yet.</p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-72 w-full bg-muted rounded-lg p-3"
        >
          <BarChart
            data={data}
            margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={24}
              tick={<IndexAxisTick />}
            />
            <YAxis
              domain={[0, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="score"
              fill="var(--color-score)"
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default EvaluationScoresChart;

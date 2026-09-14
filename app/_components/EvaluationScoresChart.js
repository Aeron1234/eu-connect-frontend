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
    color: "var(--color-primary-500)",
  },
};

// Wraps a category label across up to 2 lines by word, so long category
// names (e.g. "Training and Learning Opportunities") don't collide with
// their neighbors when every tick is forced to render (interval={0}).
function wrapLabel(text, maxCharsPerLine = 14) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

function WrappedAxisTick({ x, y, payload }) {
  const lines = wrapLabel(payload.value);
  const lineHeight = 12;

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontSize={11} fill="#78716c">
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 12 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function EvaluationScoresChart({ title, description, icon: Icon, data = [] }) {
  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          {Icon && Icon}
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>

      {data.length === 0 ? (
        <div className="h-64 w-full bg-stone-100 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No evaluations yet.</p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-72 w-full bg-stone-100 rounded-lg p-3"
        >
          <BarChart
            data={data}
            margin={{ left: 0, right: 12, top: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#d6d3d1"
            />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={50}
              tick={<WrappedAxisTick />}
            />
            <YAxis
              domain={[0, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
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

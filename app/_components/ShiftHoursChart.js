// app/_components/ShiftHoursChart.js
"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAverageShiftHours } from "@/lib/server-actions/dashboard-actions";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthKey(month, year) {
  return `${year}-${month}`;
}

function monthLabel(month, year) {
  return `${monthNames[month - 1]} ${year}`;
}

const chartConfig = {
  hours: {
    label: "Avg Hours",
    color: "var(--color-primary-500)",
  },
};

function ShiftHoursChart({
  initialMonths = [],
  initialSelectedMonth = null,
  initialWeeks = [],
}) {
  const [months] = useState(initialMonths);
  const [selectedKey, setSelectedKey] = useState(
    initialSelectedMonth
      ? monthKey(initialSelectedMonth.month, initialSelectedMonth.year)
      : null,
  );
  const [weeks, setWeeks] = useState(initialWeeks);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [error, setError] = useState(null);

  async function handleMonthChange(key) {
    setSelectedKey(key);
    const [year, month] = key.split("-").map(Number);

    setIsLoadingWeeks(true);
    const res = await getAverageShiftHours({ month, year });

    if (res?.error) {
      setError(res.error);
      setWeeks([]);
      setIsLoadingWeeks(false);
      return;
    }

    setError(null);
    setWeeks(res?.weeks || []);
    setIsLoadingWeeks(false);
  }

  const selected = months.find(
    (m) => monthKey(m.month, m.year) === selectedKey,
  );

  return (
    <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <Clock className="w-4 h-4 text-primary-500" />
            Average Shift Hours per Week
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Mean daily time record hours of department students
          </p>
        </div>

        {months.length > 0 && (
          <Select value={selectedKey} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-8 w-[150px] text-xs px-2">
              <SelectValue>
                {selected ? monthLabel(selected.month, selected.year) : ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => {
                const key = monthKey(m.month, m.year);
                return (
                  <SelectItem key={key} value={key} className="text-xs">
                    {monthLabel(m.month, m.year)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      {error ? (
        <div className="h-64 w-full bg-stone-100 rounded-lg flex items-center justify-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : isLoadingWeeks ? (
        <div className="h-64 w-full bg-stone-100 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : weeks.length === 0 ? (
        <div className="h-64 w-full bg-stone-100 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No time records for this month.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full bg-stone-100 rounded-lg p-3"
        >
          <LineChart
            data={weeks}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#d6d3d1"
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="var(--color-hours)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "#fff",
                stroke: "var(--color-hours)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default ShiftHoursChart;

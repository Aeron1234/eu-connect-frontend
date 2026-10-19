"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { useUser } from "@/contexts/UserContext";
import { shiftHoursMonthOptions } from "@/lib/cache/shift-hours-queries";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";

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
    color: "var(--chart-maroon)",
  },
};

function ShiftHoursChart({
  initialMonths = [],
  initialSelectedMonth = null,
}) {
  const { user } = useUser();
  const months = initialMonths;
  const [selectedKey, setSelectedKey] = useState(
    initialSelectedMonth || months[0]
      ? monthKey((initialSelectedMonth || months[0]).month, (initialSelectedMonth || months[0]).year)
      : null,
  );
  const [year, month] = selectedKey?.split("-").map(Number) || [];
  const monthQuery = useQuery({
    ...shiftHoursMonthOptions(user?.id, month, year),
    enabled: Boolean(user?.id && selectedKey),
  });
  const weeks = monthQuery.data?.weeks || [];

  const selected = months.find(
    (m) => monthKey(m.month, m.year) === selectedKey,
  );

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="w-4 h-4 text-primary-emphasis" />
            Average Shift Hours per Week
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Mean daily time record hours of department students
          </p>
        </div>

        {months.length > 0 && (
          <Select value={selectedKey} onValueChange={setSelectedKey}>
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

      {monthQuery.isError && (
        <ErrorUI error={monthQuery.error} reset={() => void monthQuery.refetch()} compact logError={false} />
      )}
      {monthQuery.isError && !monthQuery.data ? null : selectedKey && monthQuery.isPending ? (
        <Skeleton className="h-64 w-full rounded-lg" role="status" aria-label="Loading shift hours" />
      ) : weeks.length === 0 ? (
        <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No time records for this month.
          </p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full bg-muted rounded-lg p-3"
        >
          <LineChart
            data={weeks}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
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

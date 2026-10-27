"use client";

import { Calendar } from "@/components/ui/calendar";
import { parseDay, dayKey } from "./calendarDateUtils";

export default function CalendarOverview({ selected, month, setMonth, setSelected, pickDay, marked, data, activeKinds }) {
  return (
    <aside
      className="hidden space-y-4 xl:block"
      aria-label="Calendar overview"
    >
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <Calendar
          mode="single"
          selected={parseDay(selected)}
          month={parseDay(`${month}-01`)}
          onMonthChange={date => {
            const next = dayKey(date).slice(0, 7);
            setMonth(next);
            setSelected(`${next}-01`);
          }}
          onSelect={date => {
            if (date) pickDay(dayKey(date));
          }}
          modifiers={{ marked }}
          modifiersClassNames={{ marked: "border-b-2 border-primary" }}
          className="w-full bg-transparent p-1 [--cell-size:2rem]"
          classNames={{ root: "w-full", weekday: "text-foreground-subtle flex-1 text-[11px]", day: "relative w-full aspect-square text-center" }}
        />
      </div>
      {data.internship && <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            Ongoing internship
          </p>
          <h3 className="mt-1 font-bold text-foreground">
            {data.internship.company_name}
          </h3>
          <p className="mt-2 text-xs text-foreground-soft">
            {data.internship.date_started}
            {" – "}
            {data.internship.date_ended}
          </p>
        </div>}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="font-bold text-foreground">
          Your calendars
        </h3>
        <div className="mt-3 space-y-2">
          {activeKinds.map((kind) => <div
              key={kind.id}
              className="flex items-center gap-2 text-sm text-foreground-soft"
            >
              <span className={`size-2 rounded-full ${kind.dot}`} />
              {kind.label}
            </div>)}
        </div>
      </div>
    </aside>
  );
}

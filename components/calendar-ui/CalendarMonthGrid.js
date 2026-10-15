"use client";

import { weekdays } from "./calendarKinds";
import CalendarDayCell from "./CalendarDayCell";

export default function CalendarMonthGrid({ dates, month, data, selected, visibleKinds, pickDay }) {
  return (
    <>
      <div
        className="grid grid-cols-7 border-b border-border bg-muted/35 text-center text-[10px] font-semibold uppercase tracking-wide text-foreground-subtle sm:text-xs"
      >
        {weekdays.map((day) => <div
            key={day}
            className="py-2"
          >
            {day}
          </div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border">
        {dates.map((day) => <CalendarDayCell
            key={day}
            day={day}
            month={month}
            data={data}
            selected={selected}
            visibleKinds={visibleKinds}
            pickDay={pickDay}
          />)}
      </div>
    </>
  );
}

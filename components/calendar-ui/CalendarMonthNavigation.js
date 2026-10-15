"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseDay, manilaTodayKey } from "./calendarDateUtils";

export default function CalendarMonthNavigation({ month, moveMonth, pickDay }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 border-b border-border p-3 sm:flex-row sm:justify-between sm:p-5"
    >
      <div className="text-center sm:text-left">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          {format(parseDay(`${month}-01`), "MMMM yyyy")}
        </h2>
        <p className="text-xs text-foreground-subtle">
          Select a day to see its details
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          aria-label="Previous month"
          className="grid size-9 place-items-center rounded-lg border border-border text-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => pickDay(manilaTodayKey())}
          className="h-9 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="Next month"
          className="grid size-9 place-items-center rounded-lg border border-border text-foreground hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

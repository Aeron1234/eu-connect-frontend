"use client";

import { format } from "date-fns";
import { kinds } from "./calendarKinds";
import { entriesFor } from "./calendarEntries";
import { parseDay, manilaTodayKey } from "./calendarDateUtils";

function rangeCorners(position) {
  if (position === "start") return "rounded-l-md rounded-r-none";
  if (position === "end") return "rounded-l-none rounded-r-md";
  if (position === "middle") return "rounded-none";
  return "rounded";
}

function rangeIndicator(position) {
  if (position === "start") return "→";
  if (position === "end") return "←";
  if (position === "middle") return "↔";
  return "";
}

export default function CalendarDayCell({ day, month, data, selected, visibleKinds, pickDay }) {
  const inMonth = day.slice(0, 7) === month;
  const items = entriesFor(data, day).filter((entry) => visibleKinds.has(entry.kind));
  const isSelected = selected === day;
  return (
    <button
      key={day}
      type="button"
      onClick={() => pickDay(day, items.length > 0)}
      aria-label={`${format(parseDay(day), "EEEE, MMMM d, yyyy")}, ${items.length} items`}
      aria-pressed={isSelected}
      className={`min-w-0 min-h-12 p-1 text-left align-top transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary sm:min-h-20 sm:p-2 md:min-h-28 ${inMonth ? "bg-card" : "bg-muted/35 text-foreground-faint"} ${isSelected ? "ring-2 ring-inset ring-primary" : "hover:bg-muted/50"}`}
    >
      <span
        className={`mb-0.5 inline-grid size-5 place-items-center rounded-full text-[11px] font-semibold sm:mb-1 sm:size-6 sm:text-xs ${day === manilaTodayKey() ? "bg-primary text-white" : ""}`}
      >
        {parseDay(day).getDate()}
      </span>
      <span className="flex flex-wrap gap-0.5 md:hidden">
        {items.slice(0, 4).map((entry) => <span
            key={entry.key}
            title={entry.rangeLabel ? `${entry.title}: ${entry.rangeLabel}` : entry.title}
            data-range-position={entry.rangePosition}
            className={`${entry.rangePosition && entry.rangePosition !== "single" ? `h-1.5 w-3 ${rangeCorners(entry.rangePosition)}` : "size-1.5 rounded-full"} ${kinds.find((kind) => kind.id === entry.kind)?.dot}`}
          />)}
      </span>
      <span className="hidden space-y-1 md:block">
        {items.slice(0, 2).map((entry) => <span
            key={entry.key}
            title={entry.rangeLabel ? `${entry.title}: ${entry.rangeLabel}` : entry.title}
            data-range-position={entry.rangePosition}
            className={`block truncate border px-1.5 py-0.5 text-[10px] font-medium ${rangeCorners(entry.rangePosition)} ${kinds.find((kind) => kind.id === entry.kind)?.chip}`}
          >
            {entry.rangePosition && entry.rangePosition !== "single" && (
              <span className="mr-1" aria-hidden="true">{rangeIndicator(entry.rangePosition)}</span>
            )}
            {entry.title}
          </span>)}
        {items.length > 2 && <span className="block text-[10px] font-medium text-foreground-subtle">
            +
            {items.length - 2}
            {" more"}
          </span>}
      </span>
    </button>
  );
}

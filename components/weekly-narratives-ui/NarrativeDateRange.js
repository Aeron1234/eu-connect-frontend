import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { formatNarrativeRange } from "@/lib/weekly-narrative-dates.mjs";

export default function NarrativeDateRange({ narrative }) {
  const range = formatNarrativeRange(narrative.date_from, narrative.date_to);
  // Display coverage separately from submission. An older entry without a valid
  // saved range still shows its week and any valid submission date.
  const submitted = narrative.created_at ? new Date(narrative.created_at) : null;
  return <div className="mt-2 space-y-1.5">
    <p className="flex items-start gap-1.5 text-xs font-medium leading-relaxed text-foreground-soft">
      <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-primary-emphasis" aria-hidden="true" />
      <span className="min-w-0 break-words"><span className="sr-only">Date range: </span>{range || "Date range not set"}</span>
    </p>
    <p className="text-[11px] leading-relaxed text-muted-foreground">
      Week {narrative.week_number}
      {submitted && !Number.isNaN(submitted.getTime()) && <> &middot; Submitted {format(submitted, "MMM d, yyyy")}</>}
    </p>
  </div>;
}

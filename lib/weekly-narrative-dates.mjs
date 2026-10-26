const displayDate = new Intl.DateTimeFormat("en-US", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
});

// Accept only a real YYYY-MM-DD calendar day. Pin parsing/display to UTC so the
// saved coverage date does not shift with the viewer's local timezone.
export function narrativeCalendarDay(value) {
  if (typeof value !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}

// Missing, partial or reversed legacy ranges stay unset; never infer coverage
// from a narrative's submission timestamp.
export function formatNarrativeRange(from, to) {
  const start = narrativeCalendarDay(from);
  const end = narrativeCalendarDay(to);
  if (!start || !end || end < start) return null;
  return `${displayDate.format(new Date(start + "T00:00:00Z"))} to ${displayDate.format(new Date(end + "T00:00:00Z"))}`;
}

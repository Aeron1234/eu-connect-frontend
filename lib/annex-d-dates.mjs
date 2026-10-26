const displayDate = new Intl.DateTimeFormat("en-PH", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
});

// Treat saved timestamps/date strings as calendar dates using their first ten
// characters. UTC validation/display avoids a local timezone shifting the day.
function formatDay(value) {
  const day = typeof value === "string" ? value.slice(0, 10) : "";
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(day)) return "—";
  const date = new Date(day + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day) return "—";
  return displayDate.format(date);
}

// Use complete Month day, year endpoints; a missing end displays Present.
// Invalid supplied dates keep the unavailable marker instead of being guessed.
export function formatAnnexDDuration(start, end) {
  return `${formatDay(start)} - ${end ? formatDay(end) : "Present"}`;
}

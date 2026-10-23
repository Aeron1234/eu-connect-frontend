const displayDate = new Intl.DateTimeFormat("en-PH", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
});

function formatDay(value) {
  const day = typeof value === "string" ? value.slice(0, 10) : "";
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(day)) return "—";
  const date = new Date(day + "T00:00:00Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day) return "—";
  return displayDate.format(date);
}

export function formatAnnexDDuration(start, end) {
  return `${formatDay(start)} - ${end ? formatDay(end) : "Present"}`;
}

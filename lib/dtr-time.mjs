const timeZone = "Asia/Manila";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone,
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDateValue(value, formatter) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}

export function formatDtrTime(value) {
  return formatDateValue(value, timeFormatter);
}

export function formatDtrDate(value) {
  return formatDateValue(value, dateFormatter);
}

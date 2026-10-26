// Build local calendar-cell dates at noon rather than parsing date-only text as UTC.
// The separate Manila helper chooses today's application calendar day.
export function parseDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

// Format local Date components as YYYY-MM-DD; this does not convert an instant to Manila time.
export function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function manilaTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

// Pad the month to complete Sunday-starting weeks, including adjacent-month cells.
// Those cells do not imply that the current API response contains another month's data.
export function monthDates(month) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1, 12);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const last = new Date(y, m, 0, 12);
  const count = Math.ceil((last.getDate() + first.getDay()) / 7) * 7;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return dayKey(date);
  });
}

// Move a YYYY-MM month key by signed whole months, allowing Date to handle year rollover.
export function shiftMonth(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1, 12);
  return dayKey(date).slice(0, 7);
}

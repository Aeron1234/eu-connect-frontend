import { format, parseISO } from "date-fns";

// Format saved date-only fields for display; this helper assumes validated input.
// Missing or identical end dates display once rather than as a repeated range.
export function formatEventDateRange(start, end, pattern = "MMM d, yyyy") {
  if (!start) return "";
  const startDay = start.slice(0, 10);
  const endDay = end?.slice(0, 10);
  const first = format(parseISO(startDay), pattern);
  return endDay && endDay !== startDay
    ? first + " – " + format(parseISO(endDay), pattern)
    : first;
}

// Shorten repeated month/year text without changing the inclusive event endpoints.
export function formatCompactEventDateRange(start, end) {
  if (!start) return "";
  const first = parseISO(start.slice(0, 10));
  const last = parseISO((end || start).slice(0, 10));
  if (!end || start.slice(0, 10) === end.slice(0, 10)) return format(first, "MMM d, yyyy");
  if (first.getFullYear() !== last.getFullYear()) return formatEventDateRange(start, end);
  const lastPattern = first.getMonth() === last.getMonth() ? "d, yyyy" : "MMM d, yyyy";
  return format(first, "MMM d") + " – " + format(last, lastPattern);
}

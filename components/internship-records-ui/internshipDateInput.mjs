import { format, isValid, parse } from "date-fns";

// UI dates have one explicit format; the existing API still receives date-only
// ISO values. Strict round trips reject impossible dates and incomplete input.
export function parseInternshipInputDate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value || "")) return "";
  const date = parse(value, "MM/dd/yyyy", new Date(2000, 0, 1));
  return isValid(date) && format(date, "MM/dd/yyyy") === value ? format(date, "yyyy-MM-dd") : "";
}

export function formatInternshipInputDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  const date = parse(value, "yyyy-MM-dd", new Date(2000, 0, 1));
  return isValid(date) && format(date, "yyyy-MM-dd") === value ? format(date, "MM/dd/yyyy") : "";
}

export function maskInternshipInputDate(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join("/");
}

export function rotationSnapshots(value) {
  if (!value) return [];
  try { const rows = typeof value === "string" ? JSON.parse(value) : value; return Array.isArray(rows) ? rows : []; }
  catch { return []; }
}

export function rotationDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type).value).join("-");
}

export function suggestedRotations(rotations, from, to) {
  return from && to && to >= from ? rotations.filter(row => row.date_from <= to && row.date_to >= from).map(row => row.id) : [];
}

export function currentRotation(rotations, day = rotationDay()) {
  return rotations.find(row => row.date_from <= day && row.date_to >= day) || null;
}

export function rotationDate(day) {
  return day ? new Date(day + "T00:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }) : "";
}

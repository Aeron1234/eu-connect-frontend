const isCurrent = (record) => record?.status === "pending" || record?.status === "ongoing";

// Prefer the current-record response, merging any matching list fields beneath it.
// Without a current response, prefer an ongoing list entry over a pending one.
export function getCurrentInternshipRecord(records = [], active = null) {
  if (isCurrent(active)) {
    const listed = active.id == null ? null : records.find((record) => String(record.id) === String(active.id));
    return { ...listed, ...active };
  }
  return records.find((record) => record.status === "ongoing")
    || records.find((record) => record.status === "pending")
    || null;
}

// Preserve saved date-only strings for date inputs; format timestamp values
// as Philippine calendar dates when prefilling the form.
function inputDate(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Prefill only placement fields. Do not copy ownership, approval status,
// supervisor assignments or accumulated hours into the editable draft.
export function internshipRecordFields(record = {}) {
  return {
    company_name: record.company_name ?? "",
    company_address: record.company_address ?? "",
    city_name: record.city_name ?? "",
    province_name: record.province_name ?? "",
    internship_position: record.internship_position ?? "",
    company_website: record.company_website ?? "",
    description: record.description ?? "",
    date_started: inputDate(record.date_started),
    date_ended: inputDate(record.date_ended),
    total_hours: record.total_hours ?? "",
    semester: record.semester ?? "",
    lat: record.lat ?? "",
    lon: record.lon ?? "",
  };
}

const isCurrent = (record) => record?.status === "pending" || record?.status === "ongoing";

export function getCurrentInternshipRecord(records = [], active = null) {
  if (isCurrent(active)) {
    const listed = active.id == null ? null : records.find((record) => String(record.id) === String(active.id));
    return { ...listed, ...active };
  }
  return records.find((record) => record.status === "ongoing")
    || records.find((record) => record.status === "pending")
    || null;
}

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

export function internshipRecordFields(record = {}) {
  return {
    company_name: record.company_name ?? "",
    company_address: record.company_address ?? "",
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

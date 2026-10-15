const ROLE_LABELS = {
  student: "Student",
  employer: "Employer",
  department_head: "Dept. Head",
  admin: "Admin",
};

function toSentenceCase(str) {
  if (!str) return "";
  const spaced = str.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function toTitleCase(str) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatTimestamp(dateStr) {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseMetadata(metadata) {
  if (!metadata) return null;
  try {
    const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const POSTING_DETAIL_FIELDS = [
  ["company_name", "Company"],
  ["position", "Position title"],
  ["vacancies", "Vacancies"],
  ["location", "Location"],
  ["work_type", "Work type"],
  ["duration_hours", "Duration (hours)"],
  ["description", "Description"],
  ["requirements", "Requirements"],
  ["contact_name", "Contact person"],
  ["contact_email", "Contact email"],
  ["contact_phone", "Contact phone"],
  ["contact_website", "Contact website"],
  ["eligible_courses", "Eligible courses"],
];

function postingDetails(metadata) {
  if (!metadata) return [];
  const fields = POSTING_DETAIL_FIELDS.filter(([key]) => metadata[key] != null && metadata[key] !== "");
  if (!metadata.eligible_courses && Array.isArray(metadata.course_ids)) {
    fields.push(["course_ids", "Eligible course IDs"]);
  }
  return fields.map(([key, label]) => [label, Array.isArray(metadata[key]) ? metadata[key].join(", ") : String(metadata[key])]);
}

export { ROLE_LABELS, toSentenceCase, toTitleCase, formatTimestamp, parseMetadata, postingDetails };

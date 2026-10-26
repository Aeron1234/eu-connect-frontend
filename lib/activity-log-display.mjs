const ACTION_LABELS = {
  account_created: "Account created", account_deactivated: "Account deactivated", account_reactivated: "Account reactivated",
  announcement_created: "Announcement posted", announcement_updated: "Announcement updated", announcement_deleted: "Announcement deleted",
  internship_document_accepted: "Document accepted", internship_document_uploaded: "Document uploaded",
  internship_document_uploaded_on_behalf: "Document uploaded for a student", internship_document_deleted: "Document deleted",
  employer_evaluation_submitted: "Supervisor evaluation submitted", student_evaluation_submitted: "Performance evaluation submitted",
  evaluation_soft_deleted: "Evaluation deleted by its author", evaluation_permanently_deleted: "Evaluation permanently deleted",
  internship_posting_created: "Internship post created", internship_posting_updated: "Internship post updated", internship_posting_deleted: "Internship post deleted",
  internship_record_created: "Internship record created", internship_record_updated: "Internship record updated",
  internship_record_approved: "Internship record approved", internship_record_rejected: "Internship record rejected",
  internship_record_force_finished: "Internship marked finished by staff", internship_record_finished: "Internship finished",
  internship_record_deleted: "Internship record deleted",
  alumni_internship_record_created: "Alumni internship added", alumni_internship_record_updated: "Alumni internship updated", alumni_internship_record_deleted: "Alumni internship deleted",
  program_annual_report_created: "Annex C report created", program_annual_report_updated: "Annex C report updated", program_annual_report_deleted: "Annex C report deleted",
  supervisor_request_sent: "Supervisor request sent", supervisor_removed: "Supervisor removed",
  supervisor_request_cancelled: "Supervisor request cancelled", supervisor_request_rejected: "Supervisor request declined", supervisor_request_accepted: "Supervisor request accepted",
};
const MODULE_LABELS = {
  users: "Accounts", announcements: "Announcements", internship_documents: "Internship documents",
  employer_evaluation_masters: "Supervisor evaluations", student_evaluation_masters: "Performance evaluations",
  internship_postings: "Internship opportunities", internship_records: "Internship records",
  alumni_internship_records: "Past internships", program_annual_reports: "SIPP reports", supervisor_requests: "Supervision",
};
const FIELD_LABELS = {
  alumni_name: "Alumnus name", company_name: "Company name", company_address: "Company address",
  industry: "Industry", internship_position: "Position title", position: "Position title",
  course_id: "Course", course_ids: "Eligible courses", batch_year: "Graduation year", academic_year: "Academic year",
  total_hours: "Required hours", accumulated_hours: "Completed hours", supervisor_name: "Supervisor name", notes: "Notes",
  category_id: "Category", title: "Title", content: "Content", event_date: "Event start date", event_end_date: "Event end date",
  vacancies: "Vacancies", location: "Location", work_type: "Work type", duration_hours: "Duration in hours",
  description: "Description", requirements: "Requirements", contact_name: "Contact person", contact_email: "Contact email",
  contact_phone: "Contact phone", contact_website: "Contact website", status: "Status", date_started: "Start date",
  date_ended: "End date", region_id: "Region", department_id: "Department", employer_id: "Supervisor",
  lat: "Latitude", lon: "Longitude", city: "City or municipality", province: "Province", semester: "Semester",
};
const UPDATE_ACTIONS = new Set(["alumni_internship_record_updated", "announcement_updated", "internship_posting_updated"]);
const ROLES = { admin: "Admin", department_head: "Department head", student: "Student", employer: "Employer" };

export function humanizeActivityCode(value) {
  if (typeof value !== "string") return "";
  const words = value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : "";
}
export function activityActionLabel(action) {
  return Object.hasOwn(ACTION_LABELS, action || "") ? ACTION_LABELS[action] : humanizeActivityCode(action);
}
export function activityModuleLabel(type) {
  return Object.hasOwn(MODULE_LABELS, type || "") ? MODULE_LABELS[type] : humanizeActivityCode(type);
}
export function activityMetadata(value) {
  try {
    const data = typeof value === "string" ? JSON.parse(value) : value;
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch { return null; }
}
function fieldKeys(metadata) {
  return Array.isArray(metadata?.changed_fields)
    ? [...new Set(metadata.changed_fields.filter(key => typeof key === "string" && /^[a-z_]+$/i.test(key) && key.length <= 80))]
    : [];
}
export function activityUpdateFields(log) {
  if (!UPDATE_ACTIONS.has(log?.action)) return [];
  return fieldKeys(activityMetadata(log.metadata)).map(key =>
    Object.hasOwn(FIELD_LABELS, key) ? FIELD_LABELS[key] : humanizeActivityCode(key).replace(/\b[Ii]ds?$/, "").trim(),
  ).filter(Boolean);
}
export function activityDescription(log) {
  if (!log) return "";
  let description = typeof log.description === "string" ? log.description.trim() : "";
  if (UPDATE_ACTIONS.has(log.action)) {
    const metadata = activityMetadata(log.metadata), fields = fieldKeys(metadata);
    const suffix = " (" + fields.join(", ") + ").";
    if (fields.length && description.endsWith(suffix)) description = description.slice(0, -suffix.length) + ".";
    else if (!fields.length) {
      const ending = description.match(/\s+\(([^()]*)\)\.$/);
      const codes = ending?.[1].split(/,\s*/);
      if (codes?.length && codes.some(code => code.includes("_")) && codes.every(code => Object.hasOwn(FIELD_LABELS, code))) description = description.slice(0, ending.index) + ".";
      else if (description.endsWith(" (no fields).")) description = description.slice(0, -" (no fields).".length) + ".";
    }
  }
  if (log.action === "account_created") description = description.replace(/^(Admin created a new )department_head( account)/, "$1department head$2");
  if (log.action === "internship_document_uploaded") description = description.replace(/\((before|after)\) for internship/, "($1 deployment) for internship");
  if (log.action === "internship_document_deleted") description = description.replace(/^(department_head|admin|employer|student)( deleted document)/, (_, role, rest) => ROLES[role] + rest);
  if (/^program_annual_report_(created|updated)$/.test(log.action || "")) description = description.replace(/ \(status: (draft|submitted)\)\.$/, (_, status) => status === "draft" ? " and saved it as a draft." : " and submitted it.");
  return description || activityActionLabel(log.action) || "Activity recorded";
}

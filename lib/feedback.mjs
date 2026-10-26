export const feedbackCategories = [
  { value: "platform_feedback", label: "Platform Feedback" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "internship_feedback", label: "Internship Feedback & Concerns" },
  { value: "general_feedback", label: "General Feedback" },
];
export const feedbackStatuses = [
  { value: "open", label: "Open" }, { value: "in_review", label: "In review" }, { value: "resolved", label: "Resolved" },
];
export function categoryLabel(value) { return feedbackCategories.find(c => c.value === value)?.label || "Feedback"; }
export function statusLabel(value) { return feedbackStatuses.find(s => s.value === value)?.label || "Open"; }
export function audienceDepartments(interns, selected) {
  return [...new Set(interns.filter(i => selected.includes(i.id)).map(i => i.department_code || i.department_name))].filter(Boolean).sort();
}
// Preview category/department labels for the user. The backend independently
// authorizes reads and computes actual recipients from current staff assignments.
export function feedbackAudience(category, departments = [], author = "you") {
  const heads = category === "general_feedback" ? ["all department heads"] :
    category === "internship_feedback" ? [...new Set(departments)].filter(Boolean).map(department => department + " Head") : [];
  return [author, "Admin", ...heads].join(", ");
}
export function canUseFeedback(role) { return ["employer", "department_head", "admin"].includes(role); }
export function canManageFeedback(role) { return ["department_head", "admin"].includes(role); }
export function validateFeedbackFiles(files) {
  if (files.length > 3) return "Choose up to three attachments.";
  if (files.some(f => f.size > 5 * 1024 * 1024)) return "Each attachment must be 5 MB or smaller.";
  if (files.some(f => !["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(f.type))) return "Choose PDF, PNG, JPG, or WebP files.";
  return "";
}

// Merge older loaded replies only for the same post and visible reply revision.
// A revision change replaces history so edited/deleted rows cannot be merged back.
// Employers receive public revisions; staff-only changes advance a separate revision.
export function mergeFeedbackDetail(previous, next) {
  if (!previous?.post?.id || previous.post.id !== next?.post?.id || previous.post.reply_version !== next.post.reply_version) return next;
  const replies = new Map();
  for (const reply of [...(previous.replies || []), ...(next.replies || [])]) replies.set(reply.id, reply);
  return { ...next, replies: [...replies.values()].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime() || a.id.localeCompare(b.id)) };
}

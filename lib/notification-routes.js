const TYPE_ROUTES = {
  announcement: "/announcements",
  calendar_schedule: "/calendar",
  internship_record_request: "/department_head/internship-records",
  internship_record_approved: "/student/internship-record",
  internship_record_finished: "/department_head/internship-records",
  internship_record_rejected: "/student/internship-record",
  evaluation_submitted: "/department_head/evaluations",
  evaluation_deleted: "/department_head/evaluations",
  certificate_uploaded: "/student/storage",
};

// Resolve a notification's type-specific destination, using public IDs where available.
// Return null when no supported/actionable link can be built; navigation callers handle it.
export function getNotificationTargetPath(item) {
  if (item.type === "dtr_location_set") {
    // New location alerts have fixed, role-appropriate links. Legacy alerts
    // without that field remain readable in Notifications.
    if (item.link === "/dtr-locations") return "/dtr-restrictions";
    return ["/student", "/dtr-restrictions"].includes(item.link) ? item.link : "/notifications";
  }
  if (item.type === "dtr_shift_schedule") return "/student";
  if (["dtr_overtime_request", "dtr_overtime_decision", "dtr_wall_warning", "dtr_auto_close"].includes(item.type)) {
    return item.link === "/users" && item.link_uuid
      ? `/users/${encodeURIComponent(item.link_uuid)}?tab=dtr`
      : "/student";
  }
  if (["feedback_mentioned", "feedback_reply", "feedback_status"].includes(item.type)) {
    const id = item.link_uuid || item.link;
    return id ? `/feedback?post=${encodeURIComponent(id)}` : "/feedback";
  }
  if (item.type === "certificate_accepted" || item.type === "certificate_rejected") {
    return item.link_uuid
      ? `/users/${encodeURIComponent(item.link_uuid)}?tab=certificates`
      : null;
  }
  const route = TYPE_ROUTES[item.type];
  if (!route) return null;
  if (item.type === "evaluation_submitted" || item.type === "evaluation_deleted") {
    if (item.link && item.link_uuid) return `${route}/${encodeURIComponent(item.link)}?evaluationId=${encodeURIComponent(item.link_uuid)}`;
    if (item.link_uuid) return `${route}?evaluationId=${encodeURIComponent(item.link_uuid)}`;
    return item.link ? `${route}?internshipId=${encodeURIComponent(item.link)}` : route;
  }
  if (item.type === "announcement") {
    const id = item.link_uuid || item.link;
    return id ? `${route}?announcement=${encodeURIComponent(id)}` : route;
  }
  if (item.type === "internship_record_request") {
    const id = item.link_uuid || item.link;
    return id ? `${route}/${encodeURIComponent(id)}` : null;
  }
  if (item.type === "internship_record_finished") {
    const id = item.link_uuid || item.link;
    return id ? `${route}/${encodeURIComponent(id)}` : null;
  }
  if (item.type === "calendar_schedule") {
    return item.link ? `${route}?schedule=${encodeURIComponent(item.link)}` : route;
  }
  return route;
}

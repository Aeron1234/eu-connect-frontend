const TYPE_ROUTES = {
  announcement: "/announcements",
  calendar_schedule: "/calendar",
  internship_record_request: "/internship-records",
  internship_record_rejected: "/student/internship-record",
  evaluation_submitted: "/student/evaluations?filter=pending-confirmation",
  certificate_uploaded: "/student/storage",
};

export function getNotificationTargetPath(item) {
  const route = TYPE_ROUTES[item.type];
  if (!route) return null;
  if (item.type === "announcement") {
    const id = item.link_uuid || item.link;
    return id ? `${route}?announcement=${encodeURIComponent(id)}` : route;
  }
  if (item.type === "internship_record_request") {
    return item.link_uuid ? `${route}/${item.link_uuid}` : null;
  }
  if (item.type === "calendar_schedule") {
    return item.link ? `${route}?schedule=${encodeURIComponent(item.link)}` : route;
  }
  return route;
}

const TYPE_ROUTES = {
  announcement: "/announcements",
  calendar_schedule: "/calendar",
  internship_record_request: "/internship-records",
  internship_record_rejected: "/student/internship-record",
  evaluation_submitted: "/student/evaluations?filter=pending-confirmation",
  certificate_uploaded: "/student/storage",
};

export function getNotificationTargetPath(item) {
  if (item.type === "certificate_accepted" || item.type === "certificate_rejected") {
    return item.link_uuid
      ? `/users/${encodeURIComponent(item.link_uuid)}?tab=certificates`
      : null;
  }
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

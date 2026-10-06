const TYPE_ROUTES = {
  announcement: "/announcements",
  internship_record_request: "/internship-records",
  internship_record_rejected: "/student/internship-record",
  evaluation_submitted: "/student/evaluations?filter=pending-confirmation",
  certificate_uploaded: "/student/storage",
};

export function getNotificationTargetPath(item) {
  const route = TYPE_ROUTES[item.type];
  if (!route) return null;
  if (item.type === "internship_record_request") {
    return item.link_uuid ? `${route}/${item.link_uuid}` : null;
  }
  return route;
}

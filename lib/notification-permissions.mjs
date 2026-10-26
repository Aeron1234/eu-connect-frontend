export function canDeleteNotification(item) {
  if (!item) return false;
  if (item.type !== "supervisor_request_submitted") return true;
  // Prefer the backend's current eligibility check: even a pending request
  // can become obsolete after cancellation, reassignment, completion or deletion.
  // Older payloads fall back conservatively to actionable and request_status.
  if (typeof item.can_delete === "boolean") return item.can_delete;
  return !item.actionable && item.request_status !== "pending";
}

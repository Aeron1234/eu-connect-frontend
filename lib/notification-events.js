// A local mutation can change both the header badge and the open inbox page.
// Socket events are handled by each view directly; this event covers actions
// taken in either view without depending on a Next.js layout rerender.
export const NOTIFICATIONS_CHANGED = "eu-connect:notifications-changed";

export function notifyNotificationsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
  }
}

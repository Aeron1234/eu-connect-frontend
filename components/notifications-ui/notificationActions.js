"use client";

import { toast } from "sonner";
import { openAnnouncementNotification } from "@/lib/server-actions/notifications-actions";
import { userProfileKeys } from "@/lib/cache/user-profile-queries";
import { studentRecordsKeys } from "@/lib/cache/student-records-queries";

export function invalidateNotificationTarget(queryClient, userId, notification) {
  if (notification?.type === "dtr_location_set") {
    for (const key of ["bulk-dtr-locations", "dashboard-overview", "user-profile", "internship-records"]) {
      void queryClient.invalidateQueries({ queryKey: [key, String(userId)] });
    }
  }
  if (notification?.type === "internship_record_approved") {
    // The student may still have a freshly cached pending record when the
    // approval arrives. Invalidate only this viewer's My Records before opening.
    void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.all(userId) });
  }
  if (["feedback_mentioned", "feedback_reply", "feedback_status"].includes(notification?.type)) {
    void queryClient.invalidateQueries({ queryKey: ["feedback", String(userId)] });
  }
  if (["evaluation_submitted", "evaluation_deleted"].includes(notification?.type) && notification.link) {
    void queryClient.invalidateQueries({ queryKey: ["internship-records", String(userId), "detail", String(notification.link), "evaluations"] });
  }
  if ((notification?.type === "certificate_accepted" || notification?.type === "certificate_rejected") && notification.link_uuid) {
    void queryClient.invalidateQueries({
      queryKey: userProfileKeys.tab(userId, notification.link_uuid, "certificates"),
    });
  }
}

// Resolve the announcement and access at click time instead of trusting a cached link.
// A 410 refreshes the inbox without navigating; other failures leave the item available.
export async function openAnnouncementFromNotification(notificationId, { onUnavailable, onOpen }) {
  try {
    const result = await openAnnouncementNotification(notificationId);
    if (result.status === 410) {
      toast.info(result.error || "This announcement is no longer available.");
      onUnavailable?.();
      return;
    }
    if (!result.success || !result.announcementId) {
      toast.error(result.error || "Could not open this announcement.");
      return;
    }
    onOpen(result.announcementId);
  } catch (error) {
    console.error("Could not open announcement notification:", error);
    toast.error("Could not open this announcement. Please try again.");
  }
}

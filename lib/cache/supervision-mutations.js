"use client";

import { dashboardOverviewKeys } from "./dashboard-overview-queries";
import { dashboardListsKeys } from "./dashboard-lists-queries";
import { notificationsKeys, updateNotificationInboxes } from "./notifications-queries";

export async function refreshSupervisionAfterResponse(queryClient, userId, { requestId, studentId, decision }) {
  // Refresh this employer's accepted assignments, overview and inbox after a response.
  // The dashboard lists assignments only; pending requests stay in Notifications.
  const keys = [
    dashboardOverviewKeys.role(userId, "employer"),
    dashboardListsKeys.employerInternsAll(userId),
    notificationsKeys.all(userId),
    studentId ? ["user-profile", String(userId), String(studentId)] : ["user-profile", String(userId)],
  ];
  // An older read must not restore unanswered controls after a confirmed write.
  await Promise.all(keys.map(queryKey => queryClient.cancelQueries({ queryKey })));
  // Update every cached inbox scope before refetching so the answered request
  // becomes dismissible immediately after the confirmed write.
  updateNotificationInboxes(queryClient, userId, page => ({
    ...page,
    data: page.data.map(item =>
      item.type === "supervisor_request_submitted" && String(item.link_uuid || item.link) === String(requestId)
        ? { ...item, actionable: false, can_delete: true, request_status: decision === "accept" ? "accepted" : "rejected" }
        : item),
  }));
  await Promise.all(keys.map(queryKey => queryClient.invalidateQueries({ queryKey })));
}

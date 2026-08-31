"use client";

import { useTransition } from "react";
import { markAsRead } from "../app/_services/general-actions";
import InboxAnnouncementItem from "../app/_components/InboxAnnouncementItem";
import InboxApprovalItem from "../app/_components/InboxApprovalItem";
import InboxStatus from "../app/_components/InboxStatus";

function NotificationItem({
  item: notificationData,
  notifications,
  setNotifications,
}) {
  const [isPending, startTransition] = useTransition();

  function handleMarkAsRead(notification_id) {
    if (notificationData?.is_read) return;

    setNotifications((prev) =>
      prev.map((item) =>
        item.notification_id === notification_id
          ? { ...item, is_read: 1 }
          : item,
      ),
    );

    startTransition(async () => await markAsRead(notification_id));
  }

  if (notificationData.category === "announcement") {
    return (
      <InboxAnnouncementItem
        notificationData={notificationData}
        handleMarkAsRead={handleMarkAsRead}
        isPending={isPending}
      />
    );
  }

  if (notificationData.category === "approval") {
    return (
      <InboxApprovalItem
        notificationData={notificationData}
        handleMarkAsRead={handleMarkAsRead}
      />
    );
  }

  if (notificationData.category === "evaluation_submission") {
    if (notificationData.status === "deleted") {
      return (
        <InboxStatus
          notificationData={notificationData}
          handleMarkAsRead={handleMarkAsRead}
        />
      );
    }

    return (
      // <InboxApprovalItem
      //   notificationData={notificationData}
      //   handleMarkAsRead={handleMarkAsRead}
      // />
      <div>Evaluation submission placeholder</div>
    );
  }

  // For record(s) that have been approved or rejected
  if (notificationData.category === "record_status") {
    return (
      <InboxStatus
        notificationData={notificationData}
        handleMarkAsRead={handleMarkAsRead}
      />
    );
  }
}

export default NotificationItem;

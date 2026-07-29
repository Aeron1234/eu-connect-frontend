"use client";

import { useTransition } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { togglePinAnnouncement } from "../_services/dept-head-actions";
import { toastAndAction } from "../_services/helpers";

function AnnouncementTogglePin({ announcementId, is_pinned }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: `${!is_pinned ? "Pinning" : "Unpinning"} announcement...`,
      successLabel: `Announcement was ${!is_pinned ? "pinned" : "unpinned"}.`,
      errorLabel: `Failed to ${!is_pinned ? "pin" : "unpin"} the announcement.`,
      action: togglePinAnnouncement,
      formData,
    };

    startTransition(async () => {
      await toastAndAction(handlers);
    });
  }

  return (
    <AnnouncementForm
      type="pin"
      announcementId={announcementId}
      is_pinned={is_pinned}
      handleAction={handleAction}
      isPending={isPending}
    />
  );
}

export default AnnouncementTogglePin;

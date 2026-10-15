"use client";

import { useTransition } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { togglePinAnnouncement } from "@/lib/server-actions/announcements-actions";
import { toastAndAction } from "../../lib/helpers";

function AnnouncementTogglePin({ announcementId, is_pinned, onChanged }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: `${!is_pinned ? "Pinning" : "Unpinning"} announcement...`,
      successLabel: `Announcement was ${!is_pinned ? "pinned" : "unpinned"}.`,
      errorLabel: `Failed to ${!is_pinned ? "pin" : "unpin"} the announcement.`,
      action: togglePinAnnouncement,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success && onChanged) onChanged();
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

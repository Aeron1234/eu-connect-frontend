"use client";

import { useTransition } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { toastAndAction } from "../../lib/helpers";
import { deleteAnnouncement } from "@/lib/server-actions/announcements-actions";

function AnnouncementDelete({ announcementId, onChanged }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Deleting announcement...",
      successLabel: "Announcement deleted.",
      errorLabel: "Failed to delete.",
      action: deleteAnnouncement,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success && onChanged) onChanged();
    });
  }

  return (
    <AnnouncementForm
      type="delete"
      handleAction={handleAction}
      isPending={isPending}
      announcementId={announcementId}
    />
  );
}

export default AnnouncementDelete;

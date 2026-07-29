"use client";

import { useTransition } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { toastAndAction } from "../_services/helpers";
import { deleteAnnouncement } from "../_services/dept-head-actions";

function AnnouncementDelete({ announcementId }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    const handlers = {
      loadingLabel: "Deleting announcement...",
      successLabel: "Announcement deleted.",
      errorLabel: "Failed to delete.",
      action: deleteAnnouncement,
      formData,
    };

    startTransition(async () => {
      await toastAndAction(handlers);
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

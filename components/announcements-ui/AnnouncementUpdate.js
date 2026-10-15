"use client";

import { useTransition } from "react";
import AnnouncementForm from "./AnnouncementForm";
import { toastAndAction } from "../../lib/helpers";
import { updateAnnouncement } from "@/lib/server-actions/announcements-actions";

function AnnouncementUpdate({ data = null, categories, onChanged }) {
  const [isPending, startTransition] = useTransition();

  function handleAction(formData) {
    formData.append("id", data.id);

    const handlers = {
      loadingLabel: "Posting announcement...",
      successLabel: "Announcement was posted.",
      errorLabel: "Updating announcement failed.",
      action: updateAnnouncement,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success && onChanged) onChanged();
    });
  }

  return (
    <AnnouncementForm
      categories={categories}
      isPending={isPending}
      handleAction={handleAction}
      type={"edit"}
      data={data}
    />
  );
}

export default AnnouncementUpdate;
